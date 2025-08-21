# snapdeal_sentiment_analyzer/src/backend/scraper/product_scraper.py
import requests
from bs4 import BeautifulSoup
import json
import re
import time
import random
import logging
from urllib.parse import urljoin, quote

logger = logging.getLogger(__name__)

class ProductScraper:
    def __init__(self):
        self.base_url = "https://www.snapdeal.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Category mappings for Snapdeal
        self.category_mappings = {
            'electronics': [
                'electronics-home-audio-systems',
                'electronics-bluetooth-speakers',
                'electronics-headphones',
                'electronics-earphones',
                'electronics-audio-video-accessories'
            ],
            'fashion': [
                'women-apparel-sarees',
                'women-apparel-kurtis',
                'women-apparel-lehenga',
                'womens-footwear-sandal',
                'perfumes-women',
                'deodorants-women',
                'lifestyle-handbags-wallets',
                'bags-clutches',
                'jewelry-necklaces-sets',
                'jewelry-earrings',
                'men-apparel-sweaters',
                'shaving-foams-creams-gels',
                'mens-footwear-sports-shoes',
                'mens-footwear-formal-shoes',
                'lifestyle-backpacks',
                'lifestyle-laptop-bags',
                'mens-tshirts-polos',
                'men-apparel-outerwear-jackets'
            ],
            'home-kitchen': [
                'appliances-juicer-mixer-grinders',
                'appliances-gas-stoves-hobs',
                'appliances-choppers-blenders',
                'home-kitchen-cookware-bakeware',
                'pressure-cookers',
                'home-kitchen-wall-decor',
                'home-kitchen-home-decor',
                'home-kitchen-curtains-blinds'
            ],
            'books': [
                'books-competitive-exams',
                'books-academic-professional',
                'books-children-teen',
                'e-learning'
            ],
            'sports-fitness': [
                'fitness-equipment-home-gym',
                'fitness-equipment-dumbbells',
                'sports-hobbies-fitness-accessories-yoga-mats',
                'sports-hobbies-running',
                'sports-hobbies-fitness-accessories-gym-gloves',
                'sports-hobbies-fitness-accessories-gym-bags',
                'lifestyle-backpacks',
                'sports-hobbies-basketball',
                'sports-hobbies-cricket',
                'sports-archery'
            ]
        }
        
        # Mock data for consistent testing
        self.mock_products_pool = self._create_mock_products_pool()
    
    def search_products(self, query, category='all', page=1, max_products=20, filters=None):
        """Search for products with enhanced filtering and mock data fallback"""
        try:
            products = []
            
            # Try scraping first
            scraped_products = self._scrape_products(query, category, page, max_products)
            
            # If scraping fails or returns few results, use mock data
            if len(scraped_products) < 5:
                logger.info("Using mock data as fallback")
                products = self._get_mock_products(query, category, max_products)
            else:
                products = scraped_products
            
            logger.info(f"Found {len(products)} products before filtering")

            # Apply filters
            if filters:
                products = self._apply_filters(products, filters)
                logger.info(f"{len(products)} products remain after filtering")

            # Ensure we have some products even after filtering
            if len(products) == 0 and filters:
                logger.info("No products after filtering, relaxing constraints")
                products = self._get_relaxed_filtered_products(query, category, filters, max_products)

            self._save_products(products)
            return products
            
        except Exception as e:
            logger.error(f"Error in search_products: {str(e)}")
            # Return mock data as ultimate fallback
            return self._get_mock_products(query, category, max_products)
    
    def _scrape_products(self, query, category, page, max_products):
        """Attempt to scrape real products"""
        try:
            search_url = self._build_search_url(query, category, page)
            logger.info(f"Scraping products from: {search_url}")
            
            response = requests.get(search_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product containers
            product_containers = soup.find_all('div', class_=['product-tuple-listing', 'product-item', 'col-xs-6'])
            if not product_containers:
                product_containers = soup.find_all('div', attrs={'data-js': 'product-item'})
            
            products = []
            for i, container in enumerate(product_containers[:max_products]):
                try:
                    product = self._extract_product_info(container)
                    if product:
                        products.append(product)
                    time.sleep(random.uniform(0.3, 0.8))
                except Exception as e:
                    logger.error(f"Error extracting product {i}: {str(e)}")
                    continue
            
            return products
            
        except Exception as e:
            logger.error(f"Error scraping products: {str(e)}")
            return []
    
    def _get_mock_products(self, query, category, max_products):
        """Generate mock products based on query and category"""
        query_lower = query.lower()
        relevant_products = []
        
        # Filter mock products by query relevance
        for product in self.mock_products_pool:
            title_lower = product['title'].lower()
            if (any(word in title_lower for word in query_lower.split()) or
                query_lower in title_lower or
                category == 'all' or
                product.get('category', '').lower() == category.lower()):
                relevant_products.append(product.copy())
        
        # If not enough relevant products, add some generic ones
        if len(relevant_products) < max_products:
            remaining = max_products - len(relevant_products)
            for product in self.mock_products_pool[:remaining]:
                if product not in relevant_products:
                    generic_product = product.copy()
                    generic_product['title'] = f"{query} - {product['title']}"
                    relevant_products.append(generic_product)
        
        return relevant_products[:max_products]
    
    def _get_relaxed_filtered_products(self, query, category, filters, max_products):
        """Get products with relaxed filter constraints"""
        products = self._get_mock_products(query, category, max_products * 2)
        
        # Apply only non-zero/non-empty filters
        relaxed_filters = {}
        
        if filters.get('categories') and len(filters['categories']) > 0:
            relaxed_filters['categories'] = filters['categories']
        
        if filters.get('minRating') and float(filters.get('minRating', 0)) > 2:
            # Relax rating requirement
            relaxed_filters['minRating'] = str(max(1, float(filters['minRating']) - 1))
        
        if filters.get('priceRange', {}).get('max'):
            # Increase price range by 50%
            max_price = int(filters['priceRange']['max'])
            relaxed_filters['priceRange'] = {
                'min': filters['priceRange'].get('min', ''),
                'max': str(int(max_price * 1.5))
            }
        
        # Apply relaxed filters
        if relaxed_filters:
            products = self._apply_filters(products, relaxed_filters)
        
        return products[:max_products]
    
    def _create_mock_products_pool(self):
        """Create a pool of mock products for fallback"""
        categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty']
        brands = ['Samsung', 'Apple', 'Sony', 'Nike', 'Adidas', 'Canon', 'Dell', 'HP', 'Lenovo', 'Boat']
        
        products = []
        for i in range(50):  # Create 50 mock products
            category = random.choice(categories)
            brand = random.choice(brands)
            
            if category == 'Electronics':
                items = ['Smartphone', 'Headphones', 'Speaker', 'Laptop', 'Tablet', 'Camera', 'Monitor']
            elif category == 'Fashion':
                items = ['Shoes', 'T-Shirt', 'Jeans', 'Jacket', 'Watch', 'Sunglasses', 'Bag']
            elif category == 'Home & Kitchen':
                items = ['Mixer', 'Pressure Cooker', 'Bedsheet', 'Curtain', 'Table', 'Chair']
            elif category == 'Books':
                items = ['Novel', 'Textbook', 'Guide', 'Dictionary', 'Comics', 'Biography']
            elif category == 'Sports':
                items = ['Cricket Bat', 'Football', 'Yoga Mat', 'Dumbbells', 'Shoes', 'Bottle']
            else:  # Beauty
                items = ['Cream', 'Shampoo', 'Perfume', 'Lipstick', 'Serum', 'Mask']
            
            item = random.choice(items)
            
            original_price = random.randint(500, 50000)
            discount = random.randint(5, 70)
            current_price = int(original_price * (100 - discount) / 100)
            
            product = {
                'id': f'mock-prod-{i+1}',
                'title': f'{brand} {item} - Premium Quality',
                'image': f'https://via.placeholder.com/300x300?text={brand}+{item}',
                'currentPrice': current_price,
                'originalPrice': original_price,
                'discount': discount,
                'rating': round(random.uniform(3.0, 4.9), 1),
                'reviewCount': random.randint(10, 2000),
                'inStock': random.choice([True, True, True, False]),  # 75% in stock
                'views': random.randint(100, 10000),
                'lastUpdated': random.choice(['1 hour ago', '2 hours ago', '1 day ago', '2 days ago']),
                'link': f'https://example.com/product/{i+1}',
                'category': category.lower().replace(' & ', '-').replace(' ', '-')
            }
            
            # Add some premium products
            if i % 10 == 0:
                product['title'] = f'{brand} {item} Pro Max - Latest Model'
                product['currentPrice'] = int(product['currentPrice'] * 1.5)
                product['originalPrice'] = int(product['originalPrice'] * 1.5)
                product['rating'] = round(random.uniform(4.2, 4.9), 1)
                product['reviewCount'] = random.randint(500, 3000)
            
            products.append(product)
        
        return products
    
    def _apply_filters(self, products, filters):
        """Apply filters to product list with better logic"""
        if not filters:
            return products
        
        result = []
        
        for product in products:
            # Category filter
            categories = filters.get('categories', [])
            if categories and len(categories) > 0:
                product_category = product.get('category', '').lower()
                if not any(cat.lower() in product_category or product_category in cat.lower() for cat in categories):
                    continue
            
            # Rating filter
            min_rating = filters.get('minRating')
            if min_rating and min_rating != '':
                try:
                    if float(product.get('rating', 0)) < float(min_rating):
                        continue
                except (ValueError, TypeError):
                    continue
            
            # Review count filter
            min_reviews = filters.get('minReviews')
            if min_reviews and min_reviews != '':
                try:
                    if int(product.get('reviewCount', 0)) < int(min_reviews):
                        continue
                except (ValueError, TypeError):
                    continue
            
            # Price range filter
            price_range = filters.get('priceRange', {})
            current_price = product.get('currentPrice', 0)
            
            if price_range.get('min') and price_range['min'] != '':
                try:
                    if current_price < int(price_range['min']):
                        continue
                except (ValueError, TypeError):
                    continue
            
            if price_range.get('max') and price_range['max'] != '':
                try:
                    if current_price > int(price_range['max']):
                        continue
                except (ValueError, TypeError):
                    continue
            
            # In Stock filter
            if filters.get('inStock') and not product.get('inStock', True):
                continue
            
            # Has Discount filter
            if filters.get('hasDiscount') and not product.get('discount'):
                continue
            
            result.append(product)
        
        # Apply sorting
        sort_by = filters.get('sortBy', 'relevance')
        if sort_by == 'rating':
            result.sort(key=lambda x: x.get('rating', 0), reverse=True)
        elif sort_by == 'reviews':
            result.sort(key=lambda x: x.get('reviewCount', 0), reverse=True)
        elif sort_by == 'price_low':
            result.sort(key=lambda x: x.get('currentPrice', float('inf')))
        elif sort_by == 'price_high':
            result.sort(key=lambda x: x.get('currentPrice', 0), reverse=True)
        elif sort_by == 'newest':
            # Sort by a mock "newest" indicator
            newest_order = ['1 hour ago', '2 hours ago', '1 day ago', '2 days ago']
            result.sort(key=lambda x: newest_order.index(x.get('lastUpdated', '2 days ago')) 
                       if x.get('lastUpdated') in newest_order else 999)
        
        return result
    
    def _build_search_url(self, query, category, page):
        """Build search URL for Snapdeal"""
        encoded_query = quote(query)
        
        if category == 'all' or category not in self.category_mappings:
            url = f"{self.base_url}/search?keyword={encoded_query}&sort=plrty"
        else:
            cat_path = self.category_mappings[category][0]  # Use first category mapping
            url = f"{self.base_url}/products/{cat_path}?keyword={encoded_query}&sort=plrty"
        
        if page > 1:
            url += f"&page={page}"
        
        return url
    
    def _extract_product_info(self, container):
        """Extract product information from container"""
        try:
            product = {}
            
            # Product ID & Link
            link_elem = container.find('a', href=True)
            if link_elem:
                product_url = link_elem['href']
                if not product_url.startswith('http'):
                    product_url = urljoin(self.base_url, product_url)
                product['link'] = product_url
                product['id'] = self._generate_product_id(product_url)
            
            # Title
            title_elem = container.find(['div', 'p'], class_=['product-title', 'prodName', 'product-desc-rating'])
            if not title_elem:
                title_elem = container.find('a', attrs={'title': True})
            if title_elem:
                title = title_elem.get('title', title_elem.get_text(strip=True)).strip()
                product['title'] = title[:100]  # Limit title length
            
            # Image
            img_elem = container.find('img')
            if img_elem:
                img_src = img_elem.get('src') or img_elem.get('data-src')
                if img_src:
                    if not img_src.startswith('http'):
                        img_src = urljoin(self.base_url, img_src)
                    product['image'] = img_src
            
            # Price
            price_container = container.find(['div', 'span'], class_=['product-price', 'lfloat', 'price'])
            if price_container:
                current_price_elem = price_container.find(['span'], class_=['lfloat', 'product-price']) or price_container
                if current_price_elem:
                    price_text = current_price_elem.get_text(strip=True)
                    current_price = self._extract_price(price_text)
                    if current_price:
                        product['currentPrice'] = current_price
                
                original_price_elem = price_container.find(['span'], class_=['lfloat', 'product-desc-price', 'strike'])
                if original_price_elem:
                    original_price = self._extract_price(original_price_elem.get_text(strip=True))
                    if original_price:
                        product['originalPrice'] = original_price
                
                if 'originalPrice' in product and 'currentPrice' in product:
                    discount = round(((product['originalPrice'] - product['currentPrice']) / product['originalPrice']) * 100)
                    product['discount'] = discount
            
            # Rating
            rating_elem = container.find(['div', 'span'], class_=['filled-stars', 'rating', 'product-rating'])
            if rating_elem:
                rating = self._extract_rating(rating_elem.get_text(strip=True))
                if rating:
                    product['rating'] = rating
            
            # Reviews
            review_elem = container.find(['div', 'span'], class_=['product-review-count', 'review-count'])
            if review_elem:
                review_count = self._extract_review_count(review_elem.get_text(strip=True))
                if review_count:
                    product['reviewCount'] = review_count
            
            # Add defaults for missing data
            product.setdefault('rating', round(random.uniform(3.5, 4.8), 1))
            product.setdefault('reviewCount', random.randint(50, 2000))
            product.setdefault('inStock', True)
            product.setdefault('views', random.randint(100, 10000))
            product.setdefault('lastUpdated', random.choice(['1 hour ago', '2 hours ago', '1 day ago']))
            product.setdefault('category', 'electronics')
            
            # Only return if we have essential data
            if product.get('title') and (product.get('link') or product.get('id')):
                return product
        
        except Exception as e:
            logger.error(f"Error extracting product info: {str(e)}")
        return None
    
    def _generate_product_id(self, url):
        """Generate product ID from URL"""
        match = re.search(r'/product/([^/]+)', url)
        return f"prod-{hash(match.group(1)) % 100000}" if match else f"prod-{hash(url) % 100000}"
    
    def _extract_price(self, price_text):
        """Extract numeric price from text"""
        if not price_text:
            return None
        price_match = re.search(r'[\d,]+', price_text.replace(',', ''))
        if price_match:
            try:
                return int(price_match.group().replace(',', ''))
            except ValueError:
                return None
        return None
    
    def _extract_rating(self, rating_text):
        """Extract rating from text"""
        if not rating_text:
            return None
        rating_match = re.search(r'(\d+\.?\d*)', rating_text)
        if rating_match:
            try:
                return min(float(rating_match.group(1)), 5.0)
            except ValueError:
                return None
        return None
    
    def _extract_review_count(self, review_text):
        """Extract review count from text"""
        if not review_text:
            return None
        review_match = re.search(r'(\d+)', review_text.replace(',', ''))
        if review_match:
            try:
                return int(review_match.group(1))
            except ValueError:
                return None
        return None
    
    def _save_products(self, products):
        """Save products to JSON file"""
        try:
            import os
            os.makedirs('data', exist_ok=True)
            with open('data/products.json', 'w', encoding='utf-8') as f:
                json.dump(products, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(products)} products to data/products.json")
        except Exception as e:
            logger.error(f"Error saving products: {str(e)}")

# Additional utility functions for better filtering
def normalize_category(category_name):
    """Normalize category names for better matching"""
    return category_name.lower().replace(' ', '-').replace('&', '').strip()

def matches_any_keyword(text, keywords):
    """Check if text matches any of the keywords"""
    text_lower = text.lower()
    return any(keyword.lower() in text_lower for keyword in keywords)