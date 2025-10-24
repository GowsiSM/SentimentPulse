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

def scrape_product_reviews_selenium(product_url, max_reviews=50, driver=None):
    """Scrape reviews using Selenium - FIXED VERSION"""
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
            "li.ratingTab a"
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
                time.sleep(3)  # Wait for reviews to load
                break
            except:
                continue
        
        if not review_tab_clicked:
            print("✗ Could not click reviews tab")
            return []
        
        # Wait for reviews container with multiple possible selectors
        reviews_found = False
        container_selectors = [
            "#reviewsContainer",
            ".user-review",
            ".review-container",
            "[class*='review']"
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
        
        # Scroll to load more reviews
        for _ in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
        
        # Get all review items - TRY MULTIPLE SELECTORS
        # In scrape_products.py - Replace the review extraction section starting from line 95

        # Get all review items - TRY MULTIPLE SELECTORS
        review_items = []
        review_selectors = [
            ".user-review",
            ".reviewCard",
            ".review-card",
            "[class*='review-item']",
            "[class*='user-review']",
            "#reviewsContainer > div",
            ".review",
            ".review-entry",
            ".reviewdata",
            ".reviewtext"
        ]
        
        for selector in review_selectors:
            review_items = driver.find_elements(By.CSS_SELECTOR, selector)
            if len(review_items) > 0:
                print(f"✓ Found {len(review_items)} review elements using: {selector}")
                break
        
        if not review_items:
            print("✗ No review items found")
            # Try alternative approach - look for any divs that might contain reviews
            all_divs = driver.find_elements(By.CSS_SELECTOR, "#reviewsContainer div")
            review_items = [div for div in all_divs if len(div.text.strip()) > 50]  # Text length filter
            print(f"✓ Found {len(review_items)} review elements using alternative approach")
        
        if not review_items:
            print("✗ No review items found after all attempts")
            return []
        
        reviews = []
        for i, item in enumerate(review_items, 1):  # Removed max_reviews limit
            try:
                # Extract review text - IMPROVED SELECTORS FOR SNAPDEAL
                review_text = ""
                text_selectors = [
                    ".user-review .review-text",
                    ".user-review-text",
                    ".reviewText",
                    ".review-text",
                    ".reviewdesc",
                    ".rvw-desc",
                    ".review-content",
                    ".reviewdata",
                    "p",
                    "span",
                    "div"
                ]
                
                for selector in text_selectors:
                    try:
                        text_elements = item.find_elements(By.CSS_SELECTOR, selector)
                        for text_elem in text_elements:
                            text = text_elem.text.strip()
                            # More lenient text validation for Snapdeal
                            if text and len(text) > 20 and any(word in text.lower() for word in 
                                                              ['good', 'nice', 'quality', 'product', 'like', 'recommend', 
                                                               'happy', 'bad', 'poor', 'worst', 'not good', 'disappointed']):
                                review_text = text
                                break
                        if review_text:
                            break
                    except:
                        continue
                
                # If no text found with selectors, try getting all text from the item
                if not review_text:
                    all_text = item.text.strip()
                    # Filter for meaningful review text
                    if len(all_text) > 30 and len(all_text) < 1000:
                        review_text = all_text
                
                if not review_text or len(review_text) < 20:
                    print(f"  ✗ Review {i}: Text too short or empty")
                    continue
                
                # Extract rating - IMPROVED FOR SNAPDEAL
                rating = "No rating"
                try:
                    # Snapdeal rating selectors
                    rating_selectors = [
                        ".filled-stars",
                        ".star-rating",
                        "[class*='rating']",
                        "[class*='star']",
                        ".rating"
                    ]
                    
                    for selector in rating_selectors:
                        try:
                            rating_elem = item.find_element(By.CSS_SELECTOR, selector)
                            # Get rating from style attribute or text
                            style = rating_elem.get_attribute("style") or ""
                            if "width" in style:
                                width_match = re.search(r'width:\s*(\d+)%', style)
                                if width_match:
                                    width = int(width_match.group(1))
                                    rating = f"{width/20:.1f}/5"
                                    break
                            # Try getting rating from text
                            rating_text = rating_elem.text.strip()
                            if rating_text and any(char.isdigit() for char in rating_text):
                                rating = rating_text
                                break
                        except:
                            continue
                except Exception as e:
                    print(f"    Rating extraction failed: {e}")
                
                # Extract reviewer name and date - IMPROVED FOR SNAPDEAL
                reviewer = "Anonymous"
                review_date = "Unknown date"
                try:
                    # Look for reviewer info in the item
                    meta_selectors = [
                        ".reviewer-name",
                        ".user-name", 
                        ".reviewer",
                        ".by",
                        ".author",
                        "[class*='user']",
                        "[class*='reviewer']"
                    ]
                    
                    for selector in meta_selectors:
                        try:
                            meta_elem = item.find_element(By.CSS_SELECTOR, selector)
                            meta_text = meta_elem.text.strip()
                            if meta_text:
                                # Try to parse "by UserName on Date" format
                                if " on " in meta_text:
                                    parts = meta_text.split(" on ")
                                    if len(parts) == 2:
                                        reviewer = parts[0].replace("by", "").replace("By", "").strip()
                                        review_date = parts[1].strip()
                                        break
                                elif "by" in meta_text.lower():
                                    reviewer = meta_text.replace("by", "").replace("By", "").strip()
                                    break
                                else:
                                    reviewer = meta_text
                                    break
                        except:
                            continue
                except Exception as e:
                    print(f"    Reviewer/date extraction failed: {e}")
                
                review_data = {
                    "rating": rating,
                    "text": review_text,
                    "reviewer": reviewer,
                    "date": review_date,
                    "scraped_at": datetime.now().isoformat()
                }
                
                reviews.append(review_data)
                print(f"✓ Review {i}: {review_text[:80]}... (Rating: {rating})")
                
            except Exception as e:
                print(f"✗ Error parsing review {i}: {e}")
                continue
        
        print(f"✓ Successfully extracted {len(reviews)} reviews")
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
                    reviews = scrape_product_reviews_selenium(url, max_reviews=50, driver=driver)
                    
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