// src/services/sentimentService.js
import ApiService from './api';

class SentimentService {
  /**
   * Analyze product reviews using the trained model
   */
  async analyzeProductSentiment(productId, productTitle, productUrl, reviews) {
    try {
      const response = await ApiService.analyzeProductReviews(
        productId,
        productTitle,
        productUrl,
        reviews
      );

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
   * Complete workflow: scrape reviews and analyze sentiment
   */
  async completeAnalysis(productId, productTitle, productUrl, maxReviews = 50) {
    try {
      const response = await ApiService.completeProductAnalysis(
        productId,
        productTitle,
        productUrl,
        maxReviews
      );

      if (response.success) {
        return {
          success: true,
          analysis: response.analysis || response,
          stats: response.stats || this._extractStatsFromAnalysis(response.analysis || response),
          message: response.message || 'Complete analysis finished successfully'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to complete analysis'
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
   * Scrape reviews for a product
   */
  async scrapeReviews(productId, productTitle, productUrl, maxReviews = 50) {
    try {
      const response = await ApiService.scrapeReviewsForProduct(
        productId,
        productTitle,
        productUrl,
        maxReviews
      );

      if (response.success) {
        return {
          success: true,
          reviews: response.reviews || [],
          total_reviews: response.total_reviews || (response.reviews ? response.reviews.length : 0),
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
   * Get analysis history
   */
  async getAnalysisHistory() {
    try {
      const response = await ApiService.getAnalysisHistory();
      
      if (response.success) {
        return {
          success: true,
          history: response.history || [],
          totalCount: response.total_count || (response.history ? response.history.length : 0)
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch analysis history'
        };
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return {
        success: false,
        error: error.message || 'Network error fetching analysis history'
      };
    }
  }

  /**
   * Get detailed analysis by ID
   */
  async getAnalysisDetail(analysisId) {
    try {
      const response = await ApiService.getAnalysisDetail(analysisId);
      
      if (response.success) {
        return {
          success: true,
          analysis: response.analysis
        };
      } else {
        return {
          success: false,
          error: response.error || 'Analysis not found'
        };
      }
    } catch (error) {
      console.error('Error fetching analysis detail:', error);
      return {
        success: false,
        error: error.message || 'Network error fetching analysis detail'
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
        overall_sentiment: 'neutral'
      };
    }

    const summary = analysis.sentiment_summary || analysis;
    
    return {
      total_reviews: summary.total_reviews || 0,
      positive_percentage: summary.positive_percent || summary.sentiment_distribution?.positive || 0,
      negative_percentage: summary.negative_percent || summary.sentiment_distribution?.negative || 0,
      neutral_percentage: summary.neutral_percent || summary.sentiment_distribution?.neutral || 0,
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
   * Get analysis progress (for processing page)
   */
  getAnalysisProgress(analysis) {
    if (!analysis) {
      return {
        overallProgress: 0,
        currentStage: 'initializing',
        estimatedTimeRemaining: 0,
        isProcessing: false,
        isPaused: false
      };
    }

    const totalReviews = analysis.total_reviews || 0;
    const analyzedReviews = analysis.analyzed_reviews?.length || 0;
    
    let overallProgress = 0;
    let currentStage = 'initializing';
    let estimatedTimeRemaining = 0;

    if (totalReviews > 0) {
      overallProgress = Math.min(100, Math.round((analyzedReviews / totalReviews) * 100));
      
      if (overallProgress < 30) {
        currentStage = 'scraping';
        estimatedTimeRemaining = Math.max(30, totalReviews * 2); // seconds
      } else if (overallProgress < 80) {
        currentStage = 'analyzing';
        estimatedTimeRemaining = Math.max(20, Math.round((100 - overallProgress) * 0.5));
      } else {
        currentStage = 'generating';
        estimatedTimeRemaining = Math.max(10, Math.round((100 - overallProgress) * 0.2));
      }
    }

    return {
      overallProgress,
      currentStage,
      estimatedTimeRemaining,
      isProcessing: overallProgress < 100,
      isPaused: false
    };
  }

  /**
   * Generate sample preview data for processing page
   */
  generateSamplePreview(analyzedReviews, count = 5) {
    if (!analyzedReviews || !Array.isArray(analyzedReviews)) {
      return [];
    }

    return analyzedReviews.slice(0, count).map((review, index) => ({
      id: `preview-${index}`,
      reviewer: `Customer ${index + 1}`,
      rating: Math.floor(Math.random() * 5) + 1,
      date: new Date().toLocaleDateString(),
      text: review.review || review.text || 'No review text available',
      sentiment: review.sentiment?.sentiment || review.sentiment || 'neutral',
      confidence: review.sentiment?.confidence || 75,
      model: review.sentiment?.model_used || 'trained_distilbert'
    }));
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
          // First scrape reviews, then analyze
          const scrapeResult = await this.scrapeReviews(
            product.id,
            product.title,
            product.link,
            50
          );
          
          if (scrapeResult.success && scrapeResult.reviews.length > 0) {
            result = await this.analyzeProductSentiment(
              product.id,
              product.title,
              product.link,
              scrapeResult.reviews
            );
          } else {
            result = scrapeResult;
          }
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