# backend/test_fixed_analyzer.py
from analyzer.sentiment_analyzer import SentimentAnalyzer

def test_with_sample_reviews():
    analyzer = SentimentAnalyzer()
    
    # Sample reviews similar to what you scraped
    sample_reviews = [
        {"text": "Very very very nice! Thank you for great quality and great price 👌👌👍", "rating": "5/5", "reviewer": "Sandhya", "date": "Sep 13, 2025"},
        {"text": "As per price it's good 👍", "rating": "4/5", "reviewer": "Anonymous", "date": "Unknown date"},
        {"text": "Accha hai mast fabric! Fabric bhi bahut accha hai 👍👍👍👍👌👌👌👌", "rating": "5/5", "reviewer": "Hema", "date": "Jul 08, 2025"},
        {"text": "Not good quality, disappointed with the product", "rating": "2/5", "reviewer": "Anonymous", "date": "Unknown date"},
        {"text": "Average product, okay for the price but not great", "rating": "3/5", "reviewer": "Anonymous", "date": "Unknown date"}
    ]
    
    result = analyzer.analyze_product_reviews(sample_reviews)
    summary = result["summary"]
    
    print("📊 ANALYSIS RESULTS:")
    print(f"Total Reviews: {summary['total_reviews']}")
    print(f"Sentiment Score: {summary['sentiment_score']}%")
    print(f"Positive Reviews: {summary['positive_percentage']}%")
    print(f"Negative Reviews: {summary['negative_percentage']}%")
    print(f"Neutral Reviews: {summary['neutral_percentage']}%")
    print(f"Overall Sentiment: {summary['overall_sentiment']}")
    print("\n📈 Insights:")
    for insight in result["insights"]:
        print(f"• {insight}")

if __name__ == "__main__":
    test_with_sample_reviews()