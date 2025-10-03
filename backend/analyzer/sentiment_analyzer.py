# backend/analyzer/sentiment_analyzer.py
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self, model_path: str = None):
        """
        Initialize the sentiment analyzer with your trained model
        """
        try:
            # Resolve the absolute path - fix the path issue
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Try different possible paths for the model
            possible_paths = [
                os.path.join(current_dir, "../sentiment_model"),  # From analyzer directory
                os.path.join(current_dir, "../../sentiment_model"),  # From backend directory
                "./sentiment_model",  # Relative to backend
                "../sentiment_model"  # Relative to backend
            ]
            
            # Use provided path or find the correct one
            if model_path:
                model_full_path = model_path
            else:
                model_full_path = None
                for path in possible_paths:
                    if os.path.exists(path) and os.path.isdir(path):
                        model_full_path = path
                        break
            
            if not model_full_path or not os.path.exists(model_full_path):
                available_paths = "\n".join([f"  - {p} (exists: {os.path.exists(p)})" for p in possible_paths])
                raise FileNotFoundError(
                    f"Model path not found: {model_full_path}\n"
                    f"Tried paths:\n{available_paths}\n"
                    f"Current directory: {current_dir}"
                )
            
            logger.info(f"Loading sentiment model from: {model_full_path}")
            
            # Check if model files exist
            required_files = ['config.json', 'model.safetensors', 'tokenizer.json']
            missing_files = []
            for file in required_files:
                if not os.path.exists(os.path.join(model_full_path, file)):
                    missing_files.append(file)
            
            if missing_files:
                raise FileNotFoundError(
                    f"Missing model files: {missing_files}\n"
                    f"Available files: {os.listdir(model_full_path)}"
                )
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(model_full_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_full_path)
            
            # Set device
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
            self.model.eval()
            
            # Define sentiment labels (adjust based on your model's training)
            self.id2label = {
                0: "negative",
                1: "neutral", 
                2: "positive"
            }
            
            logger.info("✅ Sentiment model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load sentiment model: {e}")
            raise

    def analyze_single_review(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment for a single review
        
        Args:
            text: Review text to analyze
            
        Returns:
            Dictionary with sentiment analysis results
        """
        try:
            if not text or not isinstance(text, str):
                return {
                    "sentiment": "neutral",
                    "confidence": 0.0,
                    "polarity": 0.0,
                    "error": "Invalid input text"
                }
            
            # Tokenize input
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                padding=True, 
                max_length=512
            ).to(self.device)
            
            # Get model predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                confidence, predicted_class = torch.max(predictions, dim=1)
            
            # Convert to Python values
            confidence = confidence.cpu().numpy()[0]
            predicted_class = predicted_class.cpu().numpy()[0]
            
            # Get sentiment label
            sentiment = self.id2label.get(predicted_class, "neutral")
            
            # Calculate polarity score (-1 to 1 scale)
            if sentiment == "positive":
                polarity = confidence
            elif sentiment == "negative":
                polarity = -confidence
            else:  # neutral
                polarity = 0.0
            
            return {
                "sentiment": sentiment,
                "confidence": round(float(confidence) * 100, 2),
                "polarity": round(float(polarity), 3),
                "model_prediction": {
                    "predicted_class": int(predicted_class),
                    "probabilities": {
                        label: round(float(prob), 4) 
                        for label, prob in zip(self.id2label.values(), predictions.cpu().numpy()[0])
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing review: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "polarity": 0.0,
                "error": str(e)
            }

    def analyze_batch_reviews(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Analyze sentiment for multiple reviews in batch
        
        Args:
            texts: List of review texts to analyze
            
        Returns:
            List of analysis results
        """
        if not texts:
            return []
        
        results = []
        for text in texts:
            results.append(self.analyze_single_review(text))
        
        return results

    def analyze_product_reviews(self, reviews: List[str]) -> Dict[str, Any]:
        """
        Analyze all reviews for a product and generate summary statistics
        
        Args:
            reviews: List of product reviews
            
        Returns:
            Comprehensive analysis summary
        """
        if not reviews:
            return self._get_empty_analysis()
        
        # Analyze all reviews
        analyzed_reviews = self.analyze_batch_reviews(reviews)
        
        # Calculate statistics
        sentiments = [result["sentiment"] for result in analyzed_reviews]
        confidences = [result["confidence"] for result in analyzed_reviews]
        polarities = [result["polarity"] for result in analyzed_reviews]
        
        total_reviews = len(reviews)
        positive_count = sentiments.count("positive")
        negative_count = sentiments.count("negative") 
        neutral_count = sentiments.count("neutral")
        
        # Calculate percentages
        positive_percent = round((positive_count / total_reviews) * 100, 2) if total_reviews > 0 else 0
        negative_percent = round((negative_count / total_reviews) * 100, 2) if total_reviews > 0 else 0
        neutral_percent = round((neutral_count / total_reviews) * 100, 2) if total_reviews > 0 else 0
        
        # Determine overall sentiment
        if positive_percent > negative_percent and positive_percent > neutral_percent:
            overall_sentiment = "positive"
        elif negative_percent > positive_percent and negative_percent > neutral_percent:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        # Calculate average confidence and polarity
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0
        avg_polarity = round(sum(polarities) / len(polarities), 3) if polarities else 0
        
        # Generate insights
        insights = self._generate_insights(analyzed_reviews, overall_sentiment)
        
        return {
            "overall_sentiment": overall_sentiment,
            "sentiment_score": avg_polarity,
            "total_reviews": total_reviews,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "positive_percent": positive_percent,
            "negative_percent": negative_percent,
            "neutral_percent": neutral_percent,
            "average_confidence": avg_confidence,
            "average_polarity": avg_polarity,
            "sentiment_distribution": {
                "positive": positive_percent,
                "negative": negative_percent,
                "neutral": neutral_percent
            },
            "insights": insights,
            "analyzed_reviews": analyzed_reviews
        }

    def _generate_insights(self, analyzed_reviews: List[Dict], overall_sentiment: str) -> List[str]:
        """Generate insights based on analysis results"""
        insights = []
        
        positive_reviews = [r for r in analyzed_reviews if r["sentiment"] == "positive"]
        negative_reviews = [r for r in analyzed_reviews if r["sentiment"] == "negative"]
        
        if overall_sentiment == "positive":
            if positive_reviews:
                avg_confidence = sum(r["confidence"] for r in positive_reviews) / len(positive_reviews)
                insights.append(f"Strong positive sentiment with {avg_confidence:.1f}% average confidence")
                insights.append(f"{len(positive_reviews)} out of {len(analyzed_reviews)} reviews are positive")
                
        elif overall_sentiment == "negative":
            if negative_reviews:
                avg_confidence = sum(r["confidence"] for r in negative_reviews) / len(negative_reviews)
                insights.append(f"Strong negative sentiment with {avg_confidence:.1f}% average confidence")
                insights.append(f"{len(negative_reviews)} out of {len(analyzed_reviews)} reviews express concerns")
        else:
            insights.append("Mixed customer opinions with no clear sentiment direction")
            insights.append("Consider analyzing specific aspects for improvement")
        
        # Add confidence-based insight
        high_confidence_reviews = [r for r in analyzed_reviews if r["confidence"] > 80]
        if high_confidence_reviews:
            insights.append(f"{len(high_confidence_reviews)} reviews have high confidence (>80%) predictions")
        
        return insights

    def _get_empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            "overall_sentiment": "neutral",
            "sentiment_score": 0.0,
            "total_reviews": 0,
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0,
            "positive_percent": 0.0,
            "negative_percent": 0.0,
            "neutral_percent": 100.0,
            "average_confidence": 0.0,
            "average_polarity": 0.0,
            "sentiment_distribution": {
                "positive": 0.0,
                "negative": 0.0,
                "neutral": 100.0
            },
            "insights": ["No reviews available for analysis"],
            "analyzed_reviews": []
        }

    def get_sentiment_summary(self, analysis: Dict[str, Any]) -> str:
        """Generate a human-readable summary of the analysis"""
        overall = analysis["overall_sentiment"]
        score = analysis["sentiment_score"]
        
        if overall == "positive" and score > 0.7:
            return "Highly positive customer feedback"
        elif overall == "positive":
            return "Generally positive customer feedback"
        elif overall == "negative" and score < -0.7:
            return "Strongly negative customer feedback"
        elif overall == "negative":
            return "Generally negative customer feedback"
        else:
            return "Mixed customer feedback with neutral overall sentiment"

# Global instance
sentiment_analyzer = None

def initialize_sentiment_analyzer():
    """Initialize the global sentiment analyzer instance"""
    global sentiment_analyzer
    try:
        sentiment_analyzer = SentimentAnalyzer()
        return True
    except Exception as e:
        logger.error(f"Failed to initialize sentiment analyzer: {e}")
        return False