# scrape_products.py - Complete working version
import time
import json
import sys
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_driver():
    """Setup Chrome driver with proper options"""
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def scrape_product_reviews_selenium(product_url, max_reviews=None, driver=None):
    """Scrape ALL reviews using Selenium - NO LIMITS"""
    should_quit = driver is None
    if driver is None:
        driver = setup_driver()
    
    try:
        print(f"Loading: {product_url[:70]}...")
        driver.get(product_url)
        time.sleep(3)
        
        # Click reviews tab - MULTIPLE SELECTORS
        review_tab_clicked = False
        tab_selectors = [
            "a[href='#reviews']",
            "#reviewsContainer",
            ".ratingTab",
            "li.ratingTab a",
            "a.desc-tab.ratingTab"  # Added from HTML
        ]
        
        for selector in tab_selectors:
            try:
                reviews_tab = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
                driver.execute_script("arguments[0].scrollIntoView(true);", reviews_tab)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", reviews_tab)
                print(f"✓ Clicked reviews tab using: {selector}")
                review_tab_clicked = True
                time.sleep(3)
                break
            except:
                continue
        
        if not review_tab_clicked:
            print("✗ Could not click reviews tab")
            return []
        
        # Wait for reviews container
        reviews_found = False
        container_selectors = [
            "#reviewsContainer",
            ".user-review",
            ".review-container",
            "[class*='review']",
            ".tab-content.activeTab"  # Added from HTML
        ]
        
        for selector in container_selectors:
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                print(f"✓ Found reviews container: {selector}")
                reviews_found = True
                break
            except:
                continue
        
        if not reviews_found:
            print("✗ Reviews container not found")
            return []
        
        # AGGRESSIVE SCROLLING AND LOAD MORE CLICKING
        print("🔄 Loading ALL reviews...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        scroll_attempts = 0
        max_scroll_attempts = 100  # Increased significantly
        no_change_count = 0
        
        while scroll_attempts < max_scroll_attempts:
            # Scroll to bottom
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Try to click "Load More" or "Show More" buttons
            load_more_clicked = False
            load_more_selectors = [
                "button[class*='load-more']",
                "button[class*='show-more']",
                "a[class*='load-more']",
                ".load-more-reviews",
                "#load-more",
                "button.btn[onclick*='loadMore']",
                ".viewMoreReviews",
                "#viewMoreReviews",
                "a[href*='#loadmore']"
            ]
            
            for selector in load_more_selectors:
                try:
                    load_more_btn = driver.find_element(By.CSS_SELECTOR, selector)
                    if load_more_btn.is_displayed() and load_more_btn.is_enabled():
                        driver.execute_script("arguments[0].scrollIntoView(true);", load_more_btn)
                        time.sleep(1)
                        driver.execute_script("arguments[0].click();", load_more_btn)
                        print(f"✓ Clicked 'Load More' button using: {selector}")
                        time.sleep(3)  # Wait for new reviews to load
                        load_more_clicked = True
                        no_change_count = 0  # Reset counter when button clicked
                        break
                except:
                    continue
            
            # Calculate new scroll height
            new_height = driver.execute_script("return document.body.scrollHeight")
            
            if new_height == last_height and not load_more_clicked:
                no_change_count += 1
                if no_change_count >= 5:  # If no change 5 times consecutively
                    print(f"✓ Reached end of reviews after {scroll_attempts} scrolls")
                    break
            else:
                no_change_count = 0
            
            last_height = new_height
            scroll_attempts += 1
            
            # Print progress every 10 scrolls
            if scroll_attempts % 10 == 0:
                current_reviews = len(driver.find_elements(By.CSS_SELECTOR, ".user-review, .reviewCard, [class*='review-item']"))
                print(f"  Progress: {current_reviews} reviews loaded... (scroll #{scroll_attempts})")
        
        print(f"✓ Finished loading reviews. Total attempts: {scroll_attempts}")
        
        # Get ALL review items with multiple selectors
        review_items = []
        review_selectors = [
            ".user-review",
            ".reviewCard",
            ".review-card",
            "[class*='review-item']",
            "[class*='user-review']",
            "#reviewsContainer .tab-content .clearfix",  # From HTML structure
            ".comp-review-wrapper .review"
        ]
        
        for selector in review_selectors:
            review_items = driver.find_elements(By.CSS_SELECTOR, selector)
            if len(review_items) > 0:
                print(f"✓ Found {len(review_items)} review elements using: {selector}")
                break
        
        if not review_items:
            print("✗ No review items found")
            return []
        
        print(f"📝 Processing ALL {len(review_items)} reviews...")
        
        reviews = []
        for i, item in enumerate(review_items, 1):
            try:
                # Extract review text
                review_text = ""
                text_selectors = [
                    ".user-review-text",
                    ".reviewText",
                    ".review-text",
                    ".reviewdesc",
                    ".rvw-desc",
                    ".review-content",
                    "p",
                    "span"
                ]
                
                for selector in text_selectors:
                    try:
                        text_elements = item.find_elements(By.CSS_SELECTOR, selector)
                        for text_elem in text_elements:
                            text = text_elem.text.strip()
                            if text and len(text) > 20:
                                review_text = text
                                break
                        if review_text:
                            break
                    except:
                        continue
                
                if not review_text:
                    all_text = item.text.strip()
                    if len(all_text) > 30 and len(all_text) < 2000:
                        review_text = all_text
                
                if not review_text or len(review_text) < 20:
                    continue
                
                # Extract rating
                rating = "No rating"
                try:
                    rating_selectors = [
                        ".filled-stars",
                        ".star-rating",
                        "[class*='rating']",
                        "[class*='star']"
                    ]
                    
                    for selector in rating_selectors:
                        try:
                            rating_elem = item.find_element(By.CSS_SELECTOR, selector)
                            style = rating_elem.get_attribute("style") or ""
                            if "width" in style:
                                import re
                                width_match = re.search(r'width:\s*(\d+\.?\d*)%', style)
                                if width_match:
                                    width = float(width_match.group(1))
                                    rating = f"{width/20:.1f}/5"
                                    break
                        except:
                            continue
                except:
                    pass
                
                # Extract reviewer and date
                reviewer = "Anonymous"
                review_date = "Unknown date"
                try:
                    meta_selectors = [
                        ".reviewer-name",
                        ".user-name",
                        ".reviewer"
                    ]
                    
                    for selector in meta_selectors:
                        try:
                            meta_elem = item.find_element(By.CSS_SELECTOR, selector)
                            meta_text = meta_elem.text.strip()
                            if meta_text:
                                if " on " in meta_text:
                                    parts = meta_text.split(" on ")
                                    if len(parts) == 2:
                                        reviewer = parts[0].replace("by", "").replace("By", "").strip()
                                        review_date = parts[1].strip()
                                        break
                                else:
                                    reviewer = meta_text
                                    break
                        except:
                            continue
                except:
                    pass
                
                review_data = {
                    "rating": rating,
                    "text": review_text,
                    "reviewer": reviewer,
                    "date": review_date,
                    "scraped_at": datetime.now().isoformat()
                }
                
                reviews.append(review_data)
                
                # Print progress every 10 reviews
                if i % 10 == 0:
                    print(f"  ✓ Processed {i}/{len(review_items)} reviews...")
                
            except Exception as e:
                continue
        
        print(f"✅ Successfully extracted ALL {len(reviews)} reviews")
        return reviews
        
    except Exception as e:
        print(f"✗ Error scraping reviews: {e}")
        return []
    
    finally:
        if should_quit and driver:
            driver.quit()
            
def debug_page_structure(driver, product_url):
    """Debug function to save page structure for analysis"""
    try:
        # Save page source
        page_source = driver.page_source
        with open("debug_page_source.html", "w", encoding="utf-8") as f:
            f.write(page_source)
        print("✓ Saved page source to debug_page_source.html")
        
        # Take screenshot
        driver.save_screenshot("debug_screenshot.png")
        print("✓ Saved screenshot to debug_screenshot.png")
        
        # Find all elements with review-related classes/ids
        review_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='review'], [id*='review'], [class*='comment'], [class*='rating']")
        print(f"Found {len(review_elements)} elements with review-related attributes")
        
        for i, element in enumerate(review_elements[:10]):  # Limit to first 10
            try:
                class_attr = element.get_attribute("class") or ""
                id_attr = element.get_attribute("id") or ""
                text_preview = element.text[:100] if element.text else "No text"
                print(f"Element {i+1}: class='{class_attr}' id='{id_attr}'")
                print(f"  Text: {text_preview}...")
            except:
                pass
                
    except Exception as e:
        print(f"Debug error: {e}")
        
def scrape_category_products(category, max_products=20):
    """Scrape products from a category and their reviews"""
    base_url = f"https://www.snapdeal.com/products/{category}"
    driver = setup_driver()
    products = []
    
    print("=" * 70)
    print(f"Scraping category: {category}")
    print("=" * 70)
    
    try:
        page = 1
        while len(products) < max_products and page <= 3:
            page_url = f"{base_url}?page={page}"
            print(f"\nPage {page}: {page_url}")
            
            driver.get(page_url)
            time.sleep(3)
            
            # Find product links
            product_links = driver.find_elements(By.CSS_SELECTOR, "a.dp-widget-link[href*='/product/']")
            
            if not product_links:
                break
            
            # Get unique product URLs
            urls = list(set([link.get_attribute("href") for link in product_links if link.get_attribute("href")]))[:max_products - len(products)]
            
            for i, url in enumerate(urls, 1):
                if len(products) >= max_products:
                    break
                
                try:
                    # Get product title
                    driver.get(url)
                    time.sleep(2)
                    
                    title = "Unknown Product"
                    try:
                        title_elem = driver.find_element(By.CSS_SELECTOR, "h1.pdp-e-i-head")
                        title = title_elem.text.strip()
                    except:
                        pass
                    
                    print(f"\n[{len(products)+1}/{max_products}] {title[:60]}...")
                    
                    # Scrape reviews for this product
                    reviews = scrape_product_reviews_selenium(url, max_reviews=None, driver=driver)  
                    
                    # Extract other product info
                    price = None
                    try:
                        price_elem = driver.find_element(By.CSS_SELECTOR, "span.payBlkBig")
                        price_text = price_elem.text.strip().replace("₹", "").replace(",", "")
                        price = int(price_text)
                    except:
                        pass
                    
                    image_url = None
                    try:
                        img_elem = driver.find_element(By.CSS_SELECTOR, "img.cloudzoom")
                        image_url = img_elem.get_attribute("src")
                    except:
                        pass
                    
                    product_data = {
                        "id": f"{category}-{len(products)}-{int(time.time())}",
                        "title": title,
                        "link": url,
                        "price": price,
                        "image_url": image_url,
                        "category": category,
                        "reviews": reviews,
                        "sentiment": None,
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    products.append(product_data)
                    print(f"→ {len(reviews)} reviews scraped")
                    
                except Exception as e:
                    print(f"✗ Error scraping product: {e}")
                    continue
                
                time.sleep(2)
            
            page += 1
        
    finally:
        driver.quit()
    
    return products

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python scrape_products.py <category> [max_products]")
        print("  python scrape_products.py test <product_url>")
        sys.exit(1)
    
    if sys.argv[1] == "test":
        # Test single product
        url = sys.argv[2]
        print(f"Testing: {url}")
        reviews = scrape_product_reviews_selenium(url)
        
        print("\n" + "=" * 70)
        print(f"Found {len(reviews)} reviews")
        print("=" * 70)
        
        for i, review in enumerate(reviews, 1):
            print(f"\n{i}. Rating: {review['rating']}")
            print(f"   By: {review['reviewer']} on {review['date']}")
            print(f"   Date: {review['date']}")
            print(f"   {review['text'][:200]}...")
        
        with open("test_reviews.json", "w", encoding="utf-8") as f:
            json.dump(reviews, f, indent=2, ensure_ascii=False)
        print(f"\nSaved to test_reviews.json")
        
    else:
        # Scrape category
        category = sys.argv[1]
        max_products = int(sys.argv[2]) if len(sys.argv) > 2 else 20
        
        products = scrape_category_products(category, max_products)
        
        print("\n" + "=" * 70)
        print("COMPLETED")
        print("=" * 70)
        print(f"Products: {len(products)}")
        print(f"Products with reviews: {sum(1 for p in products if p['reviews'])}")
        print(f"Total reviews: {sum(len(p['reviews']) for p in products)}")
        
        filename = f"data/products_{category}_{int(time.time())}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        
        print(f"Saved to: {filename}")

if __name__ == "__main__":
    main()