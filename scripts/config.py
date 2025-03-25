"""
Configuration file for Amazon to eBay Arbitrage System
"""

# Amazon API Configuration
AMAZON_CONFIG = {
    'access_key': 'YOUR_AMAZON_ACCESS_KEY',
    'secret_key': 'YOUR_AMAZON_SECRET_KEY',
    'partner_tag': 'YOUR_AMAZON_PARTNER_TAG',
    'partner_type': 'Associates',
    'marketplace': 'www.amazon.com',
    'region': 'us-east-1'
}

# eBay API Configuration
EBAY_CONFIG = {
    'domain': 'api.ebay.com',
    'app_id': 'YOUR_EBAY_APP_ID',
    'cert_id': 'YOUR_EBAY_CERT_ID',
    'dev_id': 'YOUR_EBAY_DEV_ID',
    'token': 'YOUR_EBAY_TOKEN',
    'siteid': '0',  # US site
}

# Database Configuration
DATABASE_CONFIG = {
    'filename': '../data/arbitrage_db.sqlite'
}

# Product Search Configuration
PRODUCT_SEARCH_CONFIG = {
    'min_price': 15.0,
    'max_price': 100.0,
    'min_profit_margin': 0.15,  # 15% minimum profit margin
    'max_results_per_search': 50,
    'categories_to_search': [
        'Electronics',
        'Home & Kitchen',
        'Toys & Games',
        'Office Products',
        'Sports & Outdoors'
    ]
}

# eBay Listing Configuration
EBAY_LISTING_CONFIG = {
    'listing_duration': 'GTC',  # Good Till Cancelled
    'shipping_service': 'USPSPriority',
    'return_policy': {
        'returns_accepted': True,
        'returns_within': 'Days_30',
        'refund': 'Money Back',
        'shipping_cost_paid_by': 'Seller'
    },
    'payment_methods': ['PayPal'],
    'markup_percentage': 0.25,  # 25% markup from Amazon price
    'condition_id': 1000,  # New
    'country': 'US',
    'currency': 'USD',
    'dispatch_time_max': 1,  # 1 day handling time
    'listing_type': 'FixedPriceItem'
}

# Order Fulfillment Configuration
ORDER_FULFILLMENT_CONFIG = {
    'check_orders_interval': 15,  # minutes
    'auto_purchase': True,
    'max_concurrent_orders': 50,
    'gift_wrap': False,
    'gift_message': ''
}

# Logging Configuration
LOGGING_CONFIG = {
    'log_file': '../logs/arbitrage.log',
    'log_level': 'INFO',
    'max_log_size': 10485760,  # 10MB
    'backup_count': 5
}
