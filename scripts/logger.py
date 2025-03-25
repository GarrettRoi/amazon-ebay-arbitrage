"""
Logger module for Amazon to eBay Arbitrage System
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from config import LOGGING_CONFIG

def setup_logger():
    """Set up and configure the logger"""
    
    # Ensure log directory exists
    log_dir = os.path.dirname(LOGGING_CONFIG['log_file'])
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, LOGGING_CONFIG['log_level']))
    
    # Remove existing handlers if any
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create file handler for logging to file
    file_handler = RotatingFileHandler(
        LOGGING_CONFIG['log_file'],
        maxBytes=LOGGING_CONFIG['max_log_size'],
        backupCount=LOGGING_CONFIG['backup_count']
    )
    
    # Create console handler for logging to console
    console_handler = logging.StreamHandler()
    
    # Create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
