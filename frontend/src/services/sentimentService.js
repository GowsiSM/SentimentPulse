// snapdeal_sentiment_analyzer/src/services/sentimentService.js
const API_BASE_URL = 'http://localhost:8000/api';

class SentimentService {
  /**
   * Scrape reviews for a product
   * @param {Object} product - Product object with id, title, link
   * @returns {Promise<Object>} Scraped reviews data
   */
  async scrapeReviews(product) {
    try {
      const response = await fetch(`${API_BASE_URL}/scrape-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          product_title: product.title,
          product_url: product.link,
          max_reviews: 100 // configurable limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scraping reviews:', error);
      throw new Error(`Failed to scrape reviews: ${error.message}`);
    }
  }

  /**
   * Analyze sentiment for scraped reviews
   * @param {Object} product - Product object with reviews
   * @returns {Promise<Object>} Sentiment analysis results
   */
  async analyzeSentiment(product) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          product_title: product.title,
          product_url: product.link,
          reviews: product.reviews || []
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error(`Failed to analyze sentiment: ${error.message}`);
    }
  }

  /**
   * Complete workflow: scrape reviews and analyze sentiment
   * @param {Object} product - Product object
   * @returns {Promise<Object>} Complete analysis results
   */
  async completeAnalysis(product) {
    try {
      // Step 1: Scrape reviews
      const scrapedData = await this.scrapeReviews(product);
      
      if (!scrapedData.success || !scrapedData.reviews || scrapedData.reviews.length === 0) {
        throw new Error('No reviews found for this product');
      }

      // Step 2: Analyze sentiment
      const updatedProduct = {
        ...product,
        reviews: scrapedData.reviews
      };
      
      const sentimentData = await this.analyzeSentiment(updatedProduct);
      
      if (!sentimentData.success) {
        throw new Error('Failed to analyze sentiment');
      }

      // Combine results
      return {
        success: true,
        product: {
          ...product,
          reviews: scrapedData.reviews,
          sentiment_analysis: sentimentData.analysis,
          analysis_timestamp: new Date().toISOString()
        },
        stats: {
          total_reviews: scrapedData.reviews.length,
          analysis_summary: sentimentData.analysis.sentiment_summary
        }
      };
    } catch (error) {
      console.error('Error in complete analysis:', error);
      throw error;
    }
  }

  /**
   * Get analysis history
   * @returns {Promise<Array>} List of previous analyses
   */
  async getAnalysisHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis-history`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error getting analysis history:', error);
      return [];
    }
  }

  /**
   * Save analysis results to local storage for offline access
   * @param {Object} analysisResult - Complete analysis result
   */
  saveToLocalStorage(analysisResult) {
    try {
      const existing = JSON.parse(localStorage.getItem('sentiment_analyses') || '[]');
      existing.unshift({
        ...analysisResult,
        saved_at: new Date().toISOString()
      });
      
      // Keep only last 50 analyses
      if (existing.length > 50) {
        existing.splice(50);
      }
      
      localStorage.setItem('sentiment_analyses', JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get saved analyses from local storage
   * @returns {Array} Saved analyses
   */
  getFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('sentiment_analyses') || '[]');
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }
}

export default new SentimentService();