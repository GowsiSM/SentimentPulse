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
    """Scrape ALL reviews using Selenium with pagination"""
    should_quit = driver is None
    if driver is None:
        driver = setup_driver()
    
    try:
        # Convert product URL to reviews URL
        if '/reviews' not in product_url:
            # Extract product path and add /reviews
            product_url = product_url.rstrip('/')
            reviews_base_url = f"{product_url}/reviews"
        else:
            reviews_base_url = product_url.split('?')[0]  # Remove query params
        
        print(f"Base reviews URL: {reviews_base_url}")
        
        all_reviews = []
        page = 1
        max_pages = 100  # Safety limit
        
        while page <= max_pages:
            # Construct page URL
            if page == 1:
                page_url = reviews_base_url
            else:
                page_url = f"{reviews_base_url}?page={page}"
            
            print(f"\n📄 Loading reviews page {page}...")
            driver.get(page_url)
            time.sleep(3)
            
            # Check if we're on a valid reviews page
            try:
                # Wait for reviews container
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "#reviewsContainer, .user-review, .reviewCard"))
                )
            except TimeoutException:
                print(f"✗ No reviews found on page {page}")
                break
            
            # Extract reviews from current page
            page_reviews = extract_reviews_from_page(driver)
            
            if not page_reviews:
                print(f"✗ No reviews extracted from page {page} - reached end")
                break
            
            all_reviews.extend(page_reviews)
            print(f"✓ Extracted {len(page_reviews)} reviews from page {page} (Total: {len(all_reviews)})")
            
            # Check if there's a next page
            has_next_page = False
            try:
                # Look for pagination controls
                next_button_selectors = [
                    "a[href*='page=" + str(page + 1) + "']",
                    ".pagination a.next",
                    "a.next-page",
                    ".pagination li.active + li a",
                    "a[rel='next']"
                ]
                
                for selector in next_button_selectors:
                    try:
                        next_btn = driver.find_element(By.CSS_SELECTOR, selector)
                        if next_btn.is_displayed():
                            has_next_page = True
                            break
                    except:
                        continue
                
                # Alternative: Check if reviews count indicates more pages
                if not has_next_page:
                    try:
                        # Look for "1-10 of 23 Reviews" type text
                        review_count_elem = driver.find_element(By.CSS_SELECTOR, ".review-count, .reviews-header, [class*='review-total']")
                        count_text = review_count_elem.text
                        # Parse "1-10 of 23" format
                        import re
                        match = re.search(r'(\d+)-(\d+)\s+of\s+(\d+)', count_text)
                        if match:
                            current_end = int(match.group(2))
                            total_reviews = int(match.group(3))
                            has_next_page = current_end < total_reviews
                    except:
                        pass
                
            except Exception as e:
                print(f"  Could not check for next page: {e}")
            
            if not has_next_page:
                print(f"✓ Reached last page ({page})")
                break
            
            page += 1
            time.sleep(2)  # Be polite to the server
        
        print(f"\n✅ Total reviews extracted: {len(all_reviews)} from {page} pages")
        return all_reviews
        
    except Exception as e:
        print(f"✗ Error scraping reviews: {e}")
        import traceback
        traceback.print_exc()
        return all_reviews if 'all_reviews' in locals() else []
    
    finally:
        if should_quit and driver:
            driver.quit()

def extract_reviews_from_page(driver):
    """Extract all reviews from the current page"""
    reviews = []
    
    # Find review items
    review_selectors = [
        ".user-review",
        ".reviewCard",
        ".review-card",
        "[class*='review-item']",
        ".comp-review-wrapper .review",
        "#reviewsContainer .clearfix[class*='review']"
    ]
    
    review_items = []
    for selector in review_selectors:
        review_items = driver.find_elements(By.CSS_SELECTOR, selector)
        if len(review_items) > 0:
            break
    
    if not review_items:
        return reviews
    
    for item in review_items:
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
                ".review-description"
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
                    lines = all_text.split('\n')
                    # Usually review text is the longest line
                    review_text = max(lines, key=len) if lines else all_text
            
            if not review_text or len(review_text) < 20:
                continue
            
            # Extract rating
            rating = "No rating"
            try:
                rating_elem = item.find_element(By.CSS_SELECTOR, ".filled-stars")
                style = rating_elem.get_attribute("style") or ""
                if "width" in style:
                    import re
                    width_match = re.search(r'width:\s*(\d+\.?\d*)%', style)
                    if width_match:
                        width = float(width_match.group(1))
                        rating = f"{width/20:.1f}/5"
            except:
                pass
            
            # Extract reviewer and date
            reviewer = "Anonymous"
            review_date = "Unknown date"
            try:
                reviewer_elem = item.find_element(By.CSS_SELECTOR, ".reviewer-name, .user-name, .reviewer")
                meta_text = reviewer_elem.text.strip()
                
                if " on " in meta_text:
                    parts = meta_text.split(" on ")
                    if len(parts) == 2:
                        reviewer = parts[0].replace("by", "").replace("By", "").strip()
                        review_date = parts[1].strip()
                else:
                    reviewer = meta_text
            except:
                pass
            
            # Try to get date separately if not found
            if review_date == "Unknown date":
                try:
                    date_elem = item.find_element(By.CSS_SELECTOR, ".review-date, .date, [class*='date']")
                    review_date = date_elem.text.strip()
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
            
        except Exception as e:
            continue
    
    return reviews
            
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