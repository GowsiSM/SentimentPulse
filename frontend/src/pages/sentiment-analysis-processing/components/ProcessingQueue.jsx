// src/pages/sentiment-analysis-processing/components/ProcessingQueue.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingQueue = ({ queueItems = [], onPauseItem, onResumeItem, onRemoveItem }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'paused': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      case 'queued': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-500 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return 'Activity';
      case 'completed': return 'CheckCircle';
      case 'paused': return 'Pause';
      case 'failed': return 'XCircle';
      case 'queued': return 'Clock';
      default: return 'Clock';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      case 'failed': return 'Failed';
      case 'queued': return 'Queued';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon name="List" size={20} />
        Processing Queue ({queueItems.length})
      </h3>
      
      <div className="space-y-4">
        {queueItems.length > 0 ? (
          queueItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors relative"
            >
              {/* Active Processing Indicator */}
              {item.status === 'processing' && (
                <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 ml-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                      <Icon
                        name={getStatusIcon(item.status)}
                        size={14}
                      />
                      <span className="text-sm font-medium">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{item.productName}</h4>
                  <p className="text-sm text-gray-500 mb-2 break-all">{item.url}</p>
                  
                  {item.status === 'processing' && item.progress && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Processing...</span>
                        <span>{item.progress}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span>Reviews: {item.reviewsFound || 0}</span>
                    {item.startTime && <span>Started: {item.startTime}</span>}
                    {item.estimatedCompletion && (
                      <span>ETA: {item.estimatedCompletion}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'processing' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPauseItem?.(item.id)}
                      iconName="Pause"
                      iconSize={14}
                    >
                      Pause
                    </Button>
                  )}
                  
                  {item.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResumeItem?.(item.id)}
                      iconName="Play"
                      iconSize={14}
                    >
                      Resume
                    </Button>
                  )}
                  
                  {item.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResumeItem?.(item.id)}
                      iconName="RotateCcw"
                      iconSize={14}
                    >
                      Retry
                    </Button>
                  )}
                  
                  {item.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/sentiment-visualization-dashboard?product=${item.id}`}
                      iconName="Eye"
                      iconSize={14}
                    >
                      View Results
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem?.(item.id)}
                    iconName="Trash2"
                    iconSize={14}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {item.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium mb-1">Error Details:</p>
                  <p className="text-sm text-red-600">{item.error}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Inbox" size={48} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No items in processing queue</p>
            <p className="text-sm text-gray-400 mt-1">
              Items will appear here when analysis begins
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingQueue;