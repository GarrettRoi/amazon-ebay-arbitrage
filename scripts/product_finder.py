"""
Product Finder module for Amazon to eBay Arbitrage System
"""

import logging
import time
import random
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import pandas as pd
from amazon.paapi5.api.get_items_request import GetItemsRequest
from amazon.paapi5.api.get_items_resource import GetItemsResource
from amazon.paapi5.api.partner_type import PartnerType
from amazon.paapi5.api.search_items_request import SearchItemsRequest
from amazon.paapi5.api.search_items_resource import SearchItemsResource
from amazon.paapi5.api.condition import Condition
from amazon.paapi5.api.availability import Availability
from amazon.paapi5.api.delivery_flag import DeliveryFlag
from amazon.paapi5.api.merchant import Merchant
from amazon.paapi5.api.sort_by import SortBy
from amazon.paapi5.api.search_items_operation import SearchItemsOperation
from amazon.paapi5.api.get_items_operation import GetItemsOperation
from amazon.paapi5.api.partner_context import PartnerContext
from amazon.paapi5.api.client import Client

from config import AMAZON_CONFIG, PRODUCT_SEARCH_CONFIG
from database import ArbitrageDatabase

logger = logging.getLogger(__name__)

class ProductFinder:
    """Class for finding profitable products on Amazon for eBay arbitrage"""
    
    def __init__(self, db=None):
        """Initialize the product finder"""
        logger.info("Initializing Product Finder")
        
        # Initialize database connection
        self.db = db if db else ArbitrageDatabase()
        if not self.db.conn:
            self.db.connect()
            
        # Initialize Amazon API client
        self.amazon_client = self._initialize_amazon_client()
        
        # Initialize eBay price checker (will be implemented separately)
        self.ebay_price_checker = None
        
        logger.info("Product Finder initialized")
        
    def _initialize_amazon_client(self):
        """Initialize Amazon Product Advertising API client"""
        try:
            partner_context = PartnerContext(
                access_key=AMAZON_CONFIG['access_key'],
                secret_key=AMAZON_CONFIG['secret_key'],
                partner_tag=AMAZON_CONFIG['partner_tag'],
                partner_type=PartnerType[AMAZON_CONFIG['partner_type']],
                marketplace=AMAZON_CONFIG['marketplace'],
                region=AMAZON_CONFIG['region']
            )
            
            client = Client(partner_context)
            logger.info("Amazon API client initialized successfully")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Amazon API client: {e}")
            return None
            
    def find_products(self):
        """Main method to find profitable products"""
        logger.info("Starting product search")
        
        # Search in each configured category
        for category in PRODUCT_SEARCH_CONFIG['categories_to_search']:
            try:
                logger.info(f"Searching in category: {category}")
                
                # Search for products in the category
                products = self._search_amazon_category(category)
                
                # Filter products based on profitability
                profitable_products = self._filter_profitable_products(products)
                
                # Save profitable products to database
                self._save_products_to_database(profitable_products)
                
                # Avoid rate limiting
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                logger.error(f"Error searching category {category}: {e}")
                
        logger.info("Product search completed")
        
    def _search_amazon_category(self, category):
        """Search for products in a specific Amazon category"""
        try:
            # Create search request
            request = SearchItemsRequest()
            request.partner_tag = AMAZON_CONFIG['partner_tag']
            request.partner_type = PartnerType[AMAZON_CONFIG['partner_type']]
            
            # Set search parameters
            request.search_index = category
            request.item_count = PRODUCT_SEARCH_CONFIG['max_results_per_search']
            request.resources = [
                SearchItemsResource.ITEM_INFO,
                SearchItemsResource.OFFERS,
                SearchItemsResource.IMAGES,
                SearchItemsResource.BROWSE_NODE_INFO
            ]
            
            # Set filters
            request.min_price = PRODUCT_SEARCH_CONFIG['min_price']
            request.max_price = PRODUCT_SEARCH_CONFIG['max_price']
            request.merchant = Merchant.AMAZON
            request.availability = Availability.AVAILABLE
            request.delivery_flag = DeliveryFlag.PRIME
            request.sort_by = SortBy.PRICE_HIGH_TO_LOW
            
            # Execute search
            response = self.amazon_client.search_items(request)
            
            # Process response
            products = []
            if response and response.search_result and response.search_result.items:
                for item in response.search_result.items:
                    product = self._extract_product_data(item)
                    if product:
                        products.append(product)
                        
            logger.info(f"Found {len(products)} products in category {category}")
            return products
            
        except Exception as e:
            logger.error(f"Error in Amazon search for category {category}: {e}")
            return []
            
    def _extract_product_data(self, item):
        """Extract relevant product data from Amazon API response"""
        try:
            # Skip if missing essential data
            if not (item.asin and item.item_info and item.offers):
                return None
                
            # Extract basic info
            asin = item.asin
            title = item.item_info.title.display_value if item.item_info.title else "Unknown Title"
            
            # Extract price
            if item.offers.listings and item.offers.listings[0].price:
                price_amount = item.offers.listings[0].price.amount
                price_currency = item.offers.listings[0].price.currency
                amazon_price = float(price_amount)
            else:
                return None  # Skip if no price available
                
            # Extract category
            if item.browse_node_info and item.browse_node_info.browse_nodes:
                category = item.browse_node_info.browse_nodes[0].display_name
            else:
                category = "Unknown"
                
            # Extract image URL
            if item.images and item.images.primary:
                image_url = item.images.primary.large.url
            else:
                image_url = ""
                
            # Extract description (limited in API response)
            description = title  # Use title as fallback
            
            return {
                'asin': asin,
                'title': title,
                'amazon_price': amazon_price,
                'category': category,
                'image_url': image_url,
                'description': description
            }
            
        except Exception as e:
            logger.error(f"Error extracting product data: {e}")
            return None
            
    def _filter_profitable_products(self, products):
        """Filter products based on profitability criteria"""
        profitable_products = []
        
        for product in products:
            try:
                # Check eBay prices for this product
                ebay_price = self._check_ebay_price(product)
                
                if ebay_price:
                    # Calculate potential profit
                    amazon_price = product['amazon_price']
                    potential_profit = ebay_price - amazon_price
                    profit_margin = potential_profit / amazon_price
                    
                    # Check if meets minimum profit margin
                    if profit_margin >= PRODUCT_SEARCH_CONFIG['min_profit_margin']:
                        product['ebay_price'] = ebay_price
                        product['profit_margin'] = profit_margin
                        profitable_products.append(product)
                        logger.info(f"Found profitable product: {product['title']} with margin {profit_margin:.2f}")
                        
            except Exception as e:
                logger.error(f"Error checking profitability for product {product.get('asin')}: {e}")
                
        logger.info(f"Found {len(profitable_products)} profitable products")
        return profitable_products
        
    def _check_ebay_price(self, product):
        """Check current prices for similar products on eBay"""
        # This is a simplified implementation
        # In a real system, this would use the eBay API to search for similar products
        
        try:
            # For now, estimate eBay price as 1.3x Amazon price as a placeholder
            # This will be replaced with actual eBay API integration in the price calculator module
            estimated_ebay_price = product['amazon_price'] * 1.3
            return estimated_ebay_price
            
        except Exception as e:
            logger.error(f"Error checking eBay price: {e}")
            return None
            
    def _save_products_to_database(self, products):
        """Save profitable products to the database"""
        for product in products:
            try:
                self.db.add_product(
                    asin=product['asin'],
                    title=product['title'],
                    amazon_price=product['amazon_price'],
                    ebay_price=product['ebay_price'],
                    profit_margin=product['profit_margin'],
                    category=product['category'],
                    image_url=product['image_url'],
                    description=product['description']
                )
                logger.info(f"Saved product to database: {product['asin']}")
                
            except Exception as e:
                logger.error(f"Error saving product to database: {e}")
                
    def get_product_details(self, asin):
        """Get detailed information about a specific product by ASIN"""
        try:
            # Create request for specific item
            request = GetItemsRequest()
            request.partner_tag = AMAZON_CONFIG['partner_tag']
            request.partner_type = PartnerType[AMAZON_CONFIG['partner_type']]
            request.item_ids = [asin]
            request.resources = [
                GetItemsResource.ITEM_INFO,
                GetItemsResource.OFFERS,
                GetItemsResource.IMAGES,
                GetItemsResource.BROWSE_NODE_INFO,
                GetItemsResource.PARENT_ASINs
            ]
            
            # Execute request
            response = self.amazon_client.get_items(request)
            
            # Process response
            if response and response.items_result and response.items_result.items:
                item = response.items_result.items[0]
                return self._extract_product_data(item)
            else:
                logger.warning(f"No details found for ASIN {asin}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting product details for ASIN {asin}: {e}")
            return None
