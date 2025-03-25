"""
Order Fulfillment module for Amazon to eBay Arbitrage System
"""

import logging
import time
import random
import json
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from config import ORDER_FULFILLMENT_CONFIG

logger = logging.getLogger(__name__)

class OrderFulfiller:
    """Class for fulfilling eBay orders by purchasing from Amazon"""
    
    def __init__(self, db=None):
        """Initialize the order fulfiller"""
        logger.info("Initializing Order Fulfiller")
        
        # Initialize database connection
        self.db = db
        
        # Initialize headless browser for Amazon purchases
        self.driver = self._initialize_browser()
        
        # Amazon credentials
        self.amazon_email = None
        self.amazon_password = None
        
        # Amazon login status
        self.amazon_logged_in = False
        
        logger.info("Order Fulfiller initialized")
        
    def _initialize_browser(self):
        """Initialize headless Chrome browser"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            logger.info("Browser initialized successfully")
            return driver
        except Exception as e:
            logger.error(f"Failed to initialize browser: {e}")
            return None
            
    def set_amazon_credentials(self, email, password):
        """Set Amazon login credentials"""
        self.amazon_email = email
        self.amazon_password = password
        logger.info("Amazon credentials set")
        
    def login_to_amazon(self):
        """Login to Amazon account"""
        if not self.driver:
            logger.error("Browser not initialized")
            return False
            
        if not self.amazon_email or not self.amazon_password:
            logger.error("Amazon credentials not set")
            return False
            
        try:
            # Navigate to Amazon login page
            self.driver.get("https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0")
            
            # Wait for email field and enter email
            email_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "ap_email"))
            )
            email_field.clear()
            email_field.send_keys(self.amazon_email)
            
            # Click continue button
            continue_button = self.driver.find_element(By.ID, "continue")
            continue_button.click()
            
            # Wait for password field and enter password
            password_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "ap_password"))
            )
            password_field.clear()
            password_field.send_keys(self.amazon_password)
            
            # Click sign-in button
            signin_button = self.driver.find_element(By.ID, "signInSubmit")
            signin_button.click()
            
            # Check if login was successful
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "nav-link-accountList"))
                )
                self.amazon_logged_in = True
                logger.info("Successfully logged in to Amazon")
                return True
            except TimeoutException:
                # Check for OTP verification
                if "Two-Step Verification" in self.driver.page_source or "Authentication required" in self.driver.page_source:
                    logger.error("Amazon requires two-factor authentication. Manual login required.")
                else:
                    logger.error("Failed to login to Amazon. Check credentials.")
                return False
                
        except Exception as e:
            logger.error(f"Error logging in to Amazon: {e}")
            return False
            
    def process_orders(self):
        """Process pending eBay orders by purchasing from Amazon"""
        if not self.db or not self.db.conn:
            logger.error("Database connection not available")
            return False
            
        if not self.driver:
            logger.error("Browser not initialized")
            return False
            
        if not self.amazon_logged_in:
            logger.warning("Not logged in to Amazon. Attempting to login...")
            if not self.login_to_amazon():
                return False
                
        try:
            # Get pending orders from database
            pending_orders = self.db.get_pending_orders()
            logger.info(f"Found {len(pending_orders)} pending orders to process")
            
            # Process each order
            for order in pending_orders:
                order_id, ebay_order_id, ebay_item_id, buyer_name, shipping_address, asin, amazon_price = order
                
                # Purchase product on Amazon
                amazon_order_id, tracking_number = self._purchase_on_amazon(
                    asin=asin,
                    shipping_address=shipping_address,
                    buyer_name=buyer_name
                )
                
                if amazon_order_id:
                    # Update order as fulfilled in database
                    self.db.update_order_fulfilled(
                        ebay_order_id=ebay_order_id,
                        amazon_order_id=amazon_order_id,
                        tracking_number=tracking_number
                    )
                    
                    logger.info(f"Successfully fulfilled order {ebay_order_id} with Amazon order {amazon_order_id}")
                    
                    # Record profit
                    self._record_profit(order_id, amazon_price)
                    
                    # Avoid rate limiting and detection
                    time.sleep(random.uniform(5, 10))
                    
            return True
            
        except Exception as e:
            logger.error(f"Error processing orders: {e}")
            return False
            
    def _purchase_on_amazon(self, asin, shipping_address, buyer_name):
        """Purchase a product on Amazon"""
        try:
            # Navigate to product page
            self.driver.get(f"https://www.amazon.com/dp/{asin}")
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "productTitle"))
            )
            
            # Click Add to Cart button
            try:
                add_to_cart_button = self.driver.find_element(By.ID, "add-to-cart-button")
                add_to_cart_button.click()
            except NoSuchElementException:
                # Try alternative add to cart button
                add_to_cart_button = self.driver.find_element(By.ID, "submit.add-to-cart")
                add_to_cart_button.click()
                
            # Wait for confirmation and proceed to checkout
            try:
                # Check if there's a "Proceed to checkout" button on the add-to-cart confirmation
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.ID, "sw-ptc-form"))
                )
                proceed_to_checkout = self.driver.find_element(By.ID, "sw-ptc-form")
                proceed_to_checkout.submit()
            except TimeoutException:
                # Navigate to cart and then checkout
                self.driver.get("https://www.amazon.com/gp/cart/view.html")
                proceed_to_checkout = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.NAME, "proceedToRetailCheckout"))
                )
                proceed_to_checkout.click()
                
            # Wait for checkout page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "checkoutDisplayPage"))
            )
            
            # Enter shipping information
            self._enter_shipping_info(shipping_address, buyer_name)
            
            # Select shipping method (usually default is fine)
            self._select_shipping_method()
            
            # Select payment method (assuming default payment method is set)
            self._select_payment_method()
            
            # Mark as gift if configured
            if ORDER_FULFILLMENT_CONFIG['gift_wrap']:
                self._mark_as_gift(ORDER_FULFILLMENT_CONFIG['gift_message'])
                
            # Place order
            order_id, tracking_number = self._place_order()
            
            return order_id, tracking_number
            
        except Exception as e:
            logger.error(f"Error purchasing on Amazon: {e}")
            return None, None
            
    def _enter_shipping_info(self, shipping_address, buyer_name):
        """Enter shipping information on Amazon checkout page"""
        try:
            # Check if we need to enter a new address
            try:
                add_address_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.ID, "add-new-address-popover-link"))
                )
                add_address_button.click()
                
                # Wait for address form
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "address-ui-widgets-enterAddressFullName"))
                )
                
                # Parse shipping address
                address_parts = shipping_address.strip().split('\n')
                
                # Fill in recipient name
                name_field = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressFullName")
                name_field.clear()
                name_field.send_keys(buyer_name)
                
                # Fill in address line 1
                address_line1 = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressLine1")
                address_line1.clear()
                address_line1.send_keys(address_parts[1] if len(address_parts) > 1 else "")
                
                # Fill in address line 2 if available
                if len(address_parts) > 2 and not any(x in address_parts[2] for x in [',', 'USA', 'United States']):
                    address_line2 = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressLine2")
                    address_line2.clear()
                    address_line2.send_keys(address_parts[2])
                
                # Parse city, state, zip
                location_line = next((line for line in address_parts if ',' in line), "")
                if location_line:
                    location_parts = location_line.split(',')
                    
                    # Fill in city
                    city_field = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressCity")
                    city_field.clear()
                    city_field.send_keys(location_parts[0].strip())
                    
                    # Fill in state and zip
                    if len(location_parts) > 1:
                        state_zip = location_parts[1].strip().split(' ')
                        
                        # Select state
                        state_dropdown = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressStateOrRegion")
                        state_dropdown.send_keys(state_zip[0])
                        
                        # Fill in zip code
                        if len(state_zip) > 1:
                            zip_field = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressPostalCode")
                            zip_field.clear()
                            zip_field.send_keys(state_zip[1])
                
                # Fill in phone number (dummy number if not available)
                phone_field = self.driver.find_element(By.ID, "address-ui-widgets-enterAddressPhoneNumber")
                phone_field.clear()
                phone_field.send_keys("5555555555")  # Dummy phone number
                
                # Submit address form
                use_address_button = self.driver.find_element(By.ID, "address-ui-widgets-form-submit-button")
                use_address_button.click()
                
                # Wait for address to be applied
                WebDriverWait(self.driver, 10).until(
                    EC.invisibility_of_element_located((By.ID, "address-ui-widgets-form-submit-button"))
                )
                
            except TimeoutException:
                # Address form not found, may already have shipping address selected
                logger.info("Address form not found, continuing with selected address")
                
            return True
            
        except Exception as e:
            logger.error(f"Error entering shipping information: {e}")
            return False
            
    def _select_shipping_method(self):
        """Select shipping method on Amazon checkout page"""
        try:
            # Wait for shipping options to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "continue-bottom"))
            )
            
            # Click continue button to use default shipping method
            continue_button = self.driver.find_element(By.NAME, "continue-bottom")
            continue_button.click()
            
            # Wait for payment method page
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "checkoutDisplayPage"))
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error selecting shipping method: {e}")
            return False
            
    def _select_payment_method(self):
        """Select payment method on Amazon checkout page"""
        try:
            # Wait for payment options to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "continue-bottom"))
            )
            
            # Click continue button to use default payment method
            continue_button = self.driver.find_element(By.NAME, "continue-bottom")
            continue_button.click()
            
            # Wait for order review page
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "checkoutDisplayPage"))
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error selecting payment method: {e}")
            return False
            
    def _mark_as_gift(self, gift_message=""):
        """Mark order as gift on Amazon checkou<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>