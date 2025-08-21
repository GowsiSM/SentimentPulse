# scrape_products.py
import requests
from bs4 import BeautifulSoup
import random
import json
import sys
import os

def scrape_snapdeal_products(category, max_products=20):
    """
    Scrape products from Snapdeal for a given category
    
    Args:
        category (str): The category URL segment (e.g., 'mens-footwear-sports-shoes')
        max_products (int): Maximum number of products to scrape
    
    Returns:
        list: List of product dictionaries
    """
    base_url = f"https://www.snapdeal.com/products/{category}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    products = []
    page = 1
    max_pages = 5  # Limit to first 5 pages to avoid being blocked
    
    while len(products) < max_products and page <= max_pages:
        try:
            page_url = f"{base_url}?page={page}"
            print(f"Scraping page {page}: {page_url}")
            
            response = requests.get(page_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Find product containers
            product_containers = soup.select(".product-tuple-listing")
            
            if not product_containers:
                print(f"No products found on page {page}")
                break
            
            for product in product_containers:
                if len(products) >= max_products:
                    break
                
                try:
                    # Extract title
                    title_tag = product.select_one(".product-title")
                    if not title_tag:
                        continue
                    title = title_tag.get_text(strip=True)
                    
                    # Extract link
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
                        price_text = price_tag.get_text(strip=True)
                        # Extract numeric price
                        import re
                        price_match = re.search(r'[\d,]+', price_text.replace('₹', '').replace('Rs', ''))
                        if price_match:
                            try:
                                price = int(price_match.group().replace(',', ''))
                            except ValueError:
                                pass
                    
                    # Extract image URL
                    image_url = None
                    img_tag = product.select_one("img")
                    if img_tag and img_tag.get("src"):
                        image_url = img_tag["src"]
                        if image_url.startswith("//"):
                            image_url = "https:" + image_url
                    
                    # Extract discount/offer info
                    discount = None
                    discount_tag = product.select_one(".product-discount")
                    if discount_tag:
                        discount = discount_tag.get_text(strip=True)
                    
                    product_data = {
                        "id": f"{category}-{len(products)}",
                        "title": title,
                        "link": link,
                        "price": price,
                        "image_url": image_url,
                        "discount": discount,
                        "category": category,
                        "reviews": [],
                        "sentiment": None,
                        "scraped_at": str(datetime.now()) if 'datetime' in globals() else None
                    }
                    
                    products.append(product_data)
                    print(f"Scraped: {title[:50]}...")
                    
                except Exception as e:
                    print(f"Error parsing product: {e}")
                    continue
            
            page += 1
            
            # Add delay to avoid being blocked
            import time
            time.sleep(random.uniform(1, 3))
            
        except Exception as e:
            print(f"Error scraping page {page}: {e}")
            break
    
    return products

def save_products_to_file(products, category):
    """Save products to JSON file"""
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    filename = f"data/products_{category}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=4, ensure_ascii=False)
    
    print(f"Saved {len(products)} products to {filename}")
    return filename

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python scrape_products.py <category> [max_products]")
        print("Example: python scrape_products.py mens-footwear-sports-shoes 20")
        return
    
    category = sys.argv[1]
    max_products = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    print(f"Scraping products for category: {category}")
    print(f"Maximum products: {max_products}")
    
    try:
        products = scrape_snapdeal_products(category, max_products)
        
        if products:
            save_products_to_file(products, category)
            print(f"Successfully scraped {len(products)} products")
            
            # Print first few products as preview
            print("\nFirst 3 products:")
            for i, product in enumerate(products[:3]):
                print(f"{i+1}. {product['title']}")
                print(f"   Price: ₹{product.get('price', 'N/A')}")
                print(f"   Link: {product['link'][:50]}...")
                print()
        else:
            print("No products found. The category might be invalid or the website structure changed.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    from datetime import datetime
    main()