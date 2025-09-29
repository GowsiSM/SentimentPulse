#!/usr/bin/env python3
"""
Test script for the DistilBERT sentiment analyzer
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(__file__))

from analyzer.sentiment_analyzer import SentimentAnalyzer

def test_sentiment_analyzer():
    """Test the sentiment analyzer with sample reviews"""
    try:
        print("🔧 Initializing sentiment analyzer...")
        analyzer = SentimentAnalyzer()
        print("✅ Sentiment analyzer initialized successfully!")
        
        # Test reviews
        test_reviews = [
            "This product is absolutely amazing! Best purchase ever.",
            "Terrible quality, completely disappointed with this product.",
            "It's okay, nothing special but works as expected.",
            "Love this! Excellent quality and fast delivery.",
            "Very bad experience, waste of money."
        ]
        
        print("\n🧪 Testing individual reviews:")
        print("-" * 60)
        
        for i, review in enumerate(test_reviews, 1):
            result = analyzer.analyze_single_review(review)
            print(f"\nReview {i}: {review[:50]}...")
            print(f"Sentiment: {result['sentiment']}")
            print(f"Confidence: {result['confidence']}%")
            print(f"Polarity: {result['polarity']}")
            if 'model_prediction' in result:
                print(f"Model probabilities: {result['model_prediction']}")
        
        print("\n🧪 Testing batch analysis:")
        print("-" * 60)
        
        batch_result = analyzer.analyze_product_reviews(test_reviews)
        print(f"Overall sentiment: {batch_result['overall_sentiment']}")
        print(f"Sentiment score: {batch_result['sentiment_score']}")
        print(f"Positive: {batch_result['positive_percent']}%")
        print(f"Negative: {batch_result['negative_percent']}%")
        print(f"Neutral: {batch_result['neutral_percent']}%")
        print(f"Total reviews: {batch_result['total_reviews_analyzed']}")
        
        summary = analyzer.get_sentiment_summary(batch_result)
        print(f"\nSummary: {summary}")
        
        print("\n✅ All tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing sentiment analyzer: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_sentiment_analyzer()
    sys.exit(0 if success else 1)