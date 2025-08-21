// snapdeal_sentiment_analyzer/src/pages/product-search-selection/components/BulkActionBar.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionBar = ({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onClearSelection, 
  onBulkScrape,
  onBulkAnalyze, 
  isProcessing = false,
  processingType = null, // 'scraping' or 'analyzing'
  className = "" 
}) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`bg-primary text-primary-foreground rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        {/* Selection Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} />
            <span className="font-medium">
              {selectedCount} of {totalCount} selected
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="hidden sm:block w-32 h-2 bg-primary-foreground bg-opacity-20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-foreground transition-all duration-300"
              style={{ width: `${(selectedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Select All/Clear */}
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            iconName={isAllSelected ? "Square" : "CheckSquare"}
            iconPosition="left"
            iconSize={16}
            className="text-primary-foreground hover:bg-primary-foreground hover:bg-opacity-10"
          >
            {isAllSelected ? 'Clear All' : 'Select All'}
          </Button>

          {/* Clear Selection */}
          {selectedCount > 0 && !isAllSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconPosition="left"
              iconSize={16}
              className="text-primary-foreground hover:bg-primary-foreground hover:bg-opacity-10"
            >
              Clear
            </Button>
          )}

          {/* Bulk Scrape */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onBulkScrape}
            disabled={isProcessing}
            loading={isProcessing && processingType === 'scraping'}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
            className="bg-primary-foreground text-primary hover:bg-opacity-90"
          >
            {isProcessing && processingType === 'scraping' ? 'Scraping...' : `Scrape ${selectedCount} Products`}
          </Button>

          {/* Bulk Analyze */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onBulkAnalyze}
            disabled={isProcessing}
            loading={isProcessing && processingType === 'analyzing'}
            iconName="BarChart3"
            iconPosition="left"
            iconSize={16}
            className="bg-primary-foreground text-primary hover:bg-opacity-90"
          >
            {isProcessing && processingType === 'analyzing' ? 'Analyzing...' : `Analyze ${selectedCount} Products`}
          </Button>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden mt-3 flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          iconName={isAllSelected ? "Square" : "CheckSquare"}
          iconPosition="left"
          iconSize={16}
          className="flex-1 text-primary-foreground hover:bg-primary-foreground hover:bg-opacity-10"
        >
          {isAllSelected ? 'Clear All' : 'Select All'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkScrape}
          disabled={isProcessing}
          loading={isProcessing && processingType === 'scraping'}
          iconName="Download"
          iconPosition="left"
          iconSize={16}
          className="flex-1 bg-primary-foreground text-primary hover:bg-opacity-90"
        >
          Scrape
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkAnalyze}
          disabled={isProcessing}
          loading={isProcessing && processingType === 'analyzing'}
          iconName="BarChart3"
          iconPosition="left"
          iconSize={16}
          className="flex-1 bg-primary-foreground text-primary hover:bg-opacity-90"
        >
          Analyze
        </Button>
      </div>

      {/* Processing Estimate */}
      {selectedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-primary-foreground border-opacity-20">
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>Estimated processing time:</span>
            <span className="font-medium">
              {processingType === 'scraping' 
                ? `${Math.ceil(selectedCount * 2)} - ${Math.ceil(selectedCount * 5)} minutes`
                : `${Math.ceil(selectedCount * 0.5)} - ${Math.ceil(selectedCount * 1.2)} minutes`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionBar;