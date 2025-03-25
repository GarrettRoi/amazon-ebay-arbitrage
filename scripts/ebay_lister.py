"""
eBay Listing module for Amazon to eBay Arbitrage System
"""

import logging
import time
import random
import json
from datetime import datetime, timedelta
from ebaysdk.trading import Connection as Trading
from ebaysdk.exception import ConnectionError
from config import EBAY_CONFIG, EBAY_LISTING_CONFIG

logger = logging.getLogger(__name__)

class EbayLister:
    """Class for creating and managing eBay listings"""
    
    def __init__(self, db=None):
        """Initialize the eBay lister"""
        logger.info("Initializing eBay Lister")
        
        # Initialize database connection
        self.db = db
        
        # Initialize eBay API connection
        self.api = self._initialize_ebay_api()
        
        # Template for eBay listing description
        self.description_template = """
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #0066c0;">{title}</h1>
            <div style="display: flex; margin: 20px 0;">
                <div style="flex: 1;">
                    <img src="{image_url}" style="max-width: 100%; border: 1px solid #ddd; padding: 5px;" />
                </div>
                <div style="flex: 1; padding-left: 20px;">
                    <h2>Product Features</h2>
                    <ul>
                        {features}
                    </ul>
                </div>
            </div>
            <div style="margin: 20px 0;">
                <h2>Product Description</h2>
                <p>{description}</p>
            </div>
            <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Shipping Information</h3>
                <p>We ship within 1 business day of payment. Most items arrive within 3-5 business days.</p>
                <p>Free shipping to the continental United States.</p>
            </div>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
                <h3>Return Policy</h3>
                <p>30-day money-back guarantee. Please contact us before returning any item.</p>
            </div>
        </div>
        """
        
        logger.info("eBay Lister initialized")
        
    def _initialize_ebay_api(self):
        """Initialize eBay Trading API connection"""
        try:
            api = Trading(
                domain=EBAY_CONFIG['domain'],
                appid=EBAY_CONFIG['app_id'],
                devid=EBAY_CONFIG['dev_id'],
                certid=EBAY_CONFIG['cert_id'],
                token=EBAY_CONFIG['token'],
                config_file=None,
                siteid=EBAY_CONFIG['siteid']
            )
            logger.info("eBay API connection initialized successfully")
            return api
        except Exception as e:
            logger.error(f"Failed to initialize eBay API: {e}")
            return None
            
    def list_products(self, limit=10):
        """List unlisted products on eBay"""
        if not self.api:
            logger.error("eBay API connection not available")
            return False
            
        if not self.db or not self.db.conn:
            logger.error("Database connection not available")
            return False
            
        try:
            # Get unlisted products from database
            unlisted_products = self.db.get_unlisted_products(limit)
            logger.info(f"Found {len(unlisted_products)} unlisted products")
            
            for product in unlisted_products:
                product_id, asin, title, amazon_price, ebay_price, profit_margin, category, image_url, description = product
                
                # Create eBay listing
                item_id = self._create_ebay_listing(
                    title=title,
                    description=description,
                    price=ebay_price,
                    image_url=image_url,
                    category=category
                )
                
                if item_id:
                    # Update product as listed in database
                    self.db.update_product_listed_status(
                        product_id=product_id,
                        ebay_item_id=item_id,
                        listing_title=title,
                        price=ebay_price
                    )
                    logger.info(f"Successfully listed product {asin} on eBay with item ID {item_id}")
                    
                    # Avoid rate limiting
                    time.sleep(random.uniform(1, 3))
                    
            return True
            
        except Exception as e:
            logger.error(f"Error listing products on eBay: {e}")
            return False
            
    def _create_ebay_listing(self, title, description, price, image_url, category):
        """Create a new eBay listing"""
        try:
            # Format description using template
            features = "<li>High quality product</li><li>Fast shipping</li><li>30-day returns</li>"
            formatted_description = self.description_template.format(
                title=title,
                image_url=image_url,
                features=features,
                description=description
            )
            
            # Map category to eBay category ID
            category_id = self._map_category_to_ebay(category)
            
            # Prepare listing data
            item = {
                "Item": {
                    "Title": title[:80],  # eBay title limit is 80 characters
                    "Description": formatted_description,
                    "PrimaryCategory": {"CategoryID": category_id},
                    "StartPrice": price,
                    "Quantity": 1,
                    "ConditionID": EBAY_LISTING_CONFIG['condition_id'],
                    "Country": EBAY_LISTING_CONFIG['country'],
                    "Currency": EBAY_LISTING_CONFIG['currency'],
                    "DispatchTimeMax": EBAY_LISTING_CONFIG['dispatch_time_max'],
                    "ListingDuration": EBAY_LISTING_CONFIG['listing_duration'],
                    "ListingType": EBAY_LISTING_CONFIG['listing_type'],
                    "PaymentMethods": EBAY_LISTING_CONFIG['payment_methods'],
                    "PictureDetails": {
                        "PictureURL": [image_url]
                    },
                    "ReturnPolicy": {
                        "ReturnsAcceptedOption": "ReturnsAccepted" if EBAY_LISTING_CONFIG['return_policy']['returns_accepted'] else "ReturnsNotAccepted",
                        "ReturnsWithinOption": EBAY_LISTING_CONFIG['return_policy']['returns_within'],
                        "RefundOption": EBAY_LISTING_CONFIG['return_policy']['refund'],
                        "ShippingCostPaidByOption": EBAY_LISTING_CONFIG['return_policy']['shipping_cost_paid_by']
                    },
                    "ShippingDetails": {
                        "ShippingType": "Flat",
                        "ShippingServiceOptions": {
                            "ShippingServicePriority": 1,
                            "ShippingService": EBAY_LISTING_CONFIG['shipping_service'],
                            "ShippingServiceCost": 0.0,
                            "FreeShipping": True
                        }
                    }
                }
            }
            
            # Add item to eBay
            response = self.api.execute('AddItem', item)
            
            if response.reply.Ack == 'Success' or response.reply.Ack == 'Warning':
                return response.reply.ItemID
            else:
                logger.error(f"eBay listing creation failed: {response.reply.Errors}")
                return None
                
        except ConnectionError as e:
            logger.error(f"eBay API connection error: {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating eBay listing: {e}")
            return None
            
    def _map_category_to_ebay(self, amazon_category):
        """Map Amazon category to eBay category ID"""
        # This is a simplified mapping, would need to be expanded in a real system
        category_mapping = {
            'Electronics': '293',
            'Home & Kitchen': '11700',
            'Toys & Games': '220',
            'Office Products': '58058',
            'Sports & Outdoors': '888',
            'Clothing': '11450',
            'Books': '267',
            'Beauty': '26395',
            'Health': '26395',
            'Jewelry': '281',
            'Automotive': '6000',
            'Baby': '2984',
            'Pet Supplies': '1281',
            'Tools & Home Improvement': '11700',
            'Grocery': '14308',
            'Industrial & Scientific': '12576',
            'Arts, Crafts & Sewing': '14339'
        }
        
        # Default to 'Everything Else' category if no match
        default_category = '10290'
        
        # Try to find a match in the mapping
        if amazon_category:
            for key in category_mapping:
                if key.lower() in amazon_category.lower():
                    return category_mapping[key]
                    
        return default_category
        
    def update_listings(self):
        """Update existing eBay listings with current prices"""
        if not self.api:
            logger.error("eBay API connection not available")
            return False
            
        if not self.db or not self.db.conn:
            logger.error("Database connection not available")
            return False
            
        try:
            # Get active eBay listings from database
            self.db.cursor.execute('''
            SELECT e.ebay_item_id, e.current_price, p.ebay_price
            FROM ebay_listings e
            JOIN products p ON e.product_id = p.id
            WHERE e.status = 'active' AND p.ebay_price != e.current_price
            ''')
            
            listings = self.db.cursor.fetchall()
            logger.info(f"Found {len(listings)} listings that need price updates")
            
            for listing in listings:
                ebay_item_id, current_price, new_price = listing
                
                # Update eBay listing price
                success = self._update_listing_price(ebay_item_id, new_price)
                
                if success:
                    # Update price in database
                    self.db.cursor.execute('''
                    UPDATE ebay_listings
                    SET current_price = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE ebay_item_id = ?
                    ''', (new_price, ebay_item_id))
                    
                    self.db.conn.commit()
                    logger.info(f"Updated price for eBay item {ebay_item_id} from ${current_price} to ${new_price}")
                    
                    # Avoid rate limiting
                    time.sleep(random.uniform(1, 3))
                    
            return True
            
        except Exception as e:
            logger.error(f"Error updating eBay listings: {e}")
            return False
            
    def _update_listing_price(self, item_id, new_price):
        """Update the price of an existing eBay listing"""
        try:
            item = {
                "ItemID": item_id,
                "StartPrice": new_price
            }
            
            response = self.api.execute('ReviseItem', {"Item": item})
            
            if response.reply.Ack == 'Success' or response.reply.Ack == 'Warning':
                return True
            else:
                logger.error(f"eBay price update failed: {response.reply.Errors}")
                return False
                
        except ConnectionError as e:
            logger.error(f"eBay API connection error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error updating eBay listing price: {e}")
            return False
            
    def end_listing(self, item_id, reason="NotAvailable"):
        """End an eBay listing"""
        try:
            request = {
                "ItemID": item_id,
                "EndingReason": reason
            }
            
            response = self.api.execute('EndItem', request)
            
            if response.reply.Ack == 'Success' or response.reply.Ack == 'Warning':
                # Update listing status in database
                if self.db and self.db.conn:
                    self.db.cursor.execute('''
                    UPDATE ebay_listings
                    SET status = 'ended', last_updated = CURRENT_TIMESTAMP
                    WHERE ebay_item_id = ?
                    ''', (item_id,))
                    
                    self.db.conn.commit()
                    
                logger.info(f"Successfully ended eBay listing {item_id}")
                return True
            else:
                logger.error(f"Failed to end eBay listing: {response.reply.Errors}")
                return False
                
        except ConnectionError as e:
            logger.error(f"eBay API connection error: {e}")
            return False
        except Exception as e:
            logger.error(f"Error ending eBay listing: {e}")
            return False
            
    def get_ebay_orders(self, days_back=1):
        """Get recent orders from eBay"""
        try:
            # Calculate date range
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=days_back)
            
            # Format dates for eBay API
            start_time_str = start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
            end_time_str = end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
            
            # Prepare request
            request = {
                "CreateTimeFrom": start_time_str,
                "CreateTimeTo": end_time_str,
                "OrderStatus": "Completed",
                "Pagination": {
                    "EntriesPerPage": 100,
                    "PageNumber": 1
                }
            }
            
            # Execute request
            response = self.api.execute('GetOrders', request)
            
            if response.reply.Ack == 'Success' or response.reply.Ack == 'Warning':
                orders = []
                
                # Check if any orders exist
                if hasattr(response.reply, 'OrderArray') and hasattr(response.reply.OrderArray, 'Order'):
                    # Process orders
                    for order in response.reply.OrderArray.Order:
                        # Extract order details
                        order_data = {
                            'ebay_order_id': order.OrderID,
                            'order_status': order.OrderStatus,
                            'order_total': float(order.Total),
                            'buyer_name': f"{order.ShippingAddress.Name}",
                            'buyer_email': order.TransactionArray.Transaction[0].Buyer.Email if hasattr(order.TransactionArray.Transaction[0].Buyer, 'Email') else '',
                            'shipping_address': self._format_shipping_address(order.ShippingAddress),
                            'items': []
                        }
                        
                        # Extract item details
                        for transaction in order.TransactionArray.Transaction:
                            item = {
                                'ebay_item_id': transaction.Item.ItemID,
                                'title': transaction.Item.Title,
                                'price': float(transaction.TransactionPrice),
                                'quantity': int(transaction.QuantityPurchased)
                            }
                            order_data['items'].append(item)
                            
                        orders.append(order_data)
     <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>