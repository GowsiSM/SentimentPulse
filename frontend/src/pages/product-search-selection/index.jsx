// snapdeal_sentiment_analyzer/src/pages/product-search-selection/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import SearchBar from './components/SearchBar';
import BulkActionBar from './components/BulkActionBar';
import ProductGrid from './components/ProductGrid';
import ApiService from '../../services/api';

const ProductSearchSelection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showBulkSelect, setShowBulkSelect] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState(null); // 'scraping' or 'analyzing'
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load products from file on component mount
  useEffect(() => {
    loadProductsFromFile();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Load products from API or fallback to local JSON
  const loadProductsFromFile = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      // First try to load from API
      const response = await ApiService.loadSavedProducts();
      
      if (response.success && response.products.length > 0) {
        // Transform the data to match our expected format
        const transformedProducts = response.products.map((product, index) => ({
          id: product.id || `product-${index}`,
          title: product.title,
          link: product.link,
          price: product.price,
          imageUrl: product.image_url,
          discount: product.discount,
          category: product.category,
          reviews: product.reviews || [],
          sentiment: product.sentiment || null,
          lastUpdated: product.scraped_at ? new Date(product.scraped_at).toLocaleDateString() : new Date().toLocaleDateString()
        }));
        
        setProducts(transformedProducts);
        setSearchQuery('Loaded from API');
        setSuccessMessage(`Loaded ${transformedProducts.length} products from server`);
      } else {
        // Fallback to local JSON file
        const localResponse = await fetch('/data/products.json');
        const data = await localResponse.json();
        
        const transformedProducts = data.map((product, index) => ({
          id: `product-${index}`,
          title: product.title,
          link: product.link,
          price: product.price,
          imageUrl: product.image_url,
          discount: product.discount,
          reviews: product.reviews || [],
          sentiment: product.sentiment || null,
          lastUpdated: new Date().toLocaleDateString()
        }));
        
        setProducts(transformedProducts);
        setSearchQuery('Loaded from products.json');
        setSuccessMessage(`Loaded ${transformedProducts.length} products from local file`);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search for new products
  const handleSearch = async (query) => {
    setIsSearching(true);
    setSearchQuery(query);
    setError(null);
    setSuccessMessage(null);
    
    try {
      console.log('Searching for products:', query);
      
      // Call the API service to scrape products
      const response = await ApiService.scrapeProducts(query, 20);
      
      if (response.success && response.products && response.products.length > 0) {
        // Transform scraped products to match our component format
        const transformedProducts = response.products.map((product, index) => ({
          id: product.id || `scraped-${Date.now()}-${index}`,
          title: product.title,
          link: product.link,
          price: product.price,
          imageUrl: product.image_url,
          discount: product.discount,
          category: product.category,
          reviews: product.reviews || [],
          sentiment: product.sentiment || null,
          lastUpdated: product.scraped_at ? new Date(product.scraped_at).toLocaleDateString() : new Date().toLocaleDateString()
        }));
        
        setProducts(transformedProducts);
        setSuccessMessage(`Successfully found ${transformedProducts.length} products for "${query}"`);
        console.log(`Successfully loaded ${transformedProducts.length} products`);
      } else {
        // Handle case where no products found
        console.warn('No products found:', response.error);
        setError(`No products found for "${query}". Please try a different category.`);
        setProducts([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(`Failed to search for products: ${error.message}`);
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (productId, isSelected) => {
    setSelectedProducts(prev => 
      isSelected 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(products.map(p => p.id));
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  const handleProductAnalyze = async (product, action) => {
    if (action === 'scrape') {
      // Scrape reviews for single product
      try {
        setIsProcessing(true);
        setProcessingType('scraping');
        setError(null);
        
        const response = await ApiService.scrapeReviews([product.id], [product]);
        
        if (response.success) {
          // Update the product with scraped reviews
          setProducts(prev => prev.map(p => {
            if (p.id === product.id) {
              const updatedProduct = response.results.find(r => r.id === product.id);
              return updatedProduct ? {
                ...p,
                reviews: updatedProduct.reviews || []
              } : p;
            }
            return p;
          }));
          
          setSuccessMessage(`Successfully scraped reviews for "${product.title}"`);
        } else {
          setError(`Failed to scrape reviews: ${response.error}`);
        }
        
      } catch (error) {
        console.error('Failed to scrape reviews:', error);
        setError('Failed to scrape reviews. Please try again.');
      } finally {
        setIsProcessing(false);
        setProcessingType(null);
      }
    } else if (action === 'sentiment') {
      // Analyze sentiment for single product
      navigate('/sentiment-analysis-processing', { 
        state: { 
          products: [product],
          mode: 'single'
        } 
      });
    }
  };

  const handleBulkScrape = async () => {
    const selectedProductData = products.filter(p => 
      selectedProducts.includes(p.id)
    );
    
    setIsProcessing(true);
    setProcessingType('scraping');
    setError(null);
    
    try {
      // Start bulk scraping
      const response = await ApiService.scrapeReviews(selectedProducts, selectedProductData);
      
      if (response.success) {
        // Update products with scraped reviews
        setProducts(prev => prev.map(p => {
          if (selectedProducts.includes(p.id)) {
            const updatedProduct = response.results.find(r => r.id === p.id);
            return updatedProduct ? {
              ...p,
              reviews: updatedProduct.reviews || []
            } : p;
          }
          return p;
        }));
        
        setSuccessMessage(`Successfully scraped reviews for ${selectedProducts.length} products`);
        
        // Navigate to processing page
        navigate('/review-scraping-processing', { 
          state: { 
            products: selectedProductData,
            mode: 'bulk',
            results: response.results
          } 
        });
      } else {
        setError(`Failed to scrape reviews: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to start bulk scraping:', error);
      setError('Failed to start bulk scraping. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleBulkAnalyze = async () => {
    const selectedProductData = products.filter(p => 
      selectedProducts.includes(p.id)
    );
    
    // Check if selected products have reviews
    const productsWithReviews = selectedProductData.filter(p => p.reviews && p.reviews.length > 0);
    
    if (productsWithReviews.length === 0) {
      setError('Selected products must have reviews before analyzing sentiment. Please scrape reviews first.');
      return;
    }
    
    setIsProcessing(true);
    setProcessingType('analyzing');
    setError(null);
    
    try {
      // Start analysis
      const response = await ApiService.analyzeSentiment(selectedProducts, selectedProductData);
      
      if (response.success) {
        setSuccessMessage(`Successfully started sentiment analysis for ${selectedProducts.length} products`);
        
        // Navigate to processing page
        navigate('/sentiment-analysis-processing', { 
          state: { 
            products: selectedProductData,
            mode: 'bulk',
            results: response.results
          } 
        });
      } else {
        setError(`Failed to analyze sentiment: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setError('Failed to start sentiment analysis. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        processingStatus={
          isProcessing 
            ? processingType === 'scraping' 
              ? "Scraping reviews..." 
              : "Analyzing sentiment..."
            : null
        }
        onSearchClick={() => document.querySelector('input[type="search"]')?.focus()}
      />
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Snapdeal Product Sentiment Analyzer
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Search Snapdeal categories, scrape product reviews, and analyze customer sentiment
              </p>
            </div>

            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isSearching}
              onLoadProducts={loadProductsFromFile}
            />
          </div>
        </div>

        {/* Alert Messages */}
        {(error || successMessage) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <span className="font-medium">Error:</span>
                  <span className="ml-2">{error}</span>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <span className="font-medium">Success:</span>
                  <span className="ml-2">{successMessage}</span>
                  <button 
                    onClick={() => setSuccessMessage(null)}
                    className="ml-auto text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery.includes('products.json') || searchQuery.includes('API')
                  ? 'Available Products' 
                  : searchQuery 
                    ? `Results for "${searchQuery}"` 
                    : 'Products'
                }
              </h2>
              <span className="text-sm text-muted-foreground">
                ({products.length} products)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  iconName="Grid3X3"
                  className="rounded-none"
                />
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  iconName="List"
                  className="rounded-none"
                />
              </div>

              <Button
                variant={showBulkSelect ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowBulkSelect(!showBulkSelect);
                  if (showBulkSelect) {
                    setSelectedProducts([]);
                  }
                }}
                iconName="CheckSquare"
                iconPosition="left"
                iconSize={16}
              >
                Bulk Select
              </Button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {showBulkSelect && (
            <BulkActionBar
              selectedCount={selectedProducts.length}
              totalCount={products.length}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onBulkScrape={handleBulkScrape}
              onBulkAnalyze={handleBulkAnalyze}
              isProcessing={isProcessing}
              processingType={processingType}
              className="mb-6"
            />
          )}

          {/* Products Display */}
          {viewMode === 'grid' ? (
            <ProductGrid
            products={products}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onProductAnalyze={handleProductAnalyze}
            showBulkSelect={showBulkSelect}
            isLoading={isSearching}
            viewMode={viewMode}
          />
          ) : (
            /* List View */
            <div className="space-y-4">
              {products.length === 0 && !isSearching && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    No products available. Use the search bar above or load from saved products.
                  </div>
                </div>
              )}

              {isSearching && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading products...</div>
                </div>
              )}

              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {showBulkSelect && (
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                          className="rounded border-border"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-2">{product.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {product.price && (
                            <span className="text-sm text-primary font-medium">₹{product.price}</span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {product.reviews.length} reviews available
                          </span>
                        </div>
                        {product.link && (
                          <a 
                            href={product.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                          >
                            {product.link}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.reviews.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Reviews Available
                        </span>
                      )}
                      {product.sentiment && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Analyzed
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProductAnalyze(product, 'scrape')}
                        iconName="Download"
                        iconPosition="left"
                        iconSize={14}
                        disabled={isProcessing}
                      >
                        Scrape
                      </Button>
                      {product.reviews.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleProductAnalyze(product, 'sentiment')}
                          iconName="BarChart3"
                          iconPosition="left"
                          iconSize={14}
                          disabled={isProcessing}
                        >
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {products.length > 0 && !isSearching && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="right"
                iconSize={16}
                onClick={loadProductsFromFile}
                disabled={isSearching}
              >
                Refresh Products
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 right-6 lg:hidden z-40 flex flex-col space-y-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBulkScrape}
            disabled={isProcessing}
            loading={isProcessing && processingType === 'scraping'}
            iconName="Download"
            iconPosition="left"
            iconSize={20}
            className="rounded-full shadow-lg"
          >
            Scrape ({selectedProducts.length})
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handleBulkAnalyze}
            disabled={isProcessing}
            loading={isProcessing && processingType === 'analyzing'}
            iconName="BarChart3"
            iconPosition="left"
            iconSize={20}
            className="rounded-full shadow-lg"
          >
            Analyze ({selectedProducts.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductSearchSelection;