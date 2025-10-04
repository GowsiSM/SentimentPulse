// src/services/sentimentService.js
import ApiService from './api';

class SentimentService {
  /**
   * Complete workflow: scrape reviews and analyze sentiment
   */
  async completeAnalysis(product, maxReviews = 50) {
    try {
      console.log('🔄 Starting complete analysis for:', product.title);
      
      // Step 1: Scrape reviews first
      const scrapeResult = await this.scrapeReviews(
        product.id,
        product.title,
        product.link,
        maxReviews
      );

      if (!scrapeResult.success) {
        return {
          success: false,
          error: scrapeResult.error || 'Failed to scrape reviews'
        };
      }

      // Step 2: Analyze sentiment if we have reviews
      if (scrapeResult.reviews && scrapeResult.reviews.length > 0) {
        const analyzeResult = await this.analyzeProductSentiment(
          product.id,
          product.title,
          product.link,
          scrapeResult.reviews
        );

        if (analyzeResult.success) {
          return {
            success: true,
            product: {
              ...product,
              reviews: scrapeResult.reviews,
              sentiment_analysis: analyzeResult.analysis,
              analysis_timestamp: new Date().toISOString()
            },
            stats: this._extractStatsFromAnalysis(analyzeResult.analysis),
            message: 'Complete analysis finished successfully'
          };
        } else {
          return {
            success: false,
            error: analyzeResult.error || 'Sentiment analysis failed'
          };
        }
      } else {
        return {
          success: false,
          error: 'No reviews found to analyze'
        };
      }
    } catch (error) {
      console.error('Error in complete analysis:', error);
      return {
        success: false,
        error: error.message || 'Network error during complete analysis'
      };
    }
  }

  /**
 * Analyze product reviews using the trained model
 */
async analyzeProductSentiment(productId, productTitle, productUrl, reviews) {
  try {
    console.log('📊 Analyzing sentiment for:', productTitle);
    console.log('📝 Reviews to analyze:', reviews);
    
    // Extract just the review texts for sentiment analysis
    const reviewTexts = reviews.map(review => {
      if (typeof review === 'string') {
        return review;
      }
      return review.text || review.review || '';
    }).filter(text => text && text.trim().length > 0);
    
    console.log('📋 Review texts extracted:', reviewTexts.length);
    
    if (reviewTexts.length === 0) {
      return {
        success: false,
        error: 'No valid review texts found for analysis'
      };
    }
    
    // Send the reviews array directly to the API
    const response = await ApiService.request('/analyze-sentiment', {
      method: 'POST',
      body: JSON.stringify({
        reviews: reviewTexts
      })
    });

    if (response.success) {
      return {
        success: true,
        analysis: response.analysis || response,
        message: response.message || 'Sentiment analysis completed successfully'
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to analyze sentiment'
      };
    }
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return {
      success: false,
      error: error.message || 'Network error during sentiment analysis'
    };
  }
}

  /**
   * Scrape reviews for a product
   */
  async scrapeReviews(productId, productTitle, productUrl, maxReviews = 50) {
    try {
      console.log('📥 Scraping reviews for:', productTitle);
      
      const response = await ApiService.scrapeReviews(
        [productId],
        [{
          id: productId,
          title: productTitle,
          link: productUrl
        }]
      );

      if (response.success) {
        // Find the specific product result
        const productResult = response.results?.find(r => r.id === productId);
        
        return {
          success: true,
          reviews: productResult?.reviews || [],
          total_reviews: productResult?.reviews?.length || 0,
          message: response.message || 'Reviews scraped successfully'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to scrape reviews'
        };
      }
    } catch (error) {
      console.error('Error scraping reviews:', error);
      return {
        success: false,
        error: error.message || 'Network error during review scraping'
      };
    }
  }

  /**
   * Analyze sentiment for a single product (simplified version)
   */
  async analyzeSentiment(product) {
    try {
      if (!product.reviews || product.reviews.length === 0) {
        return {
          success: false,
          error: 'No reviews available for analysis'
        };
      }

      const response = await ApiService.analyzeSentiment(
        [product.id],
        [product]
      );

      if (response.success) {
        return {
          success: true,
          analysis: response.results || response,
          message: response.message || 'Sentiment analysis completed'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Analysis failed'
        };
      }
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      return {
        success: false,
        error: error.message || 'Network error during analysis'
      };
    }
  }

  /**
   * Save analysis to localStorage for offline access
   */
  saveToLocalStorage(result) {
    try {
      const key = `sentiment_analysis_${result.product?.id || Date.now()}`;
      localStorage.setItem(key, JSON.stringify(result));
      console.log('💾 Saved analysis to localStorage:', key);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load analysis from localStorage
   */
  loadFromLocalStorage(productId) {
    try {
      const key = `sentiment_analysis_${productId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Get analysis history from localStorage
   */
  getAnalysisHistory() {
    try {
      const history = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sentiment_analysis_')) {
          const item = localStorage.getItem(key);
          if (item) {
            history.push(JSON.parse(item));
          }
        }
      }
      return {
        success: true,
        history: history,
        totalCount: history.length
      };
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return {
        success: false,
        error: error.message,
        history: [],
        totalCount: 0
      };
    }
  }

  /**
   * Extract statistics from analysis data
   */
  _extractStatsFromAnalysis(analysis) {
    if (!analysis) {
      return {
        total_reviews: 0,
        positive_percentage: 0,
        negative_percentage: 0,
        neutral_percentage: 0,
        overall_sentiment: 'neutral',
        sentiment_score: 0
      };
    }

    // Handle different response formats
    const summary = analysis.sentiment_summary || analysis;
    const results = analysis.results || [analysis];
    
    let totalReviews = summary.total_reviews || 0;
    let positive = summary.positive_percent || summary.sentiment_distribution?.positive || 0;
    let negative = summary.negative_percent || summary.sentiment_distribution?.negative || 0;
    let neutral = summary.neutral_percent || summary.sentiment_distribution?.neutral || 0;

    // If we have individual results, calculate from them
    if (results.length > 0 && results[0].reviews) {
      const reviews = results[0].reviews;
      totalReviews = reviews.length;
      
      const sentiments = reviews.map(review => 
        review.sentiment?.sentiment || review.sentiment || 'neutral'
      );
      
      positive = (sentiments.filter(s => s === 'positive').length / totalReviews) * 100;
      negative = (sentiments.filter(s => s === 'negative').length / totalReviews) * 100;
      neutral = (sentiments.filter(s => s === 'neutral').length / totalReviews) * 100;
    }

    return {
      total_reviews: totalReviews,
      positive_percentage: Math.round(positive),
      negative_percentage: Math.round(negative),
      neutral_percentage: Math.round(neutral),
      overall_sentiment: summary.overall_sentiment || 'neutral',
      sentiment_score: summary.sentiment_score || 0
    };
  }

  /**
   * Format sentiment data for charts
   */
  formatSentimentDataForCharts(analysis) {
    const stats = this._extractStatsFromAnalysis(analysis);
    
    return {
      distribution: {
        labels: ['Positive', 'Negative', 'Neutral'],
        data: [
          stats.positive_percentage,
          stats.negative_percentage,
          stats.neutral_percentage
        ],
        colors: ['#10b981', '#ef4444', '#6b7280']
      },
      overall: {
        sentiment: stats.overall_sentiment,
        score: stats.sentiment_score || 0,
        totalReviews: stats.total_reviews
      },
      insights: analysis.insights || analysis.sentiment_summary?.insights || []
    };
  }

  /**
   * Get sentiment color and icon
   */
  getSentimentStyle(sentiment) {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: 'ThumbsUp',
          label: 'Positive'
        };
      case 'negative':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: 'ThumbsDown',
          label: 'Negative'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: 'Minus',
          label: 'Neutral'
        };
    }
  }

  /**
   * Calculate sentiment statistics from analyzed reviews
   */
  calculateSentimentStats(analyzedReviews) {
    if (!analyzedReviews || !Array.isArray(analyzedReviews)) {
      return { positive: 0, negative: 0, neutral: 0, total: 0 };
    }

    const sentiments = analyzedReviews.map(review => {
      if (typeof review.sentiment === 'string') {
        return review.sentiment;
      }
      return review.sentiment?.sentiment || 'neutral';
    });

    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;
    const neutral = sentiments.filter(s => s === 'neutral').length;
    const total = sentiments.length;

    return {
      positive,
      negative,
      neutral,
      total,
      positive_percentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      negative_percentage: total > 0 ? Math.round((negative / total) * 100) : 0,
      neutral_percentage: total > 0 ? Math.round((neutral / total) * 100) : 0
    };
  }

  /**
   * Process multiple products in batch
   */
  async processMultipleProducts(products, action = 'analyze') {
    try {
      const results = [];
      
      for (const product of products) {
        let result;
        
        if (action === 'scrape') {
          result = await this.scrapeReviews(
            product.id,
            product.title,
            product.link,
            50
          );
        } else if (action === 'analyze') {
          result = await this.completeAnalysis(product, 50);
        }
        
        results.push({
          productId: product.id,
          productTitle: product.title,
          success: result?.success || false,
          data: result,
          error: result?.error
        });
      }
      
      return {
        success: true,
        results: results,
        message: `Processed ${products.length} products`
      };
    } catch (error) {
      console.error('Error processing multiple products:', error);
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }
}

export default new SentimentService();