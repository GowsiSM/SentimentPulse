"""
Snapdeal Scraper with Selenium for JavaScript-rendered reviews
Install: pip install selenium webdriver-manager
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import json
import random
from datetime import datetime

def setup_driver():
    """Setup Chrome driver with appropriate options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def scrape_reviews_selenium(driver, product_url, max_reviews=10):
    """Scrape reviews using Selenium to handle JavaScript"""
    reviews = []
    
    try:
        print(f"  Loading page with Selenium: {product_url[:60]}...")
        driver.get(product_url)
        
        # Wait for reviews section to load
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "defaultReviewsCard"))
            )
            print("  ✓ Reviews card loaded")
        except:
            print("  ⚠ Reviews card not found or timed out")
            return reviews
        
        # Scroll to reviews section to trigger lazy loading
        reviews_card = driver.find_element(By.ID, "defaultReviewsCard")
        driver.execute_script("arguments[0].scrollIntoView(true);", reviews_card)
        time.sleep(2)  # Wait for content to load
        
        # Get page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Find reviews section
        reviews_card = soup.find(id="defaultReviewsCard")
        if not reviews_card:
            print("  No reviews card in parsed HTML")
            return reviews
        
        # Find all review containers
        review_containers = reviews_card.find_all(class_="commentreview")
        
        if not review_containers:
            # Try finding by other classes
            review_containers = reviews_card.find_all("div", recursive=True)
            review_containers = [r for r in review_containers if "user-review" in str(r.get("class", []))]
        
        print(f"  Found {len(review_containers)} review containers")
        
        for idx, review_container in enumerate(review_containers[:max_reviews]):
            try:
                # Extract review text
                review_text = None
                
                # Method 1: Look for user-review class
                user_review = review_container.find(class_="user-review")
                if user_review:
                    # Try multiple text container classes
                    for class_name in ["LTgray", "grey-div", "hf-review", "reviewText"]:
                        text_elem = user_review.find(class_=class_name)
                        if text_elem:
                            review_text = text_elem.get_text(strip=True)
                            if len(review_text) > 10:
                                break
                
                # Method 2: If still no text, get all text from review container
                if not review_text:
                    all_text = review_container.get_text(strip=True)
                    # Filter out common non-review text
                    if len(all_text) > 20:
                        review_text = all_text
                
                if not review_text or len(review_text) < 5:
                    continue
                
                # Extract rating
                rating = None
                rating_elem = review_container.find(class_="filled-stars")
                if rating_elem and rating_elem.get("style"):
                    import re
                    width_match = re.search(r'width:\s*(\d+)%', rating_elem.get("style"))
                    if width_match:
                        percentage = int(width_match.group(1))
                        rating = round((percentage / 100) * 5, 1)
                
                # Extract reviewer name
                reviewer_name = None
                name_elem = review_container.find(class_="by")
                if name_elem:
                    reviewer_name = name_elem.get_text(strip=True)
                    if reviewer_name.lower().startswith("by "):
                        reviewer_name = reviewer_name[3:].strip()
                
                # Extract date
                review_date = None
                date_elem = review_container.find(class_="date")
                if date_elem:
                    review_date = date_elem.get_text(strip=True)
                
                review_data = {
                    "text": review_text,
                    "rating": rating,
                    "reviewer": reviewer_name,
                    "date": review_date
                }
                
                reviews.append(review_data)
                print(f"  ✓ Review {len(reviews)}: {review_text[:50]}...")
                
            except Exception as e:
                print(f"  Error parsing review {idx+1}: {e}")
                continue
        
    except Exception as e:
        print(f"  Error with Selenium: {e}")
        import traceback
        traceback.print_exc()
    
    return reviews

def scrape_products_with_reviews(category, max_products=10, max_reviews_per_product=10):
    """Scrape products and their reviews using Selenium"""
    driver = setup_driver()
    products = []
    
    try:
        base_url = f"https://www.snapdeal.com/products/{category}"
        
        print(f"{'='*60}")
        print(f"Starting scrape for category: {category}")
        print(f"{'='*60}\n")
        
        # First, get product listings (can use requests for this)
        import requests
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        page = 1
        while len(products) < max_products and page <= 3:
            try:
                page_url = f"{base_url}?page={page}"
                print(f"Fetching product list page {page}...")
                
                response = requests.get(page_url, headers=headers, timeout=10)
                soup = BeautifulSoup(response.text, "html.parser")
                
                product_containers = soup.select(".product-tuple-listing")
                
                if not product_containers:
                    break
                
                for product in product_containers:
                    if len(products) >= max_products:
                        break
                    
                    try:
                        title_tag = product.select_one(".product-title")
                        if not title_tag:
                            continue
                        title = title_tag.get_text(strip=True)
                        
                        link_tag = product.select_one("a.dp-widget-link")
                        if not link_tag or not link_tag.get("href"):
                            continue
                        
                        link = link_tag["href"]
                        if link.startswith("/product/"):
                            link = "https://www.snapdeal.com" + link
                        elif not link.startswith("http"):
                            continue
                        
                        # Extract price
                        price = None
                        price_tag = product.select_one(".product-price")
                        if price_tag:
                            import re
                            price_match = re.search(r'[\d,]+', price_tag.get_text(strip=True))
                            if price_match:
                                try:
                                    price = int(price_match.group().replace(',', ''))
                                except ValueError:
                                    pass
                        
                        product_data = {
                            "id": f"{category}-{len(products)}",
                            "title": title,
                            "link": link,
                            "price": price,
                            "category": category,
                            "reviews": [],
                            "scraped_at": str(datetime.now())
                        }
                        
                        products.append(product_data)
                        print(f"Product {len(products)}: {title[:50]}...")
                        
                        # Now scrape reviews using Selenium
                        reviews = scrape_reviews_selenium(driver, link, max_reviews_per_product)
                        product_data["reviews"] = reviews
                        print(f"  → Scraped {len(reviews)} reviews\n")
                        
                        # Small delay between products
                        time.sleep(random.uniform(1, 2))
                        
                    except Exception as e:
                        print(f"Error with product: {e}")
                        continue
                
                page += 1
                time.sleep(2)
                
            except Exception as e:
                print(f"Error on page {page}: {e}")
                break
        
    finally:
        driver.quit()
        print("\nClosed browser")
    
    return products

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python selenium_scraper.py <category> [max_products]")
        print("Example: python selenium_scraper.py men-apparel-shirts 5")
        return
    
    category = sys.argv[1]
    max_products = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    products = scrape_products_with_reviews(category, max_products, max_reviews_per_product=10)
    
    if products:
        # Save results
        import os
        os.makedirs("data", exist_ok=True)
        filename = f"data/products_with_reviews_{category}_{int(time.time())}.json"
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=4, ensure_ascii=False)
        
        print(f"\n{'='*60}")
        print(f"Saved {len(products)} products to {filename}")
        
        total_reviews = sum(len(p["reviews"]) for p in products)
        print(f"Total reviews: {total_reviews}")
        print(f"{'='*60}")
        
        # Show sample
        print("\n📦 Sample Product with Reviews:")
        for p in products:
            if p["reviews"]:
                print(f"\n{p['title'][:60]}...")
                print(f"Price: ₹{p['price']}")
                print(f"Reviews ({len(p['reviews'])}):")
                for i, r in enumerate(p['reviews'][:3], 1):
                    print(f"  {i}. ⭐ {r.get('rating', 'N/A')}/5")
                    print(f"     {r['text'][:80]}...")
                break

if __name__ == "__main__":
    main()