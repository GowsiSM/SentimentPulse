// src/pages/sentiment-analysis-processing/components/ProcessingHeader.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingHeader = ({ 
  productName, 
  totalProducts, 
  currentProductIndex, 
  onPause, 
  onCancel, 
  isPaused,
  isProcessing 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={20} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Processing {currentProductIndex} of {totalProducts}
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground mb-1">
            Analyzing: {productName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time sentiment analysis in progress
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            disabled={!isProcessing}
            iconName={isPaused ? "Play" : "Pause"}
            iconPosition="left"
            iconSize={16}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancel}
            iconName="X"
            iconPosition="left"
            iconSize={16}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProcessingHeader;