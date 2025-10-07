// src/services/api.js - Fixed version with proper ES6 imports
import authService from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Get auth headers from authService
  static getAuthHeaders() {
    const token = authService.getToken();
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Check if user is authenticated before API calls
  static ensureAuthenticated() {
    if (!authService.isAuthenticated()) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }
  }

  // Generic request method with auth handling
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add auth headers
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      }
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        authService.clearAuthData();
        window.location.href = '/user-authentication';
        throw new Error('Authentication expired. Please log in again.');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Scrape products - REQUIRES AUTH
  static async scrapeProducts(category, maxProducts = 20) {
    try {
      // Check authentication before making request
      this.ensureAuthenticated();
      
      console.log(`Scraping products for category: ${category}`);
      
      const response = await this.request('/scrape-products', {
        method: 'POST',
        body: JSON.stringify({
          category: category,
          max_products: maxProducts
        })
      });

      return {
        success: true,
        products: response.products || response,
        message: `Found ${response.products?.length || response.length || 0} products`
      };
    } catch (error) {
      console.error('Failed to scrape products:', error);
      
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        window.location.href = '/user-authentication';
      }
      
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  // Scrape reviews - REQUIRES AUTH
  static async scrapeReviews(productIds, products = []) {
    try {
      // Check authentication before making request
      this.ensureAuthenticated();
      
      console.log(`Scraping reviews for ${productIds.length} products`);
      
      const productsToScrape = products.length > 0 
        ? products.filter(p => productIds.includes(p.id))
        : [];

      console.log('Products being sent:', productsToScrape);

      const requestData = {
        product_ids: productIds,
        products: productsToScrape
      };

      const response = await this.request('/scrape-reviews', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log('Scrape response:', response);

      const results = response.results || [];
      const totalReviews = response.total_reviews || 0;

      return {
        success: response.success !== false,
        results: results,
        total_reviews: totalReviews,
        message: response.message || `Reviews scraped for ${productIds.length} products`
      };
    } catch (error) {
      console.error('Failed to scrape reviews:', error);
      
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        window.location.href = '/user-authentication';
      }
      
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  // Analyze sentiment - REQUIRES AUTH (optional, can be made optional)
  static async analyzeSentiment(productIds, products = []) {
    try {
      // Optional auth check - comment out if you want it public
      // this.ensureAuthenticated();
      
      console.log(`Analyzing sentiment for ${productIds.length} products`);
      
      const response = await this.request('/analyze-sentiment', {
        method: 'POST',
        body: JSON.stringify({
          product_ids: productIds,
          products: products
        })
      });

      return {
        success: true,
        results: response.results || [],
        message: response.message || 'Sentiment analysis completed'
      };
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        window.location.href = '/user-authentication';
      }
      
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  // Load saved products - Made OPTIONAL auth for initial page load
  static async loadSavedProducts(category = null) {
    try {
      // Don't require auth for loading products from local JSON
      // Only require auth for loading from server
      
      const endpoint = category ? `/products/${category}` : '/products';
      const response = await this.request(endpoint, {
        method: 'GET'
      });

      return {
        success: true,
        products: response.products || response,
        message: 'Products loaded successfully'
      };
    } catch (error) {
      console.error('Failed to load saved products:', error);
      
      // Don't redirect on error, just return empty
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  // Save products to server - REQUIRES AUTH
  static async saveProducts(products, category) {
    try {
      this.ensureAuthenticated();
      
      const response = await this.request('/save-products', {
        method: 'POST',
        body: JSON.stringify({
          products: products,
          category: category
        })
      });

      return {
        success: true,
        message: 'Products saved successfully',
        filename: response.filename
      };
    } catch (error) {
      console.error('Failed to save products:', error);
      
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        window.location.href = '/user-authentication';
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get processing status - PUBLIC (no auth required)
  static async getProcessingStatus(jobId) {
    try {
      const response = await this.request(`/status/${jobId}`, {
        method: 'GET'
      });

      return {
        success: true,
        status: response
      };
    } catch (error) {
      console.error('Failed to get processing status:', error);
      return {
        success: false,
        status: { state: 'error', message: error.message }
      };
    }
  }

  // Get available categories - PUBLIC
  static async getCategories() {
    try {
      const response = await this.request('/categories', {
        method: 'GET'
      });

      return {
        success: true,
        categories: response.categories || []
      };
    } catch (error) {
      console.error('Failed to get categories:', error);
      return {
        success: false,
        categories: [],
        error: error.message
      };
    }
  }

  // Health check endpoint - PUBLIC
  static async healthCheck() {
    try {
      const response = await this.request('/health', {
        method: 'GET'
      });

      return {
        success: true,
        status: response
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ApiService;