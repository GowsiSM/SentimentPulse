// src/pages/review-scraping-processing/index.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ReviewScrapingProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products = [], mode = 'single', results = [] } = location.state || {};
  
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [scrapedResults, setScrapedResults] = useState(results);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'bulk' && products.length > 0 && results.length === 0) {
      // Simulate bulk scraping progress
      simulateBulkScraping();
    } else if (results.length > 0) {
      // Results already available
      setIsProcessing(false);
      setScrapedResults(results);
    }
  }, [mode, products, results]);

  const simulateBulkScraping = () => {
    let progress = 0;
    const totalProducts = products.length;
    const progressInterval = setInterval(() => {
      progress += 1;
      setCurrentProgress(Math.min((progress / totalProducts) * 100, 100));
      setCurrentProductIndex(Math.min(Math.floor(progress / (100 / totalProducts)), totalProducts - 1));
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        setIsProcessing(false);
        // In real implementation, this would be actual API results
        setScrapedResults(products.map((product, index) => ({
          id: product.id,
          title: product.title,
          reviews: Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
            id: `review-${product.id}-${i}`,
            text: `Mock review ${i + 1} for ${product.title}`,
            rating: Math.floor(Math.random() * 5) + 1,
            reviewer: `User ${i + 1}`,
            date: new Date().toLocaleDateString()
          })),
          review_count: Math.floor(Math.random() * 10) + 5
        })));
      }
    }, 1000);
  };

  const handleViewResults = () => {
    navigate('/product-search-selection');
  };

  const handleAnalyzeSentiment = () => {
    const productsWithReviews = scrapedResults.filter(p => p.reviews && p.reviews.length > 0);
    if (productsWithReviews.length > 0) {
      navigate('/sentiment-analysis-processing', {
        state: {
          products: productsWithReviews,
          mode: 'bulk',
          results: productsWithReviews
        }
      });
    }
  };

  const getCurrentProduct = () => {
    return products[currentProductIndex] || {};
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Icon name="Download" size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'bulk' ? 'Bulk Review Scraping' : 'Review Scraping'}
            </h1>
            <p className="text-gray-600">
              {mode === 'bulk' 
                ? `Scraping reviews for ${products.length} products` 
                : 'Scraping product reviews'
              }
            </p>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center">
              {/* Circular Progress */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - currentProgress / 100)}`}
                    className="text-blue-600 transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(currentProgress)}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Icon 
                    name={isProcessing ? "Loader" : "CheckCircle"} 
                    size={20} 
                    className={isProcessing ? "text-blue-600 animate-pulse" : "text-green-600"} 
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {isProcessing ? 'Scraping Reviews...' : 'Scraping Complete!'}
                  </h3>
                  {isProcessing && (
                    <p className="text-sm text-gray-600">
                      Processing: {getCurrentProduct().title}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {!isProcessing && scrapedResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraping Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {scrapedResults.length}
                  </div>
                  <div className="text-sm text-green-700">Products Processed</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {scrapedResults.reduce((total, product) => total + (product.reviews?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-blue-700">Total Reviews</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {scrapedResults.filter(p => p.reviews?.length > 0).length}
                  </div>
                  <div className="text-sm text-purple-700">Products with Reviews</div>
                </div>
              </div>

              {/* Product List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {scrapedResults.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon 
                        name={product.reviews?.length > 0 ? "CheckCircle" : "XCircle"} 
                        size={16} 
                        className={product.reviews?.length > 0 ? "text-green-600" : "text-red-600"} 
                      />
                      <span className="font-medium text-gray-900 text-sm">
                        {product.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.reviews?.length || 0} reviews
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!isProcessing && (
              <>
                <Button
                  variant="outline"
                  onClick={handleViewResults}
                  iconName="ArrowLeft"
                  iconPosition="left"
                  iconSize={16}
                >
                  Back to Products
                </Button>
                <Button
                  variant="default"
                  onClick={handleAnalyzeSentiment}
                  disabled={scrapedResults.filter(p => p.reviews?.length > 0).length === 0}
                  iconName="BarChart3"
                  iconPosition="left"
                  iconSize={16}
                >
                  Analyze Sentiment
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewScrapingProcessing;