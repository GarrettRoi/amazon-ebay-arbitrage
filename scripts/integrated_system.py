"""
System integration module for Amazon to eBay Arbitrage System
"""

import logging
import time
import threading
import queue
import json
import os
from datetime import datetime

from logger import setup_logger
from database import ArbitrageDatabase
from product_finder import ProductFinder
from price_calculator import PriceCalculator
from ebay_lister import EbayLister
from order_fulfiller import OrderFulfiller
from error_handler import ErrorHandler

logger = setup_logger()

class TaskScheduler:
    """Class for scheduling and executing tasks in the arbitrage system"""
    
    def __init__(self, error_handler=None):
        """Initialize the task scheduler"""
        self.tasks = {}
        self.task_queue = queue.Queue()
        self.running = False
        self.threads = []
        self.error_handler = error_handler or ErrorHandler()
        
    def add_task(self, name, function, interval_minutes, args=None, kwargs=None):
        """Add a task to the scheduler"""
        self.tasks[name] = {
            'function': function,
            'interval_minutes': interval_minutes,
            'last_run': None,
            'args': args or (),
            'kwargs': kwargs or {},
            'running': False
        }
        logger.info(f"Added task '{name}' with interval {interval_minutes} minutes")
        
    def start(self, num_workers=3):
        """Start the task scheduler"""
        if self.running:
            return
            
        self.running = True
        
        # Start worker threads
        for i in range(num_workers):
            thread = threading.Thread(target=self._worker, name=f"Worker-{i}")
            thread.daemon = True
            thread.start()
            self.threads.append(thread)
            
        # Start scheduler thread
        scheduler_thread = threading.Thread(target=self._scheduler, name="Scheduler")
        scheduler_thread.daemon = True
        scheduler_thread.start()
        self.threads.append(scheduler_thread)
        
        logger.info(f"Task scheduler started with {num_workers} workers")
        
    def stop(self):
        """Stop the task scheduler"""
        self.running = False
        
        # Wait for threads to finish
        for thread in self.threads:
            if thread.is_alive():
                thread.join(timeout=1)
                
        self.threads = []
        logger.info("Task scheduler stopped")
        
    def _scheduler(self):
        """Scheduler thread that checks for tasks to run"""
        while self.running:
            current_time = datetime.now()
            
            for name, task in self.tasks.items():
                # Skip if task is already running
                if task['running']:
                    continue
                    
                # Check if task should run
                if (task['last_run'] is None or 
                    (current_time - task['last_run']).total_seconds() >= task['interval_minutes'] * 60):
                    
                    # Mark task as running
                    task['running'] = True
                    
                    # Add task to queue
                    self.task_queue.put((name, task))
                    logger.debug(f"Scheduled task '{name}'")
                    
            # Sleep for a short time
            time.sleep(1)
            
    def _worker(self):
        """Worker thread that executes tasks"""
        while self.running:
            try:
                # Get task from queue
                name, task = self.task_queue.get(timeout=1)
                
                try:
                    # Execute task
                    logger.info(f"Executing task '{name}'")
                    task['function'](*task['args'], **task['kwargs'])
                    
                    # Update last run time
                    task['last_run'] = datetime.now()
                    
                    # Reset error count
                    self.error_handler.reset_error_count(name, "execution")
                    
                except Exception as e:
                    # Handle error
                    context = {
                        'task_name': name,
                        'args': str(task['args']),
                        'kwargs': str(task['kwargs'])
                    }
                    
                    retry = self.error_handler.handle_error(e, "TaskScheduler", f"task_{name}", context)
                    
                    if retry:
                        # Re-queue task after a delay
                        logger.info(f"Retrying task '{name}' after error")
                        time.sleep(60)  # Wait 1 minute before retry
                        self.task_queue.put((name, task))
                    else:
                        # Update last run time to prevent immediate retry
                        task['last_run'] = datetime.now()
                        
                finally:
                    # Mark task as not running
                    task['running'] = False
                    
                    # Mark task as done
                    self.task_queue.task_done()
                    
            except queue.Empty:
                # No tasks in queue
                pass
                
class IntegratedArbitrageSystem:
    """Integrated Amazon to eBay Arbitrage System with error handling and task scheduling"""
    
    def __init__(self, config_file=None):
        """Initialize the integrated arbitrage system"""
        logger.info("Initializing Integrated Amazon to eBay Arbitrage System")
        
        # Load configuration
        self.config = self._load_config(config_file)
        
        # Initialize error handler
        self.error_handler = ErrorHandler(config_file)
        
        # Initialize database
        self.db = ArbitrageDatabase()
        self.db.connect()
        self.db.setup_database()
        
        # Initialize components
        self.product_finder = ProductFinder(self.db)
        self.price_calculator = PriceCalculator(self.db)
        self.ebay_lister = EbayLister(self.db)
        self.order_fulfiller = OrderFulfiller(self.db)
        
        # Initialize task scheduler
        self.scheduler = TaskScheduler(self.error_handler)
        
        # Set Amazon credentials if provided
        if self.config.get('amazon_credentials'):
            creds = self.config['amazon_credentials']
            self.order_fulfiller.set_amazon_credentials(
                creds.get('email'),
                creds.get('password')
            )
            
        # System state
        self.running = False
        
        logger.info("Integrated Amazon to eBay Arbitrage System initialized")
        
    def _load_config(self, config_file):
        """Load configuration from file"""
        config = {
            'task_intervals': {
                'find_products': 720,  # 12 hours
                'update_prices': 240,  # 4 hours
                'list_products': 120,  # 2 hours
                'update_listings': 120,  # 2 hours
                'check_orders': 15,    # 15 minutes
                'process_orders': 30,   # 30 minutes
                'update_tracking': 360  # 6 hours
            },
            'amazon_credentials': {
                'email': None,
                'password': None
            },
            'num_workers': 3
        }
        
        if config_file and os.path.exists(config_file):
            try:
                with open(config_file, 'r') as f:
                    file_config = json.load(f)
                    
                # Update config with file values
                for key, value in file_config.items():
                    if key in config and isinstance(config[key], dict) and isinstance(value, dict):
                        config[key].update(value)
                    else:
                        config[key] = value
                        
                logger.info("Configuration loaded from file")
                
            except Exception as e:
                logger.error(f"Failed to load configuration: {e}")
                
        return config
        
    def setup_tasks(self):
        """Set up scheduled tasks"""
        intervals = self.config['task_intervals']
        
        # Add tasks to scheduler
        self.scheduler.add_task(
            'find_products',
            self.product_finder.find_products,
            intervals['find_products']
        )
        
        self.scheduler.add_task(
            'update_prices',
            self.price_calculator.update_prices,
            intervals['update_prices']
        )
        
        self.scheduler.add_task(
            'list_products',
            self.ebay_lister.list_products,
            intervals['list_products'],
            kwargs={'limit': 20}
        )
        
        self.scheduler.add_task(
            'update_listings',
            self.ebay_lister.update_listings,
            intervals['update_listings']
        )
        
        self.scheduler.add_task(
            'check_orders',
            self.ebay_lister.process_new_orders,
            intervals['check_orders']
        )
        
        self.scheduler.add_task(
            'process_orders',
            self.order_fulfiller.process_orders,
            intervals['process_orders']
        )
        
        self.scheduler.add_task(
            'update_tracking',
            self.order_fulfiller.update_tracking_numbers,
            intervals['update_tracking']
        )
        
        logger.info("Scheduled tasks set up")
        
    def start(self):
        """Start the integrated arbitrage system"""
        logger.info("Starting Integrated Amazon to eBay Arbitrage System")
        self.running = True
        
        # Login to Amazon if credentials are set
        if self.order_fulfiller.amazon_email and self.order_fulfiller.amazon_password:
            self.order_fulfiller.login_to_amazon()
        
        # Set up tasks
        self.setup_tasks()
        
        # Start task scheduler
        self.scheduler.start(num_workers=self.config.get('num_workers', 3))
        
        try:
            # Keep main thread alive
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("System shutdown requested")
        except Exception as e:
            logger.error(f"System error: {e}", exc_info=True)
        finally:
            self.shutdown()
    
    def shutdown(self):
        """Shutdown the integrated arbitrage system"""
        logger.info("Shutting down Integrated Amazon to eBay Arbitrage System")
        
        # Stop task scheduler
        self.scheduler.stop()
        
        # Close browser
        if self.order_fulfiller:
            self.order_fulfiller.close()
        
        # Close database connection
        if self.db:
            self.db.close()
        
        self.running = False
        logger.info("Integrated Amazon to eBay Arbitrage System shutdown complete")
        
    def generate_report(self, days=30):
        """Generate a profit report for the specified number of days"""
        if not self.db or not self.db.conn:
            logger.error("Database connection not available")
            return None
            
        try:
            # Get profit data from database
            self.db.cursor.execute('''
            SELECT 
                date(pt.date) as day,
                COUNT(pt.id) as order_count,
                SUM(pt.amazon_cost) as total_cost,
                SUM(pt.ebay_revenue) as total_revenue,
                SUM(pt.ebay_fees) as total_ebay_fees,
                SUM(pt.paypal_fees) as total_paypal_fees,
                SUM(pt.net_profit) as total_profit
            FROM profit_tracking pt
            WHERE pt.date >= date('now', ?)
            GROUP BY day
            ORDER BY day DESC
            ''', (f'-{days} days',))
            
            daily_profits = self.db.cursor.fetchall()
            
            # Calculate totals
            self.db.cursor.execute('''
            SELECT 
                COUNT(pt.id) as order_count,
                SUM(pt.amazon_cost) as total_cost,
                SUM(pt.ebay_revenue) as total_revenue,
                SUM(pt.ebay_fees) as total_ebay_fees,
                SUM(pt.paypal_fees) as total_paypal_fees,
                SUM(pt.net_profit) as total_profit
            FROM profit_tracking pt
            WHERE pt.date >= date('now', ?)
            ''', (f'-{days} days',))
            
            totals = self.db.cursor.fetchone()
            
            # Format report
            report = f"Profit Report for Last {days} Days\n"
            report += "=" * 80 + "\n\n"
            
            if totals:
                order_count, total_cost, total_revenue, total_ebay_fees, total_paypal_fees, total_profit = totals
                
                report += f"Total Orders: {order_count or 0}\n"
                report += f"Total Cost: ${total_cost or 0:.2f}\n"
                report += f"Total Revenue: ${total_revenue or 0:.2f}\n"
                report += f"Total eBay Fees: ${total_ebay_fees or 0:.2f}\n"
                report += f"Total PayPal Fees: ${total_paypal_fees or 0:.2f}\n"
                report += f"Total Profit: ${total_profit or 0:.2f}\n"
                
                if total_revenue and total_revenue > 0:
                    profit_margin = (total_profit / total_revenue) * 100
                    report += f"Overall Profit Margin: {profit_margin:.2f}%\n"
                    
                report += "\nDaily Breakdown:\n"
                report += "-" * 80 + "\n"
                report += f"{'Date':<12} {'Orders':<8} {'Cost':<12} {'Revenue':<12} {'Fees':<12} {'Profit':<12} {'Margin':<8}\n"
                report += "-" * 80 + "\n"
                
                for day in daily_profits:
                    day_str, count, cost, revenue, ebay_fees, paypal_fees, profit = day
                    fees = (ebay_fees or 0) + (paypal_fees or 0)
                    margin = (profit / revenue) * 100 if revenue and revenue > 0 else 0
                    
                    report += f"{day_str:<12} {count or 0:<8} ${cost or 0:<11.2f} ${revenue or 0:<11.2f} ${fees:<11.2f} ${profit or 0:<11.2f} {margin:<7.2f}%\n"
            else:
                report += "No profit data available for the specified period.\n"
                
            # Add error report
            report += "\n\n" + self.error_handler.get_error_report()
                
            return report
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return None
