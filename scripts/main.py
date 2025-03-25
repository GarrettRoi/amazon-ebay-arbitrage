"""
Main module for Amazon to eBay Arbitrage System - Integrated Version
"""

import time
import logging
import argparse
import os
import sys
from datetime import datetime, timedelta

# Import modules
from logger import setup_logger
from database import ArbitrageDatabase
from product_finder import ProductFinder
from price_calculator import PriceCalculator
from ebay_lister import EbayLister
from order_fulfiller import OrderFulfiller
from config import ORDER_FULFILLMENT_CONFIG

# Set up logger
logger = setup_logger()

class ArbitrageSystem:
    """Main class for the integrated Amazon to eBay Arbitrage System"""
    
    def __init__(self, amazon_email=None, amazon_password=None):
        """Initialize the arbitrage system"""
        logger.info("Initializing Amazon to eBay Arbitrage System")
        
        # Initialize database
        self.db = ArbitrageDatabase()
        self.db.connect()
        self.db.setup_database()
        
        # Initialize components
        self.product_finder = ProductFinder(self.db)
        self.price_calculator = PriceCalculator(self.db)
        self.ebay_lister = EbayLister(self.db)
        self.order_fulfiller = OrderFulfiller(self.db)
        
        # Set Amazon credentials if provided
        if amazon_email and amazon_password:
            self.order_fulfiller.set_amazon_credentials(amazon_email, amazon_password)
            
        # System state
        self.running = False
        self.last_product_search = None
        self.last_price_update = None
        self.last_listing_update = None
        self.last_order_check = None
        self.last_tracking_update = None
        
        logger.info("Amazon to eBay Arbitrage System initialized")
        
    def start(self):
        """Start the arbitrage system"""
        logger.info("Starting Amazon to eBay Arbitrage System")
        self.running = True
        
        # Login to Amazon if credentials are set
        if self.order_fulfiller.amazon_email and self.order_fulfiller.amazon_password:
            self.order_fulfiller.login_to_amazon()
        
        try:
            # Main loop
            while self.running:
                self._run_cycle()
                time.sleep(60)  # Sleep for 1 minute between cycles
                
        except KeyboardInterrupt:
            logger.info("System shutdown requested")
        except Exception as e:
            logger.error(f"System error: {e}", exc_info=True)
        finally:
            self.shutdown()
    
    def _run_cycle(self):
        """Run a single cycle of the arbitrage system"""
        current_time = datetime.now()
        
        # Find profitable products (every 12 hours)
        if not self.last_product_search or (current_time - self.last_product_search) > timedelta(hours=12):
            logger.info("Running product finder")
            self.product_finder.find_products()
            self.last_product_search = current_time
            
        # Update prices (every 4 hours)
        if not self.last_price_update or (current_time - self.last_price_update) > timedelta(hours=4):
            logger.info("Running price calculator")
            self.price_calculator.update_prices()
            self.last_price_update = current_time
            
        # Create and update eBay listings (every 2 hours)
        if not self.last_listing_update or (current_time - self.last_listing_update) > timedelta(hours=2):
            logger.info("Running eBay lister")
            # Create new listings
            self.ebay_lister.list_products(limit=20)
            # Update existing listings
            self.ebay_lister.update_listings()
            self.last_listing_update = current_time
            
        # Check for new eBay orders (every 15 minutes)
        if not self.last_order_check or (current_time - self.last_order_check) > timedelta(minutes=ORDER_FULFILLMENT_CONFIG['check_orders_interval']):
            logger.info("Checking for new eBay orders")
            # Process new orders from eBay
            self.ebay_lister.process_new_orders()
            # Fulfill pending orders on Amazon
            self.order_fulfiller.process_orders()
            self.last_order_check = current_time
            
        # Update tracking numbers (every 6 hours)
        if not self.last_tracking_update or (current_time - self.last_tracking_update) > timedelta(hours=6):
            logger.info("Updating tracking numbers")
            self.order_fulfiller.update_tracking_numbers()
            self.last_tracking_update = current_time
    
    def shutdown(self):
        """Shutdown the arbitrage system"""
        logger.info("Shutting down Amazon to eBay Arbitrage System")
        
        # Close browser
        if self.order_fulfiller:
            self.order_fulfiller.close()
        
        # Close database connection
        if self.db:
            self.db.close()
        
        self.running = False
        logger.info("Amazon to eBay Arbitrage System shutdown complete")
        
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
                
                report += f"Total Orders: {order_count}\n"
                report += f"Total Cost: ${total_cost:.2f}\n"
                report += f"Total Revenue: ${total_revenue:.2f}\n"
                report += f"Total eBay Fees: ${total_ebay_fees:.2f}\n"
                report += f"Total PayPal Fees: ${total_paypal_fees:.2f}\n"
                report += f"Total Profit: ${total_profit:.2f}\n"
                
                if total_revenue > 0:
                    profit_margin = (total_profit / total_revenue) * 100
                    report += f"Overall Profit Margin: {profit_margin:.2f}%\n"
                    
                report += "\nDaily Breakdown:\n"
                report += "-" * 80 + "\n"
                report += f"{'Date':<12} {'Orders':<8} {'Cost':<12} {'Revenue':<12} {'Fees':<12} {'Profit':<12} {'Margin':<8}\n"
                report += "-" * 80 + "\n"
                
                for day in daily_profits:
                    day_str, count, cost, revenue, ebay_fees, paypal_fees, profit = day
                    fees = ebay_fees + paypal_fees
                    margin = (profit / revenue) * 100 if revenue > 0 else 0
                    
                    report += f"{day_str:<12} {count:<8} ${cost:<11.2f} ${revenue:<11.2f} ${fees:<11.2f} ${profit:<11.2f} {margin:<7.2f}%\n"
            else:
                report += "No profit data available for the specified period.\n"
                
            return report
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return None

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Amazon to eBay Arbitrage System')
    
    parser.add_argument('--amazon-email', help='Amazon account email')
    parser.add_argument('--amazon-password', help='Amazon account password')
    parser.add_argument('--report', type=int, help='Generate profit report for specified number of days')
    
    return parser.parse_args()

if __name__ == "__main__":
    # Parse command line arguments
    args = parse_arguments()
    
    # Create arbitrage system
    system = ArbitrageSystem(
        amazon_email=args.amazon_email,
        amazon_password=args.amazon_password
    )
    
    # Generate report if requested
    if args.report:
        report = system.generate_report(args.report)
        if report:
            print(report)
    else:
        # Start the system
        system.start()
