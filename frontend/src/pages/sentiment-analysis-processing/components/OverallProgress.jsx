import React from 'react';
import Icon from '../../../components/AppIcon';

const OverallProgress = ({ 
  overallProgress, 
  currentStage, 
  estimatedTimeRemaining,
  isProcessing,
  isPaused 
}) => {
  const getStageIcon = (stage) => {
    switch (stage) {
      case 'scraping': return 'Download';
      case 'analyzing': return 'Brain';
      case 'generating': return 'BarChart3';
      default: return 'Clock';
    }
  };

  const getStageLabel = (stage) => {
    switch (stage) {
      case 'scraping': return 'Scraping Reviews';
      case 'analyzing': return 'Analyzing Sentiment';
      case 'generating': return 'Generating Insights';
      default: return 'Initializing';
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="text-center mb-6">
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
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - overallProgress / 100)}`}
              className="text-primary transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{overallProgress}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`p-2 rounded-full ${isPaused ? 'bg-warning/10' : 'bg-primary/10'}`}>
            <Icon 
              name={isPaused ? "Pause" : getStageIcon(currentStage)} 
              size={20} 
              className={isPaused ? "text-warning" : "text-primary"} 
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {isPaused ? 'Processing Paused' : getStageLabel(currentStage)}
            </h3>
            {!isPaused && estimatedTimeRemaining > 0 && (
              <p className="text-sm text-muted-foreground">
                Est. {formatTime(estimatedTimeRemaining)} remaining
              </p>
            )}
          </div>
        </div>

        {isPaused && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mt-4">
            <p className="text-sm text-warning font-medium">
              Processing has been paused. Click Resume to continue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverallProgress;