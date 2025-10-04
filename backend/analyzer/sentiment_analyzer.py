# backend/analyzer/sentiment_analyzer.py
import re
from typing import Dict, List, Any
from textblob import TextBlob
import numpy as np
from datetime import datetime

class SentimentAnalyzer:
    def __init__(self):
        print("✅ Sentiment analyzer initialized")
        # Define positive and negative keywords for better classification
        self.positive_keywords = [
            'good', 'nice', 'excellent', 'awesome', 'great', 'amazing', 'perfect',
            'love', 'best', 'fantastic', 'wonderful', 'outstanding', 'superb',
            'quality', 'worth', 'happy', 'satisfied', 'recommend', 'beautiful',
            'comfortable', 'soft', 'perfect', 'exactly', 'accurate', 'fast',
            'easy', 'smooth', 'brilliant', 'impressive', 'pleased', 'delighted'
        ]
        self.negative_keywords = [
            'bad', 'poor', 'worst', 'terrible', 'horrible', 'awful', 'disappointed',
            'waste', 'cheap', 'broken', 'damaged', 'defective', 'useless',
            'not good', 'not worth', 'unhappy', 'dissatisfied', 'avoid',
            'problem', 'issue', 'complaint', 'return', 'refund', 'fake',
            'shrink', 'small', 'tight', 'loose', 'fade', 'tear', 'wrong'
        ]
    
    def analyze_single_review(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment for a single review with enhanced classification"""
        try:
            # Clean the text
            clean_text = self.clean_text(text)
            
            # Use TextBlob for sentiment analysis
            blob = TextBlob(clean_text)
            polarity = blob.sentiment.polarity  # -1 to 1
            subjectivity = blob.sentiment.subjectivity  # 0 to 1
            
            # Enhanced sentiment classification with keyword analysis
            sentiment, confidence = self.enhanced_sentiment_analysis(clean_text, polarity, subjectivity)
            
            # Convert to score (0-100)
            score = self.sentiment_to_score(sentiment, polarity)
            
            return {
                "sentiment": sentiment,
                "score": score,
                "confidence": confidence,
                "polarity": polarity,
                "subjectivity": subjectivity,
                "text": text
            }
            
        except Exception as e:
            print(f"❌ Error analyzing review: {e}")
            return {
                "sentiment": "neutral",
                "score": 50,
                "confidence": 0,
                "polarity": 0,
                "subjectivity": 0,
                "text": text
            }
    
    def enhanced_sentiment_analysis(self, text: str, polarity: float, subjectivity: float) -> tuple:
        """Enhanced sentiment analysis using both ML and keyword matching"""
        text_lower = text.lower()
        
        # Count positive and negative keywords
        positive_count = sum(1 for keyword in self.positive_keywords if keyword in text_lower)
        negative_count = sum(1 for keyword in self.negative_keywords if keyword in text_lower)
        
        # Keyword-based sentiment
        if positive_count > negative_count:
            keyword_sentiment = "positive"
            keyword_confidence = min(80 + (positive_count * 5), 95)
        elif negative_count > positive_count:
            keyword_sentiment = "negative" 
            keyword_confidence = min(80 + (negative_count * 5), 95)
        else:
            keyword_sentiment = "neutral"
            keyword_confidence = 60
        
        # TextBlob-based sentiment
        if polarity > 0.1:
            blob_sentiment = "positive"
            blob_confidence = min(int(subjectivity * 100), 90)
        elif polarity < -0.1:
            blob_sentiment = "negative"
            blob_confidence = min(int(abs(polarity) * 100), 90)
        else:
            blob_sentiment = "neutral"
            blob_confidence = 70
        
        # Combine both approaches
        if keyword_sentiment == blob_sentiment:
            # Both methods agree
            final_sentiment = keyword_sentiment
            final_confidence = max(keyword_confidence, blob_confidence)
        else:
            # Methods disagree - prefer keyword analysis for clear cases
            if abs(positive_count - negative_count) >= 2:
                final_sentiment = keyword_sentiment
                final_confidence = keyword_confidence - 10
            elif abs(polarity) > 0.3:
                final_sentiment = blob_sentiment
                final_confidence = blob_confidence - 10
            else:
                final_sentiment = "neutral"
                final_confidence = 60
        
        return final_sentiment, final_confidence
    
    def sentiment_to_score(self, sentiment: str, polarity: float) -> int:
        """Convert sentiment to a 0-100 score"""
        if sentiment == "positive":
            return min(100, max(70, int(70 + (polarity * 30))))
        elif sentiment == "negative":
            return max(0, min(30, int(30 + (polarity * 20))))
        else:  # neutral
            return 50
    
    def analyze_product_reviews(self, reviews: List[Dict]) -> Dict[str, Any]:
        """Analyze all reviews for a product and generate comprehensive stats"""
        if not reviews:
            return self.get_empty_analysis()
        
        analyzed_reviews = []
        sentiment_scores = []
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        
        print(f"🔍 Analyzing {len(reviews)} reviews...")
        
        for i, review in enumerate(reviews):
            # Extract review text
            review_text = review.get('text', '')
            if not review_text or len(review_text.strip()) < 3:
                print(f"  ⏩ Skipping review {i+1}: Empty or too short")
                continue
                
            # Analyze sentiment
            analysis = self.analyze_single_review(review_text)
            analyzed_review = {
                **review,
                "sentiment_analysis": analysis
            }
            analyzed_reviews.append(analyzed_review)
            
            # Track sentiment counts
            sentiment = analysis["sentiment"]
            sentiment_counts[sentiment] += 1
            sentiment_scores.append(analysis["score"])
            
            print(f"  📝 Review {i+1}: '{review_text[:50]}...' → {sentiment} (score: {analysis['score']})")
        
        if not analyzed_reviews:
            print("❌ No valid reviews to analyze")
            return self.get_empty_analysis()
        
        # Calculate percentages
        total_reviews = len(analyzed_reviews)
        positive_percent = round((sentiment_counts["positive"] / total_reviews) * 100, 1)
        negative_percent = round((sentiment_counts["negative"] / total_reviews) * 100, 1)
        neutral_percent = round((sentiment_counts["neutral"] / total_reviews) * 100, 1)
        
        # Calculate overall sentiment score (weighted average)
        overall_sentiment_score = round(np.mean(sentiment_scores), 1) if sentiment_scores else 0
        
        # Determine overall sentiment
        if positive_percent > negative_percent and positive_percent > neutral_percent:
            overall_sentiment = "positive"
        elif negative_percent > positive_percent and negative_percent > neutral_percent:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        # Generate insights
        insights = self.generate_insights(sentiment_counts, total_reviews, overall_sentiment_score)
        
        print(f"📊 Final Analysis: {sentiment_counts} | Score: {overall_sentiment_score} | Sentiment: {overall_sentiment}")
        
        return {
            "analyzed_reviews": analyzed_reviews,
            "summary": {
                "total_reviews": total_reviews,
                "positive_reviews": sentiment_counts["positive"],
                "negative_reviews": sentiment_counts["negative"],
                "neutral_reviews": sentiment_counts["neutral"],
                "positive_percentage": positive_percent,
                "negative_percentage": negative_percent,
                "neutral_percentage": neutral_percent,
                "overall_sentiment": overall_sentiment,
                "sentiment_score": overall_sentiment_score,
                "average_confidence": round(np.mean([r["sentiment_analysis"]["confidence"] for r in analyzed_reviews]), 1)
            },
            "insights": insights,
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    def generate_insights(self, sentiment_counts: Dict, total_reviews: int, sentiment_score: float) -> List[str]:
        """Generate insights based on sentiment analysis"""
        insights = []
        
        positive = sentiment_counts["positive"]
        negative = sentiment_counts["negative"]
        neutral = sentiment_counts["neutral"]
        
        if total_reviews == 0:
            return ["No reviews available for analysis"]
        
        # Sentiment distribution insights
        if positive > negative and positive > neutral:
            insights.append(f"Strong positive sentiment ({positive}/{total_reviews} reviews)")
            if sentiment_score > 70:
                insights.append("High customer satisfaction levels")
        elif negative > positive and negative > neutral:
            insights.append(f"Significant negative feedback ({negative}/{total_reviews} reviews)")
            if sentiment_score < 30:
                insights.append("Urgent attention needed for product issues")
        else:
            insights.append("Mixed customer opinions")
            if neutral > positive and neutral > negative:
                insights.append("Customers have moderate opinions about the product")
        
        # Volume insights
        if total_reviews < 5:
            insights.append("Limited review data available - consider collecting more reviews")
        elif total_reviews > 20:
            insights.append("Substantial review data for reliable analysis")
        
        # Score-based insights
        if sentiment_score > 80:
            insights.append("Excellent sentiment score indicating high product quality")
        elif sentiment_score > 60:
            insights.append("Good sentiment score with room for improvement")
        elif sentiment_score < 40:
            insights.append("Low sentiment score - consider product improvements")
        elif sentiment_score < 20:
            insights.append("Very low sentiment score - immediate action recommended")
        
        return insights
    
    def clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        if not text:
            return ""
        
        # Remove extra whitespace and special characters but keep meaningful text
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Handle common Indian English phrases and emojis
        replacements = {
            'accha': 'good', 'achcha': 'good', 'acche': 'good',
            'bahut': 'very', 'bohot': 'very',
            'mast': 'excellent', 'best': 'excellent',
            'kharab': 'bad', 'bekar': 'bad',
            '👍': ' good', '👌': ' excellent', '❤️': ' love',
            '👎': ' bad', '😞': ' disappointed', '😠': ' angry'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def get_empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            "analyzed_reviews": [],
            "summary": {
                "total_reviews": 0,
                "positive_reviews": 0,
                "negative_reviews": 0,
                "neutral_reviews": 0,
                "positive_percentage": 0,
                "negative_percentage": 0,
                "neutral_percentage": 0,
                "overall_sentiment": "neutral",
                "sentiment_score": 0,
                "average_confidence": 0
            },
            "insights": ["No reviews available for analysis"],
            "analysis_timestamp": datetime.now().isoformat()
        }