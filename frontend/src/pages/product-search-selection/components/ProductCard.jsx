// snapdeal_sentiment_analyzer/src/pages/product-search-selection/components/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import sentimentService from '../../../services/sentimentService';
import authService from '../../../services/authService';

const ProductCard = ({ 
  product, 
  isSelected, 
  onSelect, 
  onAnalyze, 
  showBulkSelect = false,
  viewMode = 'grid', // 'grid' or 'list'
  className = "" 
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStep, setProcessingStep] = React.useState('');

  // Preload image when component mounts for faster loading
  React.useEffect(() => {
    if (product?.imageUrl && viewMode === 'grid') {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = product.imageUrl;
    }
  }, [product?.imageUrl, viewMode]);

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'mixed': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100';
      case 'negative': return 'bg-red-100';
      case 'mixed': return 'bg-yellow-100';
      default: return 'bg-muted';
    }
  };

  const handleScrapeReviews = async () => {
    // Check authentication BEFORE scraping
    if (!authService.isAuthenticated()) {
      alert('Please log in to scrape reviews');
      navigate('/user-authentication', { 
        state: { from: '/product-search-selection' } 
      });
      return;
    }

    if (!product?.link) {
      alert('Product link is required for scraping reviews');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Scraping reviews...');

    try {
      console.log('🔄 Starting complete analysis for product:', product.title);
      
      const result = await sentimentService.completeAnalysis(product);

      console.log('📊 Analysis result:', result);

      if (result.success) {
        sentimentService.saveToLocalStorage(result);

        console.log('✅ Analysis successful, navigating to dashboard');
        
        navigate('/reports-analytics', {
          state: {
            analysisData: result.product,
            analysisStats: result.stats,
            productInfo: product
          }
        });
      } else {
        console.error('❌ Analysis failed:', result.error);
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('💥 Error in sentiment analysis:', error);
      
      // Check for authentication errors
      if (error.message.includes('Authentication') || 
          error.message.includes('AUTHENTICATION_REQUIRED')) {
        alert('Your session has expired. Please log in again.');
        navigate('/user-authentication', { 
          state: { from: '/product-search-selection' } 
        });
      } else {
        alert(`Failed to analyze sentiment: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!product?.reviews || product.reviews.length === 0) {
      alert('No reviews available for sentiment analysis. Please scrape reviews first.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Analyzing sentiment...');

    try {
      const result = await sentimentService.analyzeSentiment(product);

      if (result.success) {
        // Save to localStorage
        const completeResult = {
          success: true,
          product: {
            ...product,
            sentiment_analysis: result.analysis,
            analysis_timestamp: new Date().toISOString()
          },
          stats: {
            total_reviews: product.reviews.length,
            analysis_summary: result.analysis.sentiment_summary
          }
        };
        
        sentimentService.saveToLocalStorage(completeResult);
        // Navigate to REPORTS & ANALYTICS
        navigate('/reports-analytics', {
          state: {
            analysisData: completeResult.product,
            analysisStats: completeResult.stats,
            productInfo: product
          }
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      alert(`Failed to analyze sentiment: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Grid view layout with image
  if (viewMode === 'grid') {
    return (
      <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''} hover:bg-red-50/80 hover:border-red-200 ${className}`}>
        {/* Product Image */}
        <div className="relative aspect-square bg-muted">
          {product?.imageUrl && !imageError ? (
            <>
              {/* Loading skeleton while image loads */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                  <Icon name="ImageIcon" size={32} className="text-muted-foreground/50" />
                </div>
              )}
              
              {/* Actual image */}
              <img
                src={product.imageUrl}
                alt={product?.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="eager"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
                style={{
                  imageRendering: 'auto',
                  contentVisibility: 'visible'
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Icon name="Package" size={48} className="text-muted-foreground" />
            </div>
          )}

          {/* Bulk Select Checkbox - Top Right */}
          {showBulkSelect && (
            <div className="absolute top-2 right-2">
              <Checkbox
                checked={isSelected}
                onChange={(e) => onSelect(product?.id, e?.target?.checked)}
                className="w-4 h-4 bg-white shadow-md"
              />
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <Icon name="Loader2" size={24} className="animate-spin mb-2" />
                <div className="text-sm font-medium">{processingStep}</div>
              </div>
            </div>
          )}

          {/* Previous Analysis Status Badge */}
          {product?.reviews && product.reviews.length > 0 && (
            <div className="absolute top-2 left-2">
              <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 shadow-sm">
                <Icon name="CheckCircle" size={12} />
                <span className="font-medium">
                  Reviews Available
                </span>
              </div>
            </div>
          )}

          {/* Sentiment Analysis Badge */}
          {product?.sentiment && (
            <div className="absolute bottom-2 left-2">
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getSentimentBg(product.sentiment.overall)} ${getSentimentColor(product.sentiment.overall)} shadow-sm`}>
                <Icon 
                  name={
                    product.sentiment.overall === 'positive' ? 'TrendingUp' :
                    product.sentiment.overall === 'negative' ? 'TrendingDown' : 'Minus'
                  } 
                  size={12} 
                />
                <span className="font-medium">
                  {product.sentiment.overall === 'positive' ? 'Positive' :
                   product.sentiment.overall === 'negative' ? 'Negative' : 'Mixed'}
                </span>
                {product.sentiment.score && (
                  <span className="opacity-75">
                    ({product.sentiment.score}%)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-5 min-h-[2.5rem]">
              {product?.title}
            </h3>
          </div>
          
          {/* Price */}
          <div className="min-h-[1.75rem] flex items-center">
            {product?.price ? (
              <div className="text-xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Price not available</div>
            )}
          </div>

          {/* Product Link */}
          <div className="min-h-[1.25rem]">
            {product?.link && (
              <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline break-all line-clamp-1"
                title={product.link}
              >
                {product.link.replace('https://', '').replace('www.', '')}
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScrapeReviews}
              iconName={isProcessing ? "Loader2" : "Download"}
              iconPosition="left"
              iconSize={14}
              className={`w-full ${isProcessing ? "animate-spin" : ""}`}
              disabled={isProcessing}
            >
              {isProcessing ? processingStep : "Scrape & Analyze"}
            </Button>
            
            {product?.reviews && product.reviews.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleAnalyzeSentiment}
                iconName={isProcessing ? "Loader2" : "BarChart3"}
                iconPosition="left"
                iconSize={14}
                className={`w-full ${isProcessing ? "animate-spin" : ""}`}
                disabled={isProcessing}
              >
                {isProcessing ? processingStep : "Analyze Sentiment"}
              </Button>
            )}
          </div>

          {/* Footer Stats - Updated time on right side */}
<div className="flex items-center justify-between pt-3 border-t border-border">
  {product?.lastUpdated && (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
      <Icon name="Clock" size={10} />
      <span>Updated {product.lastUpdated}</span>
    </div>
  )}
</div>
        </div>
      </div>
    );
  }

  // List view layout (no image, compact horizontal layout)
  return (
    <div className={`bg-card border border-border rounded-lg hover:shadow-md transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''} ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Product Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Bulk Select Checkbox */}
            {showBulkSelect && (
              <div className="flex-shrink-0">
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onSelect(product?.id, e?.target?.checked)}
                  className="w-4 h-4"
                />
              </div>
            )}
            
            {/* Product Details */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Product Name */}
              <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                {product?.title}
              </h3>
              
              {/* Price and Status Row */}
              <div className="flex items-center space-x-4 text-sm">
                {product?.price && (
                  <span className="font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                )}
                {product?.lastUpdated && (
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>Updated {product.lastUpdated}</span>
                  </span>
                )}
              </div>
              
              {/* Product Link */}
              {product?.link && (
                <a 
                  href={product.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block truncate"
                  title={product.link}
                >
                  {product.link.replace('https://', '').replace('www.', '')}
                </a>
              )}
              
              {/* Status Badges */}
              <div className="flex items-center space-x-2">
                {product?.reviews && product.reviews.length > 0 && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <Icon name="CheckCircle" size={12} />
                    <span>Reviews Available</span>
                  </span>
                )}
                {product?.sentiment && (
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getSentimentBg(product.sentiment.overall)} ${getSentimentColor(product.sentiment.overall)}`}>
                    <Icon 
                      name={
                        product.sentiment.overall === 'positive' ? 'TrendingUp' :
                        product.sentiment.overall === 'negative' ? 'TrendingDown' : 'Minus'
                      } 
                      size={12} 
                    />
                    <span>
                      {product.sentiment.overall === 'positive' ? 'Positive' :
                       product.sentiment.overall === 'negative' ? 'Negative' : 'Mixed'} Sentiment
                    </span>
                  </span>
                )}
                {isProcessing && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    <Icon name="Loader2" size={12} className="animate-spin" />
                    <span>{processingStep}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleScrapeReviews}
              iconName={isProcessing ? "Loader2" : "Download"}
              iconPosition="left"
              iconSize={14}
              disabled={isProcessing}
              className={isProcessing ? "animate-spin" : ""}
            >
              {isProcessing ? "Processing..." : "Scrape & Analyze"}
            </Button>
            {product?.reviews && product.reviews.length > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={handleAnalyzeSentiment}
                iconName={isProcessing ? "Loader2" : "BarChart3"}
                iconPosition="left"
                iconSize={14}
                disabled={isProcessing}
                className={isProcessing ? "animate-spin" : ""}
              >
                {isProcessing ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;