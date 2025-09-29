# snapdeal_sentiment_analyzer/backend/sentiment_analysis.py
#!/usr/bin/env python3
"""
Flask Backend Server for Sentiment Analysis
Handles review scraping and sentiment analysis requests
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import logging
import tempfile
import subprocess
import uuid
from datetime import datetime
from analyzer.sentiment_analyzer import SentimentAnalyzer
import requests
from bs4 import BeautifulSoup
import time
import random

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Create data directory if it doesn't exist
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Initialize the sentiment analyzer
try:
    sentiment_analyzer = SentimentAnalyzer()
    logger.info("Sentiment analyzer initialized successfully")
except Exception as e:
    logger.error(f"Error initializing sentiment analyzer: {e}")
    sentiment_analyzer = None

class ReviewScraper:
    """Mock review scraper - replace with actual scraping logic"""
    
    @staticmethod
    def scrape_snapdeal_reviews(product_url, max_reviews=100):
        """
        Mock function to scrape reviews from Snapdeal
        Replace this with actual web scraping implementation
        """
        # This is a mock implementation - in production you'd implement actual scraping
        mock_reviews = [
            "Excellent product! The iPhone 14 Pro exceeded my expectations. The camera quality is outstanding, especially in low light conditions. The build quality feels premium and the performance is smooth. Battery life easily lasts a full day with heavy usage. Highly recommended for anyone looking for a flagship smartphone.",
            "Very disappointed with this purchase. The Samsung Galaxy S24 has heating issues during gaming and the battery drains quickly. The camera app crashes frequently and the overall experience is frustrating. Expected much better quality for this price range. Would not recommend.",
            "Good value for money. The OnePlus 12 offers decent performance and the display quality is impressive. Some minor software bugs but overall a solid choice. Fast charging is a great feature. Camera performance is acceptable for the price point.",
            "Average product with mixed feelings. The Xiaomi 14 has some good features like fast charging and decent display, but the software experience could be better. Build quality is okay but not exceptional. It's an average choice in this price segment.",
            "Fantastic smartphone! The Google Pixel 8 Pro has an amazing camera system with excellent computational photography. Clean Android experience with timely updates. Performance is smooth and the display is vibrant. Great choice for photography enthusiasts.",
            "Terrible experience with this product. The Nothing Phone 2 arrived with a cracked screen and poor packaging. Customer service was unhelpful and the return process was complicated. The phone itself feels cheap and the unique design doesn't compensate for poor quality.",
            "Amazing build quality and premium feel. The camera is superb and takes professional-looking photos. Battery life is excellent and lasts the whole day easily. Fast charging is very convenient. Overall very satisfied with this purchase.",
            "Product quality is good but delivery was delayed by a week. Packaging was adequate but could be better. The phone works as expected and all features function properly. Customer service was responsive when contacted.",
            "Outstanding performance and smooth user interface. Gaming experience is excellent with no lag or heating issues. Display quality is crystal clear and vibrant. Audio quality through speakers is impressive. Would definitely buy again.",
            "Not worth the price. Many better alternatives available in the same price range. Software feels buggy and camera performance is disappointing in low light. Build quality feels cheap despite the premium pricing."
        ]
        
        # Simulate scraping delay
        time.sleep(2)
        
        # Return random subset of reviews
        num_reviews = min(max_reviews, len(mock_reviews))
        selected_reviews = random.sample(mock_reviews, num_reviews)
        
        return {
            'success': True,
            'reviews': selected_reviews,
            'total_found': num_reviews,
            'source_url': product_url
        }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/scrape-reviews', methods=['POST'])
def scrape_reviews():
    """Scrape reviews for a product"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['product_id', 'product_title', 'product_url']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        product_id = data['product_id']
        product_title = data['product_title']
        product_url = data['product_url']
        max_reviews = data.get('max_reviews', 50)
        
        logger.info(f"Scraping reviews for product: {product_title[:50]}...")
        
        # Scrape reviews
        scrape_result = ReviewScraper.scrape_snapdeal_reviews(product_url, max_reviews)
        
        if not scrape_result['success']:
            return jsonify({
                'success': False,
                'error': 'Failed to scrape reviews'
            }), 500
        
        # Save scraped data
        scraped_data = {
            'product_id': product_id,
            'product_title': product_title,
            'product_url': product_url,
            'reviews': scrape_result['reviews'],
            'scraped_at': datetime.now().isoformat(),
            'total_reviews': len(scrape_result['reviews'])
        }
        
        # Save to file
        filename = f"reviews_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump([scraped_data], f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(scrape_result['reviews'])} reviews to {filepath}")
        
        return jsonify({
            'success': True,
            'reviews': scrape_result['reviews'],
            'total_reviews': len(scrape_result['reviews']),
            'file_saved': filename,
            'message': f"Successfully scraped {len(scrape_result['reviews'])} reviews"
        })
        
    except Exception as e:
        logger.error(f"Error in scrape_reviews: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment for product reviews"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['product_id', 'product_title', 'reviews']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        product_id = data['product_id']
        product_title = data['product_title']
        reviews = data['reviews']
        
        if not reviews:
            return jsonify({
                'success': False,
                'error': 'No reviews provided for analysis'
            }), 400
        
        logger.info(f"Analyzing sentiment for {len(reviews)} reviews of: {product_title[:50]}...")
        
        # Analyze each review
        if sentiment_analyzer is None:
            return jsonify({
                'success': False,
                'error': 'Sentiment analyzer not available'
            }), 500
        
        analyzed_reviews = []
        for review_text in reviews:
            analysis = sentiment_analyzer.analyze_single_review(review_text)
            analyzed_reviews.append({
                'review': review_text,
                'sentiment': analysis['sentiment'],
                'confidence': analysis['confidence'],
                'polarity': analysis['polarity'],
                'model_prediction': analysis.get('model_prediction', {})
            })
        
        # Calculate comprehensive summary using the analyzer
        full_analysis = sentiment_analyzer.analyze_product_reviews(reviews)
        summary = {
            'overall_sentiment': full_analysis['overall_sentiment'],
            'sentiment_score': full_analysis['sentiment_score'],
            'sentiment_distribution': {
                'positive': {'count': full_analysis['positive_count'], 'percentage': full_analysis['positive_percent']},
                'negative': {'count': full_analysis['negative_count'], 'percentage': full_analysis['negative_percent']},
                'neutral': {'count': full_analysis['neutral_count'], 'percentage': full_analysis['neutral_percent']}
            },
            'insights': full_analysis['insights'],
            'recommendation': sentiment_analyzer.get_sentiment_summary(full_analysis)
        }
        
        # Prepare analysis result
        analysis_result = {
            'product_id': product_id,
            'product_title': product_title,
            'product_url': data.get('product_url', ''),
            'analyzed_reviews': analyzed_reviews,
            'sentiment_summary': summary,
            'analyzed_at': datetime.now().isoformat(),
            'analysis_id': str(uuid.uuid4())
        }
        
        # Save analysis result
        filename = f"sentiment_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Sentiment analysis completed and saved to {filepath}")
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'file_saved': filename,
            'message': f"Successfully analyzed {len(reviews)} reviews"
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_sentiment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/complete-analysis', methods=['POST'])
def complete_analysis():
    """Complete workflow: scrape reviews and analyze sentiment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['product_id', 'product_title', 'product_url']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        product_id = data['product_id']
        product_title = data['product_title']
        product_url = data['product_url']
        max_reviews = data.get('max_reviews', 50)
        
        logger.info(f"Starting complete analysis for: {product_title[:50]}...")
        
        # Step 1: Scrape reviews
        scrape_result = ReviewScraper.scrape_snapdeal_reviews(product_url, max_reviews)
        
        if not scrape_result['success'] or not scrape_result['reviews']:
            return jsonify({
                'success': False,
                'error': 'No reviews found for this product'
            }), 404
        
        reviews = scrape_result['reviews']
        logger.info(f"Scraped {len(reviews)} reviews, now analyzing sentiment...")
        
        # Step 2: Analyze sentiment
        if sentiment_analyzer is None:
            return jsonify({
                'success': False,
                'error': 'Sentiment analyzer not available'
            }), 500
        
        analyzed_reviews = []
        for review_text in reviews:
            analysis = sentiment_analyzer.analyze_single_review(review_text)
            analyzed_reviews.append({
                'review': review_text,
                'sentiment': analysis['sentiment'],
                'confidence': analysis['confidence'],
                'polarity': analysis['polarity'],
                'model_prediction': analysis.get('model_prediction', {})
            })
        
        # Calculate comprehensive summary using the analyzer
        full_analysis = sentiment_analyzer.analyze_product_reviews(reviews)
        summary = {
            'overall_sentiment': full_analysis['overall_sentiment'],
            'sentiment_score': full_analysis['sentiment_score'],
            'sentiment_distribution': {
                'positive': {'count': full_analysis['positive_count'], 'percentage': full_analysis['positive_percent']},
                'negative': {'count': full_analysis['negative_count'], 'percentage': full_analysis['negative_percent']},
                'neutral': {'count': full_analysis['neutral_count'], 'percentage': full_analysis['neutral_percent']}
            },
            'insights': full_analysis['insights'],
            'recommendation': sentiment_analyzer.get_sentiment_summary(full_analysis)
        }
        
        # Prepare complete result
        complete_result = {
            'product_id': product_id,
            'product_title': product_title,
            'product_url': product_url,
            'reviews': reviews,
            'analyzed_reviews': analyzed_reviews,
            'sentiment_summary': summary,
            'analysis_id': str(uuid.uuid4()),
            'scraped_at': datetime.now().isoformat(),
            'analyzed_at': datetime.now().isoformat(),
            'total_reviews': len(reviews)
        }
        
        # Save complete result
        filename = f"complete_analysis_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(complete_result, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Complete analysis finished and saved to {filepath}")
        
        return jsonify({
            'success': True,
            'analysis': complete_result,
            'file_saved': filename,
            'stats': {
                'total_reviews': len(reviews),
                'positive_percentage': summary['sentiment_distribution']['positive']['percentage'],
                'negative_percentage': summary['sentiment_distribution']['negative']['percentage'],
                'neutral_percentage': summary['sentiment_distribution']['neutral']['percentage'],
                'recommendation': summary['recommendation']
            },
            'message': f"Successfully completed analysis for {len(reviews)} reviews"
        })
        
    except Exception as e:
        logger.error(f"Error in complete_analysis: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analysis-history', methods=['GET'])
def get_analysis_history():
    """Get list of previous analyses"""
    try:
        analyses = []
        
        # Scan data directory for analysis files
        if os.path.exists(DATA_DIR):
            for filename in sorted(os.listdir(DATA_DIR), reverse=True):
                if filename.startswith(('sentiment_', 'complete_analysis_')) and filename.endswith('.json'):
                    filepath = os.path.join(DATA_DIR, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        
                        # Extract summary info
                        analyses.append({
                            'filename': filename,
                            'analysis_id': data.get('analysis_id', ''),
                            'product_title': data.get('product_title', 'Unknown Product'),
                            'product_id': data.get('product_id', ''),
                            'total_reviews': data.get('total_reviews', len(data.get('reviews', []))),
                            'analyzed_at': data.get('analyzed_at', data.get('scraped_at', '')),
                            'sentiment_summary': data.get('sentiment_summary', {}),
                            'file_size': os.path.getsize(filepath)
                        })
                    except Exception as e:
                        logger.error(f"Error reading {filename}: {e}")
                        continue
        
        return jsonify({
            'success': True,
            'history': analyses[:50],  # Return last 50 analyses
            'total_count': len(analyses)
        })
        
    except Exception as e:
        logger.error(f"Error in get_analysis_history: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analysis/<analysis_id>', methods=['GET'])
def get_analysis_detail(analysis_id):
    """Get detailed analysis by ID"""
    try:
        # Search for file containing this analysis_id
        if not os.path.exists(DATA_DIR):
            return jsonify({
                'success': False,
                'error': 'Analysis not found'
            }), 404
        
        for filename in os.listdir(DATA_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(DATA_DIR, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    if data.get('analysis_id') == analysis_id:
                        return jsonify({
                            'success': True,
                            'analysis': data
                        })
                except Exception as e:
                    continue
        
        return jsonify({
            'success': False,
            'error': 'Analysis not found'
        }), 404
        
    except Exception as e:
        logger.error(f"Error in get_analysis_detail: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Sentiment Analysis Backend Server...")
    logger.info(f"Data directory: {os.path.abspath(DATA_DIR)}")
    
    # Run in debug mode for development
    app.run(
        host='127.0.0.1',
        port=8000,
        debug=True,
        threaded=True
    )
