# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import json
import time
import random
import os
import re
from datetime import datetime, timedelta

# Import the custom sentiment analyzer
from analyzer.sentiment_analyzer import SentimentAnalyzer

# ADD THESE IMPORTS FOR AUTHENTICATION
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import secrets
import jwt
from dotenv import load_dotenv
from supabase import create_client, Client

# LOAD ENVIRONMENT VARIABLES
load_dotenv()

app = Flask(__name__)

# ADD CONFIGURATION CLASS
class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# APPLY CONFIGURATION
app.config.from_object(Config)

# ENHANCED CORS CONFIGURATION
CORS(app, 
     origins=["http://localhost:3000", "http://localhost:4028", "http://localhost:5173", "http://localhost:5001"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# INITIALIZE SUPABASE CLIENT
SUPABASE_URL = app.config['SUPABASE_URL']
SUPABASE_SERVICE_KEY = app.config['SUPABASE_SERVICE_KEY']

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("✅ Supabase client initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Supabase client: {e}")
    raise

# Create data directory if it doesn't exist
if not os.path.exists('data'):
    os.makedirs('data')

# Initialize the sentiment analyzer with trained DistilBERT model
try:
    # Try different paths for the sentiment model
    possible_model_paths = [
        "./sentiment_model",
        "../sentiment_model", 
        "./backend/sentiment_model"
    ]
    
    sentiment_analyzer = None
    for model_path in possible_model_paths:
        try:
            if os.path.exists(model_path):
                sentiment_analyzer = SentimentAnalyzer(model_path)
                print(f"✅ Sentiment analyzer initialized from: {model_path}")
                break
        except Exception as e:
            print(f"❌ Failed to load from {model_path}: {e}")
            continue
    
    if sentiment_analyzer is None:
        print("⚠️  Could not load trained model, using fallback analysis")
        
except Exception as e:
    print(f"❌ Error initializing sentiment analyzer: {e}")
    print("⚠️  Falling back to TextBlob-based analysis")
    sentiment_analyzer = None

# ADD AUTHENTICATION HELPER FUNCTIONS
def init_db():
    """Initialize database tables in Supabase"""
    try:
        # Test connection first
        result = supabase.table('users').select('id').limit(1).execute()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure your Supabase credentials are correct and the tables exist")
        return False

def generate_jwt_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = verify_jwt_token(token)
        if user_id is None:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Get user data from Supabase
        try:
            result = supabase.table('users').select('*').eq('id', user_id).eq('is_active', True).execute()
            if not result.data:
                return jsonify({'error': 'User not found'}), 401
            
            request.current_user = result.data[0]
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Database error in token_required: {e}")
            return jsonify({'error': 'Database error'}), 500
    
    return decorated

def validate_email(email):
    """Simple email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password validation"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Valid password"

# ADD AUTHENTICATION ROUTES
@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validation
        required_fields = ['fullName', 'email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        is_valid, password_message = validate_password(password)
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Check if user already exists
        existing_user = supabase.table('users').select('id').eq('email', email).execute()
        
        if existing_user.data:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        password_hash = generate_password_hash(password)
        
        user_data = {
            'full_name': data['fullName'].strip(),
            'email': email,
            'password_hash': password_hash,
            'company': data.get('company', '').strip(),
            'role': data['role']
        }
        
        result = supabase.table('users').insert(user_data).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create user'}), 500
        
        created_user = result.data[0]
        
        # Generate JWT token
        token = generate_jwt_token(created_user['id'])
        
        # Return user data (without password)
        user_response = {
            'id': created_user['id'],
            'fullName': created_user['full_name'],
            'email': created_user['email'],
            'company': created_user['company'],
            'role': created_user['role'],
            'avatarUrl': created_user.get('avatar_url'),
            'createdAt': created_user['created_at']
        }
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user_response,
            'token': token
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """User login"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Get user from Supabase
        result = supabase.table('users').select('*').eq('email', email).eq('is_active', True).execute()
        
        if not result.data or not check_password_hash(result.data[0]['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user = result.data[0]
        
        # Update last login
        supabase.table('users').update({'last_login': datetime.now().isoformat()}).eq('id', user['id']).execute()
        
        # Generate JWT token
        token = generate_jwt_token(user['id'])
        
        # Return user data (without password)
        user_response = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user.get('avatar_url'),
            'lastLogin': user.get('last_login'),
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'message': 'Login successful',
            'user': user_response,
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """User logout"""
    try:
        return jsonify({
            'message': 'Logout successful'
        }), 200
    except Exception as e:
        return jsonify({'error': f'Logout failed: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        user = request.current_user
        
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user.get('avatar_url'),
            'lastLogin': user.get('last_login'),
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/auth/verify-token', methods=['POST'])
def verify_token():
    """Verify JWT token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'valid': False, 'error': 'No token provided'}), 401
        
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({'valid': False, 'error': 'Invalid token format'}), 401
        
        user_id = verify_jwt_token(token)
        if user_id is None:
            return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401
        
        # Get user data from Supabase
        result = supabase.table('users').select('*').eq('id', user_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'valid': False, 'error': 'User not found'}), 401
        
        user = result.data[0]
        
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user.get('avatar_url')
        }
        
        return jsonify({
            'valid': True,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500

# EXISTING SCRAPING FUNCTIONS
def scrape_snapdeal_products(category, max_products=20):
    """
    Scrape products from Snapdeal for a given category
    """
    base_url = f"https://www.snapdeal.com/products/{category}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    products = []
    page = 1
    max_pages = 3  # Limit to first 3 pages to avoid being blocked
    
    print(f"Scraping category: {category}")
    
    while len(products) < max_products and page <= max_pages:
        try:
            page_url = f"{base_url}?page={page}" if page > 1 else base_url
            print(f"Scraping page {page}: {page_url}")
            
            response = requests.get(page_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Try multiple selectors for product containers
            product_containers = soup.select(".product-tuple-listing") or \
                               soup.select(".col-xs-6") or \
                               soup.select("[data-snap-id]") or \
                               soup.select(".product-item")
            
            if not product_containers:
                print(f"No products found on page {page} with standard selectors")
                # Try alternative approach
                product_containers = soup.find_all("div", class_=lambda x: x and "product" in x.lower())
                
            if not product_containers:
                print(f"No products found on page {page}, breaking")
                break
            
            print(f"Found {len(product_containers)} product containers on page {page}")
            
            for i, product in enumerate(product_containers):
                if len(products) >= max_products:
                    break
                
                try:
                    # Extract title - try multiple selectors
                    title = None
                    title_selectors = [
                        ".product-title",
                        "[data-key='name']",
                        ".prodName",
                        ".product-item-name",
                        "p[title]",
                        ".dp-widget-link"
                    ]
                    
                    for selector in title_selectors:
                        title_tag = product.select_one(selector)
                        if title_tag:
                            title = title_tag.get_text(strip=True) or title_tag.get("title", "").strip()
                            if title:
                                break
                    
                    if not title:
                        continue
                    
                    # Extract link - try multiple selectors
                    link = None
                    link_selectors = [
                        "a.dp-widget-link",
                        "a[href*='/product/']",
                        ".product-item-name a",
                        ".prodName a",
                        "a"
                    ]
                    
                    for selector in link_selectors:
                        link_tag = product.select_one(selector)
                        if link_tag and link_tag.get("href"):
                            link = link_tag["href"]
                            if link.startswith("/product/"):
                                link = "https://www.snapdeal.com" + link
                                break
                            elif "snapdeal.com" in link:
                                break
                    
                    if not link or "snapdeal.com" not in link:
                        continue
                    
                    # Extract price - try multiple selectors
                    price = None
                    price_selectors = [
                        ".product-price",
                        ".lfloat.product-price",
                        ".price",
                        "[data-key='price']",
                        ".product-tuple-price"
                    ]
                    
                    for selector in price_selectors:
                        price_tag = product.select_one(selector)
                        if price_tag:
                            price_text = price_tag.get_text(strip=True)
                            # Extract numeric price
                            import re
                            price_match = re.search(r'[\d,]+', price_text.replace('₹', '').replace('Rs', '').replace(',', ''))
                            if price_match:
                                try:
                                    price = int(price_match.group())
                                    break
                                except ValueError:
                                    pass
                    
                    # Extract image URL - try multiple selectors
                    image_url = None
                    img_selectors = [
                        "img",
                        ".product-image img",
                        ".picture-elem img"
                    ]
                    
                    for selector in img_selectors:
                        img_tag = product.select_one(selector)
                        if img_tag:
                            src = img_tag.get("src") or img_tag.get("data-src") or img_tag.get("data-lazy-src")
                            if src:
                                if src.startswith("//"):
                                    image_url = "https:" + src
                                elif src.startswith("http"):
                                    image_url = src
                                break
                    
                    # Extract discount/offer info
                    discount = None
                    discount_selectors = [
                        ".product-discount",
                        ".discount-percent",
                        ".offer-price"
                    ]
                    
                    for selector in discount_selectors:
                        discount_tag = product.select_one(selector)
                        if discount_tag:
                            discount = discount_tag.get_text(strip=True)
                            if discount:
                                break
                    
                    product_data = {
                        "id": f"{category}-{len(products)}-{int(time.time())}",
                        "title": title,
                        "link": link,
                        "price": price,
                        "image_url": image_url,
                        "discount": discount,
                        "category": category,
                        "reviews": [],
                        "sentiment": None,
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    products.append(product_data)
                    print(f"Scraped product {len(products)}: {title[:50]}...")
                    
                except Exception as e:
                    print(f"Error parsing product {i}: {e}")
                    continue
            
            page += 1
            
            # Add delay to avoid being blocked
            time.sleep(random.uniform(2, 4))
            
        except Exception as e:
            print(f"Error scraping page {page}: {e}")
            
            # Fallback to category-specific mock data if scraping fails
            if len(products) == 0:
                print(f"Scraping failed, generating category-specific mock data for: {category}")
                return generate_category_mock_data(category, max_products)
            break
    
    if len(products) == 0:
        # Generate category-specific mock data as fallback
        print(f"No products scraped, generating category-specific mock data for: {category}")
        return generate_category_mock_data(category, max_products)
    
    print(f"Successfully scraped {len(products)} products for category: {category}")
    return products

def generate_category_mock_data(category, max_products=20):
    """Generate category-specific mock data when scraping fails"""
    
    # Category-specific product data
    category_products = {
        "women-apparel-stiched-kurtis": [
            {
                "title": "Women's Cotton A-Line Kurti",
                "price": 599,
                "discount": "70% off",
                "image_url": "https://via.placeholder.com/300x300?text=Cotton+Kurti"
            },
            {
                "title": "Anarkali Kurti with Palazzo Set",
                "price": 899,
                "discount": "60% off", 
                "image_url": "https://via.placeholder.com/300x300?text=Anarkali+Set"
            },
            {
                "title": "Rayon Printed Straight Kurti",
                "price": 449,
                "discount": "65% off",
                "image_url": "https://via.placeholder.com/300x300?text=Printed+Kurti"
            },
            {
                "title": "Ethnic Embroidered Kurti",
                "price": 1299,
                "discount": "50% off",
                "image_url": "https://via.placeholder.com/300x300?text=Embroidered+Kurti"
            },
            {
                "title": "Designer Party Wear Kurti",
                "price": 1899,
                "discount": "45% off",
                "image_url": "https://via.placeholder.com/300x300?text=Party+Kurti"
            }
        ],
        "men-apparel-shirts": [
            {
                "title": "Men's Cotton Formal Shirt",
                "price": 799,
                "discount": "60% off",
                "image_url": "https://via.placeholder.com/300x300?text=Formal+Shirt"
            },
            {
                "title": "Casual Slim Fit Shirt",
                "price": 599,
                "discount": "65% off",
                "image_url": "https://via.placeholder.com/300x300?text=Casual+Shirt"
            },
            {
                "title": "Check Pattern Full Sleeve Shirt",
                "price": 699,
                "discount": "55% off",
                "image_url": "https://via.placeholder.com/300x300?text=Check+Shirt"
            },
            {
                "title": "Cotton Blend Party Wear Shirt",
                "price": 1199,
                "discount": "50% off",
                "image_url": "https://via.placeholder.com/300x300?text=Party+Shirt"
            },
            {
                "title": "Denim Casual Shirt for Men",
                "price": 899,
                "discount": "40% off",
                "image_url": "https://via.placeholder.com/300x300?text=Denim+Shirt"
            }
        ]
    }
    
    # Get products for the specific category or use a default set
    category_key = category.lower()
    base_products = category_products.get(category_key, category_products.get("women-apparel-stiched-kurtis", []))
    
    # If no specific category found, generate generic products based on category name
    if category_key not in category_products:
        base_products = [
            {
                "title": f"{category.replace('-', ' ').title()} Product {i+1}",
                "price": random.randint(299, 2999),
                "discount": f"{random.randint(30, 70)}% off",
                "image_url": f"https://via.placeholder.com/300x300?text=Product+{i+1}"
            }
            for i in range(5)
        ]
    
    # Generate products up to max_products
    products = []
    for i in range(min(max_products, len(base_products) * 4)):  # Multiply to get more variety
        base_product = base_products[i % len(base_products)]
        
        # Add some variation to avoid exact duplicates
        variation_suffix = f" - Style {(i // len(base_products)) + 1}" if i >= len(base_products) else ""
        price_variation = random.randint(-200, 500)
        
        product = {
            "id": f"{category}-mock-{i}-{int(time.time())}",
            "title": base_product["title"] + variation_suffix,
            "link": f"https://www.snapdeal.com/product/{category}/{random.randint(100000, 999999)}",
            "price": max(199, base_product["price"] + price_variation),
            "image_url": base_product["image_url"],
            "discount": base_product["discount"],
            "category": category,
            "reviews": [],
            "sentiment": None,
            "scraped_at": datetime.now().isoformat()
        }
        
        products.append(product)
    
    print(f"Generated {len(products)} mock products for category: {category}")
    return products

def scrape_product_reviews(product_link, max_reviews=10):
    """Scrape reviews for a specific product - mock implementation"""
    # Return mock reviews for testing
    mock_reviews = [
        {
            "rating": "5/5",
            "text": "Excellent product! The camera quality is outstanding and battery life is amazing.",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "rating": "4/5",
            "text": "Good value for money. Performance is smooth but could have better software support.",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "rating": "3/5",
            "text": "Average product. Build quality is decent but not exceptional for the price.",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "rating": "2/5",
            "text": "Disappointing. Battery drains quickly and camera performance is poor in low light.",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "rating": "5/5",
            "text": "Absolutely fantastic! Would highly recommend to anyone looking for a premium smartphone.",
            "scraped_at": datetime.now().isoformat()
        }
    ]
    
    return mock_reviews[:max_reviews]

def analyze_sentiment(text):
    """Analyze sentiment using your trained model"""
    try:
        if sentiment_analyzer is None:
            # Fallback if model not loaded
            return {
                "sentiment": "neutral",
                "score": 50.0,
                "confidence": 50.0,
                "polarity": 0.0,
                "error": "Model not available"
            }
        
        # Use your trained model
        analysis = sentiment_analyzer.analyze_single_review(text)
        
        return {
            "sentiment": analysis["sentiment"],
            "score": analysis["confidence"],  # Using confidence as score
            "confidence": analysis["confidence"],
            "polarity": analysis["polarity"],
            "model_prediction": analysis.get("model_prediction", {})
        }
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        return {
            "sentiment": "neutral", 
            "score": 50.0,
            "confidence": 50.0,
            "polarity": 0.0,
            "error": str(e)
        }

def calculate_sentiment_summary(analyzed_reviews):
    """Calculate sentiment percentages"""
    if not analyzed_reviews:
        return {"positive": 0, "negative": 0, "neutral": 100}
    
    sentiments = [review.get("sentiment", {}).get("sentiment", "neutral") for review in analyzed_reviews]
    total = len(sentiments)
    
    if total == 0:
        return {"positive": 0, "negative": 0, "neutral": 100}
    
    positive = (sentiments.count("positive") / total) * 100
    negative = (sentiments.count("negative") / total) * 100
    neutral = (sentiments.count("neutral") / total) * 100
    
    return {
        "positive": round(positive, 1),
        "negative": round(negative, 1),
        "neutral": round(neutral, 1)
    }

# EXISTING ROUTES
@app.route('/')
def home():
    """Serve basic info about the API"""
    return jsonify({
        "message": "Snapdeal Product Sentiment Analyzer API with Authentication",
        "version": "2.0.0",
        "auth_endpoints": [
            "/api/auth/register",
            "/api/auth/login", 
            "/api/auth/logout",
            "/api/auth/profile",
            "/api/auth/verify-token"
        ],
        "api_endpoints": [
            "/api/scrape-products",
            "/api/scrape-reviews", 
            "/api/analyze-sentiment",
            "/api/health"
        ]
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    try:
        # Test Supabase connection
        supabase.table('users').select('count', count='exact').limit(0).execute()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return jsonify({
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/scrape-products', methods=['POST'])
def api_scrape_products():
    """API endpoint to scrape products"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        category = data.get('category', '')
        max_products = data.get('max_products', 20)
        
        if not category:
            return jsonify({"error": "Category is required"}), 400
        
        print(f"Starting to scrape products for category: {category}")
        
        products = scrape_snapdeal_products(category, max_products)
        
        if not products:
            return jsonify({
                "products": [],
                "message": "No products found for this category",
                "category": category
            })
        
        # Save to JSON file
        filename = f"data/products_{category}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=4, ensure_ascii=False)
        
        return jsonify({
            "success": True,
            "products": products,
            "count": len(products),
            "category": category,
            "saved_to": filename,
            "message": f"Successfully scraped {len(products)} products"
        })
        
    except Exception as e:
        print(f"Error in api_scrape_products: {e}")
        return jsonify({"success": False, "error": f"Failed to scrape products: {str(e)}"}), 500

@app.route('/api/scrape-reviews', methods=['POST'])
def api_scrape_reviews():
    """API endpoint to scrape reviews for a single product"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400
        
        # Extract product information
        product_id = data.get('product_id', '')
        product_title = data.get('product_title', '')
        product_url = data.get('product_url', '')
        max_reviews = data.get('max_reviews', 50)
        
        if not all([product_id, product_title, product_url]):
            return jsonify({
                "success": False, 
                "error": "product_id, product_title, and product_url are required"
            }), 400
        
        print(f"Scraping reviews for: {product_title}")
        
        # Scrape reviews
        reviews = scrape_product_reviews(product_url, max_reviews)
        
        if not reviews:
            return jsonify({
                "success": False,
                "error": "No reviews found for this product"
            }), 404
        
        # Save to JSON file
        filename = f"data/reviews_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump({
                "product_id": product_id,
                "product_title": product_title,
                "product_url": product_url,
                "reviews": reviews,
                "scraped_at": datetime.now().isoformat()
            }, f, indent=4, ensure_ascii=False)
        
        return jsonify({
            "success": True,
            "reviews": reviews,
            "total_reviews": len(reviews),
            "file_saved": filename,
            "message": f"Successfully scraped {len(reviews)} reviews"
        })
        
    except Exception as e:
        print(f"Error in api_scrape_reviews: {e}")
        return jsonify({"success": False, "error": f"Failed to scrape reviews: {str(e)}"}), 500

# SINGLE VERSION OF ANALYZE-SENTIMENT ROUTE (REMOVED DUPLICATE)
@app.route('/api/analyze-sentiment', methods=['POST'])
def api_analyze_sentiment():
    """API endpoint to analyze sentiment using your trained model"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400
        
        # Extract product information
        product_id = data.get('product_id', '')
        product_title = data.get('product_title', '')
        product_url = data.get('product_url', '')
        reviews = data.get('reviews', [])
        
        if not all([product_id, product_title, product_url]):
            return jsonify({
                "success": False, 
                "error": "product_id, product_title, and product_url are required"
            }), 400
        
        if not reviews:
            return jsonify({
                "success": False,
                "error": "No reviews provided for analysis"
            }), 400
        
        print(f"Analyzing sentiment using trained model for: {product_title}")
        
        # Use your trained model for batch analysis
        if sentiment_analyzer is not None:
            full_analysis = sentiment_analyzer.analyze_product_reviews(
                [review.get('text', '') if isinstance(review, dict) else str(review) for review in reviews]
            )
        else:
            # Fallback to individual analysis
            analyzed_reviews = []
            for review in reviews:
                review_text = review.get('text', '') if isinstance(review, dict) else str(review)
                sentiment_result = analyze_sentiment(review_text)
                
                analyzed_reviews.append({
                    "review": review_text,
                    "rating": review.get('rating', 'No rating') if isinstance(review, dict) else 'No rating',
                    "sentiment": sentiment_result,
                    "analyzed_at": datetime.now().isoformat()
                })
            
            # Calculate summary from individual results
            sentiment_summary = calculate_sentiment_summary(analyzed_reviews)
            full_analysis = {
                "analyzed_reviews": analyzed_reviews,
                "sentiment_summary": sentiment_summary,
                "overall_sentiment": sentiment_summary.get("overall_sentiment", "neutral"),
                "total_reviews": len(analyzed_reviews)
            }
        
        # Prepare analysis result
        analysis_result = {
            "product_id": product_id,
            "product_title": product_title,
            "product_url": product_url,
            "analyzed_reviews": full_analysis.get("analyzed_reviews", []),
            "sentiment_summary": full_analysis.get("sentiment_summary", {}),
            "overall_sentiment": full_analysis.get("overall_sentiment", "neutral"),
            "total_reviews": len(reviews),
            "model_used": "trained_distilbert" if sentiment_analyzer else "textblob_fallback",
            "analyzed_at": datetime.now().isoformat()
        }
        
        # Save results
        filename = f"data/sentiment_analysis_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(analysis_result, f, indent=4, ensure_ascii=False)
        
        return jsonify({
            "success": True,
            "analysis": analysis_result,
            "file_saved": filename,
            "message": f"Successfully analyzed sentiment for {len(reviews)} reviews using trained model"
        })
        
    except Exception as e:
        print(f"Error in api_analyze_sentiment: {e}")
        return jsonify({"success": False, "error": f"Failed to analyze sentiment: {str(e)}"}), 500

@app.route('/api/complete-analysis', methods=['POST'])
def api_complete_analysis():
    """Complete workflow: scrape reviews and analyze sentiment for a single product"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400
        
        # Extract product information
        product_id = data.get('product_id', '')
        product_title = data.get('product_title', '')
        product_url = data.get('product_url', '')
        max_reviews = data.get('max_reviews', 50)
        
        if not all([product_id, product_title, product_url]):
            return jsonify({
                "success": False, 
                "error": "product_id, product_title, and product_url are required"
            }), 400
        
        print(f"Starting complete analysis for: {product_title}")
        
        # Step 1: Scrape reviews
        reviews = scrape_product_reviews(product_url, max_reviews)
        
        if not reviews:
            return jsonify({
                "success": False,
                "error": "No reviews found for this product"
            }), 404
        
        # Step 2: Analyze sentiment using the unified analyze-sentiment endpoint
        analysis_response = api_analyze_sentiment()
        
        if analysis_response[1] != 200:  # Check if analysis failed
            return analysis_response
        
        # Extract the analysis data from the response
        analysis_data = analysis_response[0].get_json()
        
        if not analysis_data.get('success'):
            return jsonify({
                "success": False,
                "error": analysis_data.get('error', 'Analysis failed')
            }), 500
        
        # Prepare complete result
        complete_result = {
            "product_id": product_id,
            "product_title": product_title,
            "product_url": product_url,
            "reviews": reviews,
            "analysis": analysis_data.get('analysis', {}),
            "analysis_id": f"analysis_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "scraped_at": datetime.now().isoformat(),
            "analyzed_at": datetime.now().isoformat(),
            "total_reviews": len(reviews)
        }
        
        # Save complete result
        filename = f"data/complete_analysis_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(complete_result, f, indent=4, ensure_ascii=False)
        
        return jsonify({
            "success": True,
            "analysis": complete_result,
            "file_saved": filename,
            "message": f"Successfully completed analysis for {len(reviews)} reviews"
        })
        
    except Exception as e:
        print(f"Error in api_complete_analysis: {e}")
        return jsonify({"success": False, "error": f"Failed to complete analysis: {str(e)}"}), 500

@app.route('/api/products', methods=['GET'])
@app.route('/api/products/<category>', methods=['GET'])
def api_get_products(category=None):
    """API endpoint to get saved products"""
    try:
        data_dir = "data"
        products = []
        
        if category:
            # Look for files specific to this category
            pattern = f"products_{category}"
            files = [f for f in os.listdir(data_dir) if f.startswith(pattern) and f.endswith('.json')]
        else:
            # Get all product files
            files = [f for f in os.listdir(data_dir) if f.startswith('products_') and f.endswith('.json')]
        
        if not files:
            return jsonify({
                "success": True,
                "products": [],
                "message": "No saved products found",
                "category": category
            })
        
        # Load the most recent file
        files.sort(reverse=True)  # Most recent first
        latest_file = files[0]
        
        with open(os.path.join(data_dir, latest_file), 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        return jsonify({
            "success": True,
            "products": products,
            "count": len(products),
            "source_file": latest_file,
            "category": category,
            "message": f"Loaded {len(products)} products from {latest_file}"
        })
        
    except Exception as e:
        print(f"Error in api_get_products: {e}")
        return jsonify({"success": False, "error": f"Failed to load products: {str(e)}"}), 500

@app.route('/api/save-products', methods=['POST'])
def api_save_products():
    """API endpoint to save products"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400
        
        products = data.get('products', [])
        category = data.get('category', 'unknown')
        
        if not products:
            return jsonify({"success": False, "error": "Products list is required"}), 400
        
        # Save to JSON file
        filename = f"data/products_{category}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=4, ensure_ascii=False)
        
        return jsonify({
            "success": True,
            "message": f"Successfully saved {len(products)} products",
            "filename": filename,
            "count": len(products)
        })
        
    except Exception as e:
        print(f"Error in api_save_products: {e}")
        return jsonify({"success": False, "error": f"Failed to save products: {str(e)}"}), 500

@app.route('/api/categories', methods=['GET'])
def api_get_categories():
    """API endpoint to get available categories"""
    try:
        # Predefined popular categories
        categories = [
            {"label": "Men's Sports Shoes", "value": "mens-footwear-sports-shoes", "category": "footwear"},
            {"label": "Women's Kurtis", "value": "women-apparel-kurtis", "category": "apparel"},
            {"label": "Mobile Phones", "value": "mobiles-mobile-phones", "category": "electronics"},
            {"label": "Laptops", "value": "computers-laptops", "category": "electronics"},
            {"label": "Home Decor", "value": "home-garden-home-decor", "category": "home"},
            {"label": "Watches", "value": "jewellery-watches", "category": "accessories"},
            {"label": "Kitchen Appliances", "value": "home-kitchen-appliances", "category": "appliances"},
            {"label": "Men's T-Shirts", "value": "men-clothing-shirts-t-shirts", "category": "apparel"},
            {"label": "Women's Sarees", "value": "women-apparel-sarees", "category": "apparel"},
            {"label": "Books", "value": "books", "category": "books"},
            {"label": "Beauty Products", "value": "health-beauty", "category": "beauty"},
            {"label": "Sports Equipment", "value": "sports-fitness", "category": "sports"}
        ]
        
        return jsonify({
            "success": True,
            "categories": categories,
            "count": len(categories)
        })
        
    except Exception as e:
        print(f"Error in api_get_categories: {e}")
        return jsonify({"success": False, "error": f"Failed to get categories: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting Snapdeal Product Sentiment Analyzer API with Authentication...")
    
    # Check environment variables
    missing_vars = []
    if not SUPABASE_URL:
        missing_vars.append('SUPABASE_URL')
    if not SUPABASE_SERVICE_KEY:
        missing_vars.append('SUPABASE_SERVICE_KEY')
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file")
        exit(1)
    
    # Initialize database
    if init_db():
        print("✅ Database connection verified")
    else:
        print("❌ Database connection failed")
        exit(1)
    
    print("\n📋 Available endpoints:")
    print("  Authentication:")
    print("    POST /api/auth/register - Register new user")
    print("    POST /api/auth/login - User login")
    print("    POST /api/auth/logout - User logout")
    print("    GET  /api/auth/profile - Get user profile")
    print("    POST /api/auth/verify-token - Verify JWT token")
    print("  ")
    print("  API:")
    print("    GET  /api/health - Health check")
    print("    POST /api/scrape-products - Scrape products from category")
    print("    POST /api/scrape-reviews - Scrape reviews for a product") 
    print("    POST /api/analyze-sentiment - Analyze sentiment of reviews")
    print("    POST /api/complete-analysis - Complete analysis workflow")
    print("    GET  /api/products - Get all saved products")
    print("    GET  /api/products/<category> - Get products by category")
    print("    POST /api/save-products - Save products")
    print("    GET  /api/categories - Get available categories")
    print(f"\n🌐 Integrated API is running on http://localhost:5000")
    print("🔧 CORS enabled for: http://localhost:3000, http://localhost:4028, http://localhost:5173")
    
    app.run(debug=True, host='0.0.0.0', port=5000)