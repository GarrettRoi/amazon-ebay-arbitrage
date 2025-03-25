"""
Deployment script for Amazon to eBay Arbitrage System
"""

import os
import sys
import argparse
import json
import logging
import subprocess
import time
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('deployment.log')
    ]
)

logger = logging.getLogger('deployment')

def create_config_file(config_path, amazon_email=None, amazon_password=None):
    """Create configuration file for the arbitrage system"""
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
            'email': amazon_email,
            'password': amazon_password
        },
        'num_workers': 3,
        'email': {
            'enabled': False,
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': '',
            'password': '',
            'from_email': '',
            'to_email': ''
        },
        'error_handling': {
            'max_retries': 3
        }
    }
    
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        logger.info(f"Configuration file created at {config_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to create configuration file: {e}")
        return False

def install_dependencies():
    """Install required dependencies"""
    try:
        logger.info("Installing required dependencies...")
        
        # Install Python packages
        subprocess.run([
            sys.executable, '-m', 'pip', 'install',
            'requests', 'beautifulsoup4', 'pandas', 'ebaysdk', 
            'python-amazon-paapi', 'selenium', 'webdriver-manager'
        ], check=True)
        
        # Install Chrome and ChromeDriver for Selenium
        subprocess.run([
            'apt-get', 'update'
        ], check=True)
        
        subprocess.run([
            'apt-get', 'install', '-y', 
            'chromium-browser', 'chromium-chromedriver'
        ], check=True)
        
        logger.info("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False

def setup_systemd_service(service_name, working_dir, user):
    """Set up systemd service for the arbitrage system"""
    try:
        service_content = f"""[Unit]
Description=Amazon to eBay Arbitrage System
After=network.target

[Service]
User={user}
WorkingDirectory={working_dir}
ExecStart={sys.executable} {os.path.join(working_dir, 'src/run.py')}
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier={service_name}
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
"""
        
        service_path = f"/etc/systemd/system/{service_name}.service"
        
        with open(service_path, 'w') as f:
            f.write(service_content)
            
        # Reload systemd
        subprocess.run(['systemctl', 'daemon-reload'], check=True)
        
        logger.info(f"Systemd service created at {service_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to set up systemd service: {e}")
        return False

def setup_monitoring(working_dir):
    """Set up monitoring script for the arbitrage system"""
    try:
        monitor_script = """#!/usr/bin/env python3
import os
import sys
import time
import json
import logging
import smtplib
import subprocess
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('monitor.log')
    ]
)

logger = logging.getLogger('monitor')

def load_config():
    """Load configuration from file"""
    try:
        with open('config.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        return {}

def check_process_running(service_name):
    """Check if the arbitrage system process is running"""
    try:
        result = subprocess.run(['systemctl', 'is-active', service_name], 
                               capture_output=True, text=True)
        return result.stdout.strip() == 'active'
    except Exception as e:
        logger.error(f"Failed to check process status: {e}")
        return False

def check_log_for_errors(log_file, hours=1):
    """Check log file for errors in the last N hours"""
    try:
        if not os.path.exists(log_file):
            logger.warning(f"Log file {log_file} does not exist")
            return []
            
        # Get timestamp for N hours ago
        now = datetime.now()
        hours_ago = now.timestamp() - (hours * 3600)
        
        errors = []
        with open(log_file, 'r') as f:
            for line in f:
                if 'ERROR' in line:
                    try:
                        # Parse timestamp from log line
                        timestamp_str = line.split(' - ')[0]
                        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S,%f')
                        
                        # Check if error is recent
                        if timestamp.timestamp() >= hours_ago:
                            errors.append(line.strip())
                    except Exception:
                        # If can't parse timestamp, include the error anyway
                        errors.append(line.strip())
                        
        return errors
    except Exception as e:
        logger.error(f"Failed to check log for errors: {e}")
        return []

def check_database_growth(db_file):
    """Check if database file is growing properly"""
    try:
        if not os.path.exists(db_file):
            logger.warning(f"Database file {db_file} does not exist")
            return False
            
        # Get file size
        size = os.path.getsize(db_file)
        
        # Check if file is too small (might indicate database corruption)
        if size < 1024:  # Less than 1KB
            logger.warning(f"Database file is suspiciously small: {size} bytes")
            return False
            
        return True
    except Exception as e:
        logger.error(f"Failed to check database growth: {e}")
        return False

def send_alert_email(config, subject, message):
    """Send alert email"""
    if not config.get('email', {}).get('enabled', False):
        logger.info("Email alerts not enabled")
        return False
        
    try:
        email_config = config['email']
        
        msg = MIMEMultipart()
        msg['From'] = email_config.get('from_email')
        msg['To'] = email_config.get('to_email')
        msg['Subject'] = subject
        
        msg.attach(MIMEText(message, 'plain'))
        
        server = smtplib.SMTP(email_config.get('smtp_server'), email_config.get('smtp_port'))
        server.starttls()
        server.login(email_config.get('username'), email_config.get('password'))
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Alert email sent to {email_config.get('to_email')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send alert email: {e}")
        return False

def main():
    """Main monitoring function"""
    config = load_config()
    service_name = 'arbitrage-system'
    log_file = '../logs/arbitrage.log'
    db_file = '../data/arbitrage_db.sqlite'
    
    # Check if process is running
    if not check_process_running(service_name):
        logger.error(f"Arbitrage system process is not running")
        
        # Send alert
        send_alert_email(
            config,
            "ALERT: Arbitrage System Down",
            f"The Amazon to eBay Arbitrage System process is not running. Please check the server."
        )
        
        # Try to restart the service
        try:
            subprocess.run(['systemctl', 'restart', service_name], check=True)
            logger.info(f"Attempted to restart {service_name}")
        except Exception as e:
            logger.error(f"Failed to restart service: {e}")
    
    # Check logs for errors
    errors = check_log_for_errors(log_file)
    if errors:
        logger.warning(f"Found {len(errors)} errors in the log")
        
        # Send alert if there are many errors
        if len(errors) > 10:
            error_text = "\\n".join(errors[:10]) + f"\\n...and {len(errors) - 10} more"
            send_alert_email(
                config,
                f"ALERT: {len(errors)} Errors in Arbitrage System",
                f"The Amazon to eBay Arbitrage System has encountered multiple errors:\\n{error_text}"
            )
    
    # Check database
    if not check_database_growth(db_file):
        logger.error("Database check failed")
        
        # Send alert
        send_alert_email(
            config,
            "ALERT: Arbitrage System Database Issue",
            f"The Amazon to eBay Arbitrage System database may be corrupted or not growing properly."
        )

if __name__ == "__main__":
    main()
"""
        
        monitor_path = os.path.join(working_dir, 'src/monitor.py')
        
        with open(monitor_path, 'w') as f:
            f.write(monitor_script)
            
        # Make script executable
        os.chmod(monitor_path, 0o755)
        
        # Set up cron job to run monitor every 15 minutes
        cron_job = f"*/15 * * * * {sys.executable} {monitor_path} >> {os.path.join(working_dir, 'monitor.log')} 2>&1"
        
        with open('/tmp/arbitrage_cron', 'w') as f:
            f.write(cron_job + "\n")
            
        subprocess.run(['crontab', '/tmp/arbitrage_cron'], check=True)
        
        logger.info(f"Monitoring script created at {monitor_path} and scheduled via cron")
        return True
    except Exception as e:
        logger.error(f"Failed to set up monitoring: {e}")
        return False

def create_run_script(working_dir):
    """Create run script for the arbitrage system"""
    try:
        run_script = """#!/usr/bin/env python3
import os
import sys
import argparse
import json
import logging
from integrated_system import IntegratedArbitrageSystem

def parse_arguments():
    parser = argparse.ArgumentParser(description='Amazon to eBay Arbitrage System')
    
    parser.add_argument('--config', default='../config.json', help='Path to configuration file')
    parser.add_argument('--report', type=int, help='Generate profit report for specified number of days')
    
    return parser.parse_args()

def main():
    args = parse_arguments()
    
    # Create system instance
    system = IntegratedArbitrageSystem(args.config)
    
    # Generate report if requested
    if args.report:
        report = system.generate_report(args.report)
        if report:
            print(report)
    else:
        # Start the system
        system.start()

if __name__ == "__main__":
    main()
"""
        
        run_path = os.path.join(working_dir, 'src/run.py')
        
        with open(run_path, 'w') as f:
            f.write(run_script)
            
        # Make script executable
        os.chmod(run_path, 0o755)
        
        logger.info(f"Run script created at {run_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to create run script: {e}")
        return False

def test_system(working_dir):
    """Run basic tests on the arbitrage system"""
    try:
        logger.info("Running basic system tests...")
        
        # Test database setup
        test_cmd = [
            sys.executable, '-c',
            'import sys; sys.path.append("src"); from database import ArbitrageDatabase; db = ArbitrageDatabase(); print("Database connection:", db.connect()); print("Database setup:", db.setup_database())'
        ]
        
        result = subprocess.run(test_cmd, cwd=working_dir, capture_output=True, text=True)
        logger.info(f"Database test result: {result.stdout}")
        
        if "Database connection: True" not in result.stdout or "Database setup: True" not in result.stdout:
            logger.error("Database test failed")
            return False
            
        # Test report generation
        test_cmd = [
            sys.executable, 'src/run.py', '--report', '30'
        ]
        
        result = subprocess.run(test_cmd, cwd=working_dir, capture_output=True, text=True)
        logger.info(f"Report test result: {result.stdout}")
        
        if "Profit Report for Last 30 Days" not in result.stdout:
            logger.warning("Report generation test may have issues")
            
        logger.info("Basic system tests completed")
        return True
    except Exception as e:
        logger.error(f"System tests failed: {e}")
        return False

def deploy_system(args):
    """Deploy the Amazon to eBay Arbitrage System"""
    working_dir = os.path.abspath(args.dir)
    
    logger.info(f"Deploying Amazon to eBay Arbitrage System to {working_dir}")
    
    # Create configuration file
    config_path = os.path.join(working_dir, 'config.json')
    if not create_config_file(config_path, args.amazon_email, args.amazon_password):
        return False
        
    # Install dependencies
    if args.install_deps and not install_dependencies():
        return False
        
    # Create run script
    if not create_run_script(working_dir):
        return False
        
    # Set up monitoring
    if not setup_monitoring(working_dir):
        return False
        
    # Set up systemd service if requested
    if args.systemd:
        if not setup_systemd_service(args.service_name, working_dir, args.user):
            return False
            
        # Enable and start service
        try:
            subprocess.run(['systemctl', 'enable', args.service_name], check=True)
            logger.info(f"Systemd service {args.service_name} enabled")
            
            if args.start:
                subprocess.run(['systemctl', 'start', args.service_name], check=True)
                logger.info(f"Systemd service {args.service_name} started")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to enable/start systemd service: {e}")
            return False
    
    # Run tests if requested
    if args.test:
        if not test_system(working_dir):
            logger.warning("System tests had issues, but continuing deployment")
    
    logger.info("Amazon to eBay Arbitrage System deployed successfully")
    return True

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Deploy Amazon to eBay Arbitrage System')
    
    parser.add_argument('--dir', default=os.getcwd(), help='Directory where the system is located')
    parser.add_argument('--amazon-email', help='Amazon account email')
    parser.add_argument('--amazon-password', help='Amazon account password')
    parser.add_argument('--install-deps', action='store_true', help='Install dependencies')
    parser.add_argument('--systemd', action='store_true', help='Set up systemd service')
    parser.add_argument('--service-name', default='arbitrage-system', help='Name for systemd service')
    parser.add_argument('--user', default=os.getenv('USER', 'ubuntu'), help='User to run the service as')
    parser.add_argument('--start', action='store_true', help=<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>