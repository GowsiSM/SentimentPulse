// snapdeal_sentiment_analyzer/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Generic request method with error handling
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
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

  // Scrape products from Snapdeal for a given category
  static async scrapeProducts(category, maxProducts = 20) {
    try {
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
        products: response.products || response, // Handle different response formats
        message: `Found ${response.products?.length || response.length || 0} products`
      };
    } catch (error) {
      console.error('Failed to scrape products:', error);
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  // Scrape reviews for selected products
  static async scrapeReviews(productIds, products = []) {
    try {
      console.log(`Scraping reviews for ${productIds.length} products`);
      
      // If products array is provided, use it; otherwise just send IDs
      const requestData = products.length > 0 
        ? { products: products.filter(p => productIds.includes(p.id)) }
        : { product_ids: productIds };

      const response = await this.request('/scrape-reviews', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      return {
        success: true,
        results: response,
        message: `Reviews scraped for ${productIds.length} products`
      };
    } catch (error) {
      console.error('Failed to scrape reviews:', error);
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  // Analyze sentiment for scraped reviews
  static async analyzeSentiment(productIds, products = []) {
    try {
      console.log(`Analyzing sentiment for ${productIds.length} products`);
      
      const requestData = products.length > 0 
        ? { products: products.filter(p => productIds.includes(p.id)) }
        : { product_ids: productIds };

      const response = await this.request('/analyze-sentiment', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      return {
        success: true,
        results: response,
        message: `Sentiment analyzed for ${productIds.length} products`
      };
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  // Get processing status for long-running operations
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

  // Load saved products from server
  static async loadSavedProducts(category = null) {
    try {
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
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  // Save products to server
  static async saveProducts(products, category) {
    try {
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
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available categories
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

  // Health check endpoint
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