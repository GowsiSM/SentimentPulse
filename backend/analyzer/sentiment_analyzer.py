# snapdeal_sentiment_analyzer/src/backend/analyzer/sentiment_analyzer.py
import re
import logging
from textblob import TextBlob
from collections import Counter
import statistics

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
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
        """Analyze sentiment for a single review"""
        try:
            # Clean the text
            cleaned_text = self._clean_text(text)
            
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
            
        except Exception as e:
            logger.error(f"Error analyzing single review: {str(e)}")
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