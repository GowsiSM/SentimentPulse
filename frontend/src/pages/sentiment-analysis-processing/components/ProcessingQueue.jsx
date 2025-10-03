// src/pages/sentiment-analysis-processing/components/ProcessingQueue.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingQueue = ({ queueItems = [], onPauseItem, onResumeItem, onRemoveItem }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'queued': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return 'Loader';
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
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name={getStatusIcon(item.status)}
                      size={16}
                      className={`${getStatusColor(item.status)} ${
                        item.status === 'processing' ? 'animate-spin' : ''
                      }`}
                    />
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{item.productName}</h4>
                  <p className="text-sm text-gray-500 mb-2 break-all">{item.url}</p>
                  
                  {item.status === 'processing' && item.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
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