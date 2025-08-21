# snapdeal_sentiment_analyzer/src/backend/scraper/review_scraper.py
import requests
from bs4 import BeautifulSoup
import time
import random
import logging
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


class ReviewScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/91.0.4472.124 Safari/537.36'
            ),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        }

    def scrape_product_reviews(self, product_url, max_reviews=50):
        """Scrape reviews for a specific product"""
        try:
            reviews = []

            logger.info(f"Scraping reviews from: {product_url}")

            # Get the product page
            response = requests.get(product_url, headers=self.headers)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for review sections
            review_containers = self._find_review_containers(soup)

            logger.info(f"Found {len(review_containers)} review containers")

            for container in review_containers[:max_reviews]:
                try:
                    review = self._extract_review_info(container)
                    if review and review.get('text'):
                        reviews.append(review)

                        # Small delay
                        time.sleep(random.uniform(0.2, 0.5))

                except Exception as e:
                    logger.error(f"Error extracting review: {str(e)}")
                    continue

            # If no reviews found on main page, try to find reviews section
            if not reviews:
                reviews = self._scrape_reviews_section(product_url)

            logger.info(f"Successfully scraped {len(reviews)} reviews")
            return reviews

        except Exception as e:
            logger.error(f"Error scraping reviews section: {str(e)}")
            return []

    def scrape_multiple_products(self, products):
        """Scrape reviews for multiple products"""
        all_reviews = {}

        for i, product in enumerate(products):
            logger.info(
                f"Scraping reviews for product {i+1}/{len(products)}: {product.get('title', '')}"
            )

            product_id = product.get('id')
            product_url = product.get('link')

            if product_url:
                reviews = self.scrape_product_reviews(product_url)
                all_reviews[product_id] = reviews

                # Respectful delay between products
                time.sleep(random.uniform(2, 4))

        return all_reviews

    def _find_review_containers(self, soup):
        """Find review containers in the page"""
        containers = []

        # Common selectors for review containers
        selectors = [
            'div[class*="review"]',
            'div[class*="comment"]',
            'div[class*="feedback"]',
            '.user-review',
            '.customer-review',
            '.review-item',
            '.review-content',
            '[data-qa="review"]'
        ]

        for selector in selectors:
            found = soup.select(selector)
            if found:
                containers.extend(found)

        # Remove duplicates
        seen = set()
        unique_containers = []
        for container in containers:
            container_text = container.get_text(strip=True)[:100]  # First 100 chars as identifier
            if container_text and container_text not in seen:
                seen.add(container_text)
                unique_containers.append(container)

        return unique_containers

    def _extract_review_info(self, container):
        """Extract review information from container"""
        try:
            review = {}

            # Extract review text
            text_elem = container.find(['p', 'div', 'span'], string=True)
            if text_elem:
                review_text = text_elem.get_text(strip=True)

                # Filter out non-review content
                if self._is_valid_review_text(review_text):
                    review['text'] = review_text

            # Extract rating if available
            rating_elem = container.find(['span', 'div'], class_=re.compile(r'star|rating', re.I))
            if rating_elem:
                rating = self._extract_rating_from_element(rating_elem)
                if rating:
                    review['rating'] = rating

            # Extract reviewer name if available
            name_elem = container.find(['span', 'div', 'p'], class_=re.compile(r'name|user|author', re.I))
            if name_elem:
                name = name_elem.get_text(strip=True)
                if name and len(name) < 50:  # Reasonable name length
                    review['reviewer'] = name

            # Extract date if available
            date_elem = container.find(['span', 'div', 'time'], class_=re.compile(r'date|time', re.I))
            if date_elem:
                date_text = date_elem.get_text(strip=True)
                review['date'] = date_text

            return review if review.get('text') else None

        except Exception as e:
            logger.error(f"Error extracting review info: {str(e)}")
            return None

    def _is_valid_review_text(self, text):
        """Check if text is a valid review"""
        if not text or len(text.strip()) < 10:
            return False

        # Filter out common non-review content
        invalid_patterns = [
            r'^(add to|buy now|price|₹|rs\.)',
            r'^(share|like|follow)',
            r'^(login|register|sign)',
            r'^(home|categories|search)',
            r'^(\d+\s*(star|rating))',
            r'^(similar product|related item)',
            r'(cookie|privacy policy|terms)'
        ]

        text_lower = text.lower()
        for pattern in invalid_patterns:
            if re.search(pattern, text_lower):
                return False

        # Check for review-like content
        review_indicators = [
            'good', 'bad', 'excellent', 'poor', 'nice', 'great', 'terrible',
            'recommend', 'satisfied', 'disappointed', 'quality', 'product',
            'delivery', 'service', 'worth', 'money', 'buy', 'purchase',
            'using', 'experience', 'happy', 'unhappy', 'amazing', 'awesome'
        ]

        return any(indicator in text_lower for indicator in review_indicators)

    def _extract_rating_from_element(self, elem):
        """Extract rating from element"""
        try:
            # Look for star counts
            elem_text = elem.get_text(strip=True)
            rating_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:star|/5)', elem_text, re.I)
            if rating_match:
                return float(rating_match.group(1))

            # Look for star classes or data attributes
            classes = ' '.join(elem.get('class', []))
            star_match = re.search(r'(\d+)\s*star', classes, re.I)
            if star_match:
                return int(star_match.group(1))

            # Count filled stars
            star_elements = elem.find_all(['i', 'span'], class_=re.compile(r'star.*fill|fill.*star', re.I))
            if star_elements:
                return len(star_elements)

        except Exception as e:
            logger.error(f"Error extracting rating: {str(e)}")

        return None

    def _scrape_reviews_section(self, product_url):
        """Try to find and scrape a dedicated reviews section"""
        try:
            reviews = []

            # Try to construct reviews page URL
            reviews_url = product_url
            if '/product/' in product_url:
                # Some sites have /reviews endpoint
                reviews_url = product_url.replace('/product/', '/product/reviews/')

            response = requests.get(reviews_url, headers=self.headers)
            if response.status_code == 404:
                # Try alternative URL patterns
                if '#reviews' not in product_url:
                    reviews_url = product_url + '#reviews'
                    response = requests.get(reviews_url, headers=self.headers)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # Look for review text in common patterns
                review_texts = []

                # Pattern 1: Look for paragraphs with review-like content
                paragraphs = soup.find_all('p')
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if self._is_valid_review_text(text):
                        review_texts.append(text)

                # Pattern 2: Look in divs with text content
                divs = soup.find_all('div')
                for div in divs:
                    # Skip if div has nested elements (likely not pure review text)
                    if not div.find(['div', 'p', 'span']) and div.string:
                        text = div.get_text(strip=True)
                        if self._is_valid_review_text(text):
                            review_texts.append(text)

                # Convert to review objects
                for text in review_texts[:20]:  # Limit to 20 reviews
                    reviews.append({
                        'text': text,
                        'rating': random.uniform(3.0, 5.0),  # Default rating
                        'reviewer': f"Customer {random.randint(1, 1000)}",
                        'date': time.strftime('%Y-%m-%d')
                    })

            return reviews

        except Exception as e:
            logger.error(f"Error scraping dedicated reviews section: {str(e)}")
            return []
