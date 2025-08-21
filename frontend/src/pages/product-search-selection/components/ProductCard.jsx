// snapdeal_sentiment_analyzer/src/pages/product-search-selection/components/ProductCard.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProductCard = ({ 
  product, 
  isSelected, 
  onSelect, 
  onAnalyze, 
  showBulkSelect = false,
  className = "" 
}) => {
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

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''} ${className}`}>
      {/* Product Info */}
      <div className="p-4">
        {/* Selection Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Title */}
            <h3 className="font-medium text-foreground text-sm line-clamp-3 mb-2 leading-5">
              {product?.title}
            </h3>
            
            {/* Price */}
            {product?.price && (
              <div className="text-lg font-semibold text-primary mb-2">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* Bulk Select Checkbox */}
          {showBulkSelect && (
            <div className="ml-2 flex-shrink-0">
              <Checkbox
                checked={isSelected}
                onChange={(e) => onSelect(product?.id, e?.target?.checked)}
                className="w-4 h-4"
              />
            </div>
          )}
        </div>

        {/* Product Link */}
        {product?.link && (
          <div className="mb-3">
            <a 
              href={product.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
            >
              {product.link}
            </a>
          </div>
        )}

        {/* Previous Analysis Status */}
        {product?.reviews && product.reviews.length > 0 && (
          <div className="mb-3">
            <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <Icon name="CheckCircle" size={12} />
              <span className="font-medium">
                {product.reviews.length} reviews scraped
              </span>
            </div>
          </div>
        )}

        {/* Previous Sentiment Analysis */}
        {product?.sentiment && (
          <div className="mb-3">
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getSentimentBg(product.sentiment.overall)} ${getSentimentColor(product.sentiment.overall)}`}>
              <Icon 
                name={
                  product.sentiment.overall === 'positive' ? 'TrendingUp' :
                  product.sentiment.overall === 'negative' ? 'TrendingDown' : 'Minus'
                } 
                size={12} 
              />
              <span className="font-medium">
                {product.sentiment.overall === 'positive' ? 'Positive' :
                 product.sentiment.overall === 'negative' ? 'Negative' : 'Mixed'} Sentiment
              </span>
              {product.sentiment.score && (
                <span className="opacity-75">
                  ({product.sentiment.score}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnalyze(product, 'scrape')}
            iconName="Download"
            iconPosition="left"
            iconSize={14}
            className="w-full"
          >
            Scrape Reviews
          </Button>
          
          {product?.reviews && product.reviews.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAnalyze(product, 'sentiment')}
              iconName="BarChart3"
              iconPosition="left"
              iconSize={14}
              className="w-full"
            >
              Analyze Sentiment
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="MessageSquare" size={12} />
            <span>{product?.reviews?.length || 0} reviews</span>
          </div>
          {product?.lastUpdated && (
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={12} />
              <span>Updated {product.lastUpdated}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;