"""
Error handling module for Amazon to eBay Arbitrage System
"""

import logging
import traceback
import smtplib
import json
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Class for handling errors in the arbitrage system"""
    
    def __init__(self, config_file=None):
        """Initialize the error handler"""
        self.email_enabled = False
        self.email_config = {}
        self.error_counts = {}
        self.max_retries = 3
        
        # Load email configuration if provided
        if config_file and os.path.exists(config_file):
            self._load_config(config_file)
            
    def _load_config(self, config_file):
        """Load email configuration from file"""
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
                
            if 'email' in config:
                self.email_config = config['email']
                self.email_enabled = self.email_config.get('enabled', False)
                
            if 'error_handling' in config:
                self.max_retries = config['error_handling'].get('max_retries', 3)
                
            logger.info("Error handler configuration loaded")
            
        except Exception as e:
            logger.error(f"Failed to load error handler configuration: {e}")
            
    def handle_error(self, error, component, operation, context=None):
        """Handle an error that occurred in the system"""
        # Log the error
        error_id = f"{component}_{operation}"
        error_message = str(error)
        stack_trace = traceback.format_exc()
        
        logger.error(f"Error in {component} during {operation}: {error_message}")
        logger.debug(f"Stack trace: {stack_trace}")
        
        # Increment error count
        if error_id not in self.error_counts:
            self.error_counts[error_id] = 0
        self.error_counts[error_id] += 1
        
        # Send email notification for critical errors
        if self.email_enabled and self._is_critical_error(error, component, operation):
            self._send_error_email(error_message, component, operation, stack_trace, context)
            
        # Return whether to retry the operation
        return self._should_retry(error_id, error, component, operation)
        
    def _is_critical_error(self, error, component, operation):
        """Determine if an error is critical and requires notification"""
        # API authentication errors are critical
        if "authentication" in str(error).lower() or "unauthorized" in str(error).lower():
            return True
            
        # Payment-related errors are critical
        if "payment" in operation.lower() or "order" in operation.lower():
            return True
            
        # Database errors are critical
        if "database" in component.lower() and not "connection" in str(error).lower():
            return True
            
        # High error counts are critical
        error_id = f"{component}_{operation}"
        if error_id in self.error_counts and self.error_counts[error_id] >= self.max_retries:
            return True
            
        return False
        
    def _should_retry(self, error_id, error, component, operation):
        """Determine if an operation should be retried after an error"""
        # Don't retry if max retries exceeded
        if self.error_counts[error_id] > self.max_retries:
            return False
            
        # Don't retry authentication errors
        if "authentication" in str(error).lower() or "unauthorized" in str(error).lower():
            return False
            
        # Don't retry validation errors
        if "validation" in str(error).lower() or "invalid" in str(error).lower():
            return False
            
        # Retry network and timeout errors
        if "timeout" in str(error).lower() or "connection" in str(error).lower():
            return True
            
        # Default to retry for most errors
        return True
        
    def _send_error_email(self, error_message, component, operation, stack_trace, context):
        """Send an email notification about a critical error"""
        if not self.email_enabled or not self.email_config:
            return
            
        try:
            # Create email
            msg = MIMEMultipart()
            msg['From'] = self.email_config.get('from_email', 'arbitrage@example.com')
            msg['To'] = self.email_config.get('to_email', 'admin@example.com')
            msg['Subject'] = f"ALERT: Error in Amazon to eBay Arbitrage System - {component}"
            
            # Email body
            body = f"""
            <html>
            <body>
                <h2>Amazon to eBay Arbitrage System Error</h2>
                <p><strong>Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><strong>Component:</strong> {component}</p>
                <p><strong>Operation:</strong> {operation}</p>
                <p><strong>Error:</strong> {error_message}</p>
                
                <h3>Stack Trace:</h3>
                <pre>{stack_trace}</pre>
                
                <h3>Context:</h3>
                <pre>{json.dumps(context, indent=2) if context else 'No context provided'}</pre>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # Send email
            server = smtplib.SMTP(self.email_config.get('smtp_server', 'smtp.gmail.com'), 
                                 self.email_config.get('smtp_port', 587))
            server.starttls()
            server.login(self.email_config.get('username'), self.email_config.get('password'))
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Error notification email sent to {self.email_config.get('to_email')}")
            
        except Exception as e:
            logger.error(f"Failed to send error notification email: {e}")
            
    def reset_error_count(self, component, operation):
        """Reset the error count for a specific component and operation"""
        error_id = f"{component}_{operation}"
        if error_id in self.error_counts:
            self.error_counts[error_id] = 0
            
    def get_error_report(self):
        """Generate a report of error counts"""
        report = "Error Report\n"
        report += "=" * 50 + "\n"
        
        if not self.error_counts:
            report += "No errors recorded.\n"
        else:
            report += f"{'Component/Operation':<30} {'Error Count':<10}\n"
            report += "-" * 50 + "\n"
            
            for error_id, count in sorted(self.error_counts.items(), key=lambda x: x[1], reverse=True):
                report += f"{error_id:<30} {count:<10}\n"
                
        return report
