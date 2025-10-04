# backend/routes/analysis.py
from flask import Blueprint, request, jsonify
from analyzer.sentiment_analyzer import SentimentAnalyzer

analysis_bp = Blueprint('analysis', __name__)
analyzer = SentimentAnalyzer()

@analysis_bp.route('/analyze-product', methods=['POST'])
def analyze_product():
    try:
        data = request.get_json()
        
        if not data or 'reviews' not in data:
            return jsonify({"error": "No reviews data provided"}), 400
        
        reviews = data['reviews']
        product_info = data.get('productInfo', {})
        
        print(f"📊 Analyzing {len(reviews)} reviews for product: {product_info.get('title', 'Unknown')}")
        
        # Perform sentiment analysis
        analysis_result = analyzer.analyze_product_reviews(reviews)
        
        # Prepare response with all required data
        response = {
            "success": True,
            "analysis_data": {
                "reviews": reviews,
                "sentiment_analysis": analysis_result,
                "product_info": product_info,
                "analysis_timestamp": analysis_result.get("analysis_timestamp")
            },
            "analysis_stats": analysis_result["summary"],
            "product_info": product_info
        }
        
        print(f"✅ Analysis completed: {analysis_result['summary']}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return jsonify({"error": str(e)}), 500