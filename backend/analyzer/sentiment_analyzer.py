# snapdeal_sentiment_analyzer/src/backend/analyzer/sentiment_analyzer.py
import re
import logging
import os
import numpy as np
from collections import Counter
import statistics
import torch
from transformers import (
    DistilBertTokenizer, 
    DistilBertForSequenceClassification,
    AutoTokenizer,
    AutoModelForSequenceClassification
)
from torch.nn.functional import softmax

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self, model_path=None):
        """
        Initialize the sentiment analyzer with trained DistilBERT model
        """
        # Set model path
        if model_path is None:
            # Default to the sentiment_model directory at project root
            current_dir = os.path.dirname(__file__)  # analyzer folder
            backend_dir = os.path.dirname(current_dir)  # backend folder
            project_root = os.path.dirname(backend_dir)  # project root
            self.model_path = os.path.join(project_root, 'sentiment_model')
        else:
            self.model_path = model_path
        
        # Initialize model and tokenizer
        self.model = None
        self.tokenizer = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load the trained model
        self._load_model()
        
        # Define sentiment labels (adjust based on your training)
        self.sentiment_labels = ['negative', 'neutral', 'positive']
        
        # Define positive and negative keyword lists for enhanced analysis
        self.positive_keywords = {
            'excellent', 'amazing', 'awesome', 'fantastic', 'great', 'good', 'nice',
            'perfect', 'wonderful', 'outstanding', 'superb', 'brilliant', 'love',
            'recommend', 'satisfied', 'happy', 'impressed', 'quality', 'best',
            'worth', 'value', 'fast', 'quick', 'smooth', 'easy', 'comfortable',
            'durable', 'reliable', 'useful', 'helpful', 'beautiful', 'elegant'
        }
        
        self.negative_keywords = {
            'terrible', 'awful', 'horrible', 'bad', 'poor', 'worst', 'hate',
            'disappointed', 'unsatisfied', 'unhappy', 'waste', 'useless', 'cheap',
            'broken', 'damaged', 'defective', 'problem', 'issue', 'slow', 'delay',
            'difficult', 'hard', 'complicated', 'expensive', 'overpriced', 'fake',
            'fraud', 'scam', 'regret', 'return', 'refund', 'complaint'
        }
    
    def _load_model(self):
        """Load the trained DistilBERT model and tokenizer"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model directory not found: {self.model_path}")
            
            logger.info(f"Loading model from: {self.model_path}")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            # Load model
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_path,
                num_labels=3  # Assuming 3 classes: negative, neutral, positive
            )
            
            # Move model to device
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            logger.warning("Falling back to TextBlob-based analysis")
            self.model = None
            self.tokenizer = None
    
    def analyze_product_reviews(self, reviews):
        """Analyze sentiment for a list of reviews"""
        try:
            if not reviews:
                return self._get_default_analysis()
            
            analyzed_reviews = []
            sentiments = []
            polarities = []
            
            for review in reviews:
                review_text = review.get('text', '') if isinstance(review, dict) else str(review)
                
                if review_text:
                    analysis = self.analyze_single_review(review_text)
                    
                    analyzed_review = {
                        'text': review_text[:200] + '...' if len(review_text) > 200 else review_text,
                        'sentiment': analysis['sentiment'],
                        'polarity': analysis['polarity'],
                        'confidence': analysis['confidence']
                    }
                    
                    # Add additional review info if available
                    if isinstance(review, dict):
                        analyzed_review.update({
                            'rating': review.get('rating'),
                            'reviewer': review.get('reviewer'),
                            'date': review.get('date')
                        })
                    
                    analyzed_reviews.append(analyzed_review)
                    sentiments.append(analysis['sentiment'])
                    polarities.append(analysis['polarity'])
            
            # Calculate overall sentiment
            return self._calculate_overall_sentiment(sentiments, polarities, analyzed_reviews)
            
        except Exception as e:
            logger.error(f"Error analyzing reviews: {str(e)}")
            return self._get_default_analysis()
    
    def analyze_single_review(self, text):
        """Analyze sentiment for a single review using DistilBERT model"""
        try:
            # Clean the text
            cleaned_text = self._clean_text(text)
            
            if self.model is not None and self.tokenizer is not None:
                # Use trained DistilBERT model
                return self._analyze_with_distilbert(cleaned_text)
            else:
                # Fallback to TextBlob analysis
                return self._analyze_with_textblob(cleaned_text)
                
        except Exception as e:
            logger.error(f"Error analyzing single review: {str(e)}")
            return {
                'sentiment': 'neutral',
                'polarity': 0.0,
                'confidence': 50.0
            }
    
    def _analyze_with_distilbert(self, text):
        """Analyze sentiment using the trained DistilBERT model"""
        try:
            # Tokenize the text
            inputs = self.tokenizer(
                text,
                return_tensors='pt',
                truncation=True,
                padding=True,
                max_length=512
            )
            
            # Move inputs to device
            inputs = {key: val.to(self.device) for key, val in inputs.items()}
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                
                # Apply softmax to get probabilities
                probabilities = softmax(logits, dim=-1)
                
                # Get predicted class and confidence
                predicted_class_id = torch.argmax(probabilities, dim=-1).item()
                confidence = torch.max(probabilities, dim=-1)[0].item()
                
                # Map to sentiment labels
                sentiment = self.sentiment_labels[predicted_class_id]
                
                # Convert to polarity score (-1 to 1)
                if sentiment == 'positive':
                    polarity = 0.5 + (confidence - 0.33) * 0.5 / 0.67  # Scale to 0.5-1.0
                elif sentiment == 'negative':
                    polarity = -0.5 - (confidence - 0.33) * 0.5 / 0.67  # Scale to -1.0 to -0.5
                else:  # neutral
                    polarity = (confidence - 0.33) * 0.5 / 0.67 * (0.5 if predicted_class_id > 1 else -0.5)
                
                # Enhance with keyword analysis
                keyword_score = self._calculate_keyword_score(text)
                combined_polarity = (polarity + keyword_score * 0.3) / 1.3  # Weight model more heavily
                
                return {
                    'sentiment': sentiment,
                    'polarity': round(combined_polarity, 3),
                    'confidence': round(confidence * 100, 1),
                    'model_prediction': {
                        'probabilities': {
                            'negative': round(probabilities[0][0].item(), 3),
                            'neutral': round(probabilities[0][1].item(), 3),
                            'positive': round(probabilities[0][2].item(), 3)
                        }
                    }
                }
                
        except Exception as e:
            logger.error(f"Error in DistilBERT analysis: {str(e)}")
            # Fallback to TextBlob
            return self._analyze_with_textblob(text)
    
    def _analyze_with_textblob(self, cleaned_text):
        """Fallback analysis using TextBlob (requires TextBlob import)"""
        try:
            # Import TextBlob only when needed as fallback
            from textblob import TextBlob
            
            # TextBlob analysis
            blob = TextBlob(cleaned_text)
            polarity = blob.sentiment.polarity
            
            # Keyword-based enhancement
            keyword_score = self._calculate_keyword_score(cleaned_text)
            
            # Combine TextBlob and keyword scores
            combined_polarity = (polarity + keyword_score) / 2
            
            # Determine sentiment
            if combined_polarity > 0.1:
                sentiment = 'positive'
            elif combined_polarity < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            # Calculate confidence based on absolute polarity
            confidence = min(abs(combined_polarity) * 100, 95)
            
            return {
                'sentiment': sentiment,
                'polarity': combined_polarity,
                'confidence': round(confidence, 1)
            }
            
        except ImportError:
            logger.error("TextBlob not available for fallback analysis")
            return {
                'sentiment': 'neutral',
                'polarity': 0.0,
                'confidence': 50.0
            }
    
    def _clean_text(self, text):
        """Clean and preprocess text for analysis"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _calculate_keyword_score(self, text):
        """Calculate sentiment score based on keywords"""
        words = text.split()
        
        positive_count = sum(1 for word in words if word in self.positive_keywords)
        negative_count = sum(1 for word in words if word in self.negative_keywords)
        
        if positive_count + negative_count == 0:
            return 0.0
        
        # Normalize score between -1 and 1
        total_sentiment_words = positive_count + negative_count
        score = (positive_count - negative_count) / total_sentiment_words
        
        return score
    
    def _calculate_overall_sentiment(self, sentiments, polarities, analyzed_reviews):
        """Calculate overall sentiment statistics"""
        if not sentiments:
            return self._get_default_analysis()
        
        # Count sentiments
        sentiment_counts = Counter(sentiments)
        total_reviews = len(sentiments)
        
        positive_count = sentiment_counts.get('positive', 0)
        negative_count = sentiment_counts.get('negative', 0)
        neutral_count = sentiment_counts.get('neutral', 0)
        
        # Calculate percentages
        positive_percent = round((positive_count / total_reviews) * 100, 1)
        negative_percent = round((negative_count / total_reviews) * 100, 1)
        neutral_percent = round((neutral_count / total_reviews) * 100, 1)
        
        # Determine overall sentiment
        if positive_count > negative_count and positive_percent > 40:
            overall_sentiment = 'positive'
        elif negative_count > positive_count and negative_percent > 30:
            overall_sentiment = 'negative'
        else:
            overall_sentiment = 'mixed'
        
        # Calculate overall polarity score (0-100)
        if polarities:
            avg_polarity = statistics.mean(polarities)
            sentiment_score = round(((avg_polarity + 1) / 2) * 100, 1)
        else:
            sentiment_score = 50.0
        
        # Extract key insights
        insights = self._extract_insights(analyzed_reviews)
        
        return {
            'overall_sentiment': overall_sentiment,
            'sentiment_score': sentiment_score,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'positive_percent': positive_percent,
            'negative_percent': negative_percent,
            'neutral_percent': neutral_percent,
            'total_reviews_analyzed': total_reviews,
            'insights': insights,
            'sample_reviews': {
                'positive': self._get_sample_reviews(analyzed_reviews, 'positive', 3),
                'negative': self._get_sample_reviews(analyzed_reviews, 'negative', 3),
                'neutral': self._get_sample_reviews(analyzed_reviews, 'neutral', 2)
            }
        }
    
    def _extract_insights(self, analyzed_reviews):
        """Extract key insights from reviews"""
        insights = {
            'common_positive_themes': [],
            'common_negative_themes': [],
            'confidence_metrics': {}
        }
        
        try:
            positive_reviews = [r for r in analyzed_reviews if r['sentiment'] == 'positive']
            negative_reviews = [r for r in analyzed_reviews if r['sentiment'] == 'negative']
            
            # Extract common themes from positive reviews
            if positive_reviews:
                positive_text = ' '.join([r['text'] for r in positive_reviews])
                insights['common_positive_themes'] = self._extract_themes(positive_text, self.positive_keywords)
            
            # Extract common themes from negative reviews
            if negative_reviews:
                negative_text = ' '.join([r['text'] for r in negative_reviews])
                insights['common_negative_themes'] = self._extract_themes(negative_text, self.negative_keywords)
            
            # Calculate confidence metrics
            confidences = [r['confidence'] for r in analyzed_reviews if r['confidence']]
            if confidences:
                insights['confidence_metrics'] = {
                    'average_confidence': round(statistics.mean(confidences), 1),
                    'high_confidence_reviews': len([c for c in confidences if c > 80])
                }
        
        except Exception as e:
            logger.error(f"Error extracting insights: {str(e)}")
        
        return insights
    
    def _extract_themes(self, text, keywords):
        """Extract common themes from text"""
        words = text.lower().split()
        theme_counts = Counter()
        
        for word in words:
            if word in keywords:
                theme_counts[word] += 1
        
        # Return top 5 themes
        return [{'theme': theme, 'count': count} for theme, count in theme_counts.most_common(5)]
    
    def _get_sample_reviews(self, analyzed_reviews, sentiment, limit):
        """Get sample reviews for a specific sentiment"""
        matching_reviews = [r for r in analyzed_reviews if r['sentiment'] == sentiment]
        return matching_reviews[:limit]
    
    def _get_default_analysis(self):
        """Return default analysis when no reviews available"""
        return {
            'overall_sentiment': 'neutral',
            'sentiment_score': 50.0,
            'positive_count': 0,
            'negative_count': 0,
            'neutral_count': 0,
            'positive_percent': 0.0,
            'negative_percent': 0.0,
            'neutral_percent': 0.0,
            'total_reviews_analyzed': 0,
            'insights': {
                'common_positive_themes': [],
                'common_negative_themes': [],
                'confidence_metrics': {}
            },
            'sample_reviews': {
                'positive': [],
                'negative': [],
                'neutral': []
            }
        }
    
    def get_sentiment_summary(self, analysis_result):
        """Generate a human-readable sentiment summary"""
        if not analysis_result:
            return "No analysis available"
        
        total_reviews = analysis_result.get('total_reviews_analyzed', 0)
        overall_sentiment = analysis_result.get('overall_sentiment', 'neutral')
        sentiment_score = analysis_result.get('sentiment_score', 50)
        
        if total_reviews == 0:
            return "No reviews available for analysis"
        
        summary_parts = []
        
        # Overall sentiment
        if overall_sentiment == 'positive':
            summary_parts.append(f"Overall positive sentiment with {sentiment_score}% satisfaction")
        elif overall_sentiment == 'negative':
            summary_parts.append(f"Overall negative sentiment with {sentiment_score}% satisfaction")
        else:
            summary_parts.append(f"Mixed sentiment with {sentiment_score}% satisfaction")
        
        # Review breakdown
        pos_percent = analysis_result.get('positive_percent', 0)
        neg_percent = analysis_result.get('negative_percent', 0)
        
        summary_parts.append(f"Based on {total_reviews} reviews: {pos_percent}% positive, {neg_percent}% negative")
        
        return ". ".join(summary_parts) + "."