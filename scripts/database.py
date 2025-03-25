"""
Database module for Amazon to eBay Arbitrage System
"""

import os
import sqlite3
import logging
from config import DATABASE_CONFIG

logger = logging.getLogger(__name__)

class ArbitrageDatabase:
    """Database handler for the arbitrage system"""
    
    def __init__(self, db_path=None):
        """Initialize the database connection"""
        if db_path is None:
            db_path = DATABASE_CONFIG['filename']
            
        # Ensure directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Connect to the database"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.cursor = self.conn.cursor()
            logger.info(f"Connected to database at {self.db_path}")
            return True
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            return False
            
    def close(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
            
    def setup_database(self):
        """Create database tables if they don't exist"""
        if not self.conn:
            self.connect()
            
        try:
            # Products table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asin TEXT UNIQUE,
                title TEXT,
                amazon_price REAL,
                ebay_price REAL,
                profit_margin REAL,
                category TEXT,
                image_url TEXT,
                description TEXT,
                is_listed BOOLEAN DEFAULT 0,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # eBay listings table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS ebay_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                ebay_item_id TEXT UNIQUE,
                listing_title TEXT,
                current_price REAL,
                quantity INTEGER DEFAULT 1,
                date_listed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
            ''')
            
            # Orders table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ebay_order_id TEXT UNIQUE,
                ebay_item_id TEXT,
                amazon_order_id TEXT,
                buyer_name TEXT,
                buyer_email TEXT,
                shipping_address TEXT,
                order_total REAL,
                order_status TEXT,
                date_ordered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_fulfilled TIMESTAMP,
                tracking_number TEXT,
                FOREIGN KEY (ebay_item_id) REFERENCES ebay_listings (ebay_item_id)
            )
            ''')
            
            # Profit tracking table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS profit_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                amazon_cost REAL,
                ebay_revenue REAL,
                ebay_fees REAL,
                paypal_fees REAL,
                net_profit REAL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            )
            ''')
            
            self.conn.commit()
            logger.info("Database tables created successfully")
            return True
        except sqlite3.Error as e:
            logger.error(f"Database setup error: {e}")
            return False
    
    def add_product(self, asin, title, amazon_price, ebay_price, profit_margin, 
                   category, image_url, description):
        """Add a new product to the database"""
        if not self.conn:
            self.connect()
            
        try:
            self.cursor.execute('''
            INSERT OR IGNORE INTO products 
            (asin, title, amazon_price, ebay_price, profit_margin, category, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (asin, title, amazon_price, ebay_price, profit_margin, 
                 category, image_url, description))
            
            self.conn.commit()
            return self.cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Error adding product: {e}")
            return None
            
    def get_unlisted_products(self, limit=50):
        """Get products that haven't been listed on eBay yet"""
        if not self.conn:
            self.connect()
            
        try:
            self.cursor.execute('''
            SELECT id, asin, title, amazon_price, ebay_price, profit_margin, 
                   category, image_url, description
            FROM products
            WHERE is_listed = 0
            ORDER BY profit_margin DESC
            LIMIT ?
            ''', (limit,))
            
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Error getting unlisted products: {e}")
            return []
            
    def update_product_listed_status(self, product_id, ebay_item_id, listing_title, price):
        """Update product as listed and add to ebay_listings table"""
        if not self.conn:
            self.connect()
            
        try:
            # Begin transaction
            self.conn.execute("BEGIN TRANSACTION")
            
            # Update product status
            self.cursor.execute('''
            UPDATE products
            SET is_listed = 1
            WHERE id = ?
            ''', (product_id,))
            
            # Add to ebay_listings
            self.cursor.execute('''
            INSERT INTO ebay_listings
            (product_id, ebay_item_id, listing_title, current_price)
            VALUES (?, ?, ?, ?)
            ''', (product_id, ebay_item_id, listing_title, price))
            
            # Commit transaction
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            self.conn.rollback()
            logger.error(f"Error updating product listing status: {e}")
            return False
            
    def add_order(self, ebay_order_id, ebay_item_id, buyer_name, buyer_email, 
                 shipping_address, order_total, order_status='new'):
        """Add a new eBay order to the database"""
        if not self.conn:
            self.connect()
            
        try:
            self.cursor.execute('''
            INSERT INTO orders
            (ebay_order_id, ebay_item_id, buyer_name, buyer_email, 
             shipping_address, order_total, order_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (ebay_order_id, ebay_item_id, buyer_name, buyer_email, 
                 shipping_address, order_total, order_status))
            
            self.conn.commit()
            return self.cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Error adding order: {e}")
            return None
            
    def update_order_fulfilled(self, ebay_order_id, amazon_order_id, tracking_number):
        """Update order as fulfilled with Amazon order details"""
        if not self.conn:
            self.connect()
            
        try:
            self.cursor.execute('''
            UPDATE orders
            SET amazon_order_id = ?, tracking_number = ?, 
                order_status = 'fulfilled', date_fulfilled = CURRENT_TIMESTAMP
            WHERE ebay_order_id = ?
            ''', (amazon_order_id, tracking_number, ebay_order_id))
            
            self.conn.commit()
            return self.cursor.rowcount > 0
        except sqlite3.Error as e:
            logger.error(f"Error updating order fulfillment: {e}")
            return False
            
    def get_pending_orders(self):
        """Get orders that need to be fulfilled on Amazon"""
        if not self.conn:
            self.connect()
            
        try:
            self.cursor.execute('''
            SELECT o.id, o.ebay_order_id, o.ebay_item_id, o.buyer_name, 
                   o.shipping_address, p.asin, p.amazon_price
            FROM orders o
            JOIN ebay_listings e ON o.ebay_item_id = e.ebay_item_id
            JOIN products p ON e.product_id = p.id
            WHERE o.order_status = 'new'
            ORDER BY o.date_ordered
            ''')
            
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            logger.error(f"Error getting pending orders: {e}")
            return []
            
    def record_profit(self, order_id, amazon_cost, ebay_revenue, ebay_fees, paypal_fees):
        """Record profit details for an order"""
        if not self.conn:
            self.connect()
            
        try:
            net_profit = ebay_revenue - amazon_cost - ebay_fees - paypal_fees
            
            self.cursor.execute('''
            INSERT INTO profit_tracking
            (order_id, amazon_cost, ebay_revenue, ebay_fees, paypal_fees, net_profit)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (order_id, amazon_cost, ebay_revenue, ebay_fees, paypal_fees, net_profit))
            
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            logger.error(f"Error recording profit: {e}")
            return False
