import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingQueue = ({ queueItems, onPauseItem, onResumeItem, onRemoveItem }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-primary';
      case 'completed': return 'text-success';
      case 'paused': return 'text-warning';
      case 'failed': return 'text-destructive';
      case 'queued': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
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
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="List" size={20} />
        Processing Queue ({queueItems?.length})
      </h3>
      <div className="space-y-4">
        {queueItems?.map((item) => (
          <div
            key={item?.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    name={getStatusIcon(item?.status)}
                    size={16}
                    className={`${getStatusColor(item?.status)} ${
                      item?.status === 'processing' ? 'animate-spin' : ''
                    }`}
                  />
                  <span className={`text-sm font-medium ${getStatusColor(item?.status)}`}>
                    {getStatusLabel(item?.status)}
                  </span>
                </div>
                
                <h4 className="font-medium text-foreground mb-1">{item?.productName}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item?.url}</p>
                
                {item?.status === 'processing' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item?.progress}%` }}
                    ></div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Reviews: {item?.reviewsFound || 0}</span>
                  <span>Started: {item?.startTime}</span>
                  {item?.estimatedCompletion && (
                    <span>ETA: {item?.estimatedCompletion}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item?.status === 'processing' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPauseItem(item?.id)}
                    iconName="Pause"
                    iconSize={14}
                  >
                    Pause
                  </Button>
                )}
                
                {item?.status === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResumeItem(item?.id)}
                    iconName="Play"
                    iconSize={14}
                  >
                    Resume
                  </Button>
                )}
                
                {item?.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResumeItem(item?.id)}
                    iconName="RotateCcw"
                    iconSize={14}
                  >
                    Retry
                  </Button>
                )}
                
                {item?.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/sentiment-visualization-dashboard?product=${item?.id}`}
                    iconName="Eye"
                    iconSize={14}
                  >
                    View Results
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item?.id)}
                  iconName="Trash2"
                  iconSize={14}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>

            {item?.error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium mb-1">Error Details:</p>
                <p className="text-sm text-destructive">{item?.error}</p>
              </div>
            )}
          </div>
        ))}

        {queueItems?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No items in processing queue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingQueue;