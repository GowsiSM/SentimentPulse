// src/pages/sentiment-analysis-processing/components/OverallProgress.jsx
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
        {/* Pulsing Dot Indicator */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{overallProgress}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          {/* Progress Ring */}
          <svg className="w-32 h-32" viewBox="0 0 120 120">
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
          {/* Active Indicator Dot */}
          {isProcessing && !isPaused && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`p-2 rounded-full ${isPaused ? 'bg-warning/10' : 'bg-primary/10'} relative`}>
            <Icon 
              name={isPaused ? "Pause" : getStageIcon(currentStage)} 
              size={20} 
              className={isPaused ? "text-warning" : "text-primary"} 
            />
            {/* Small activity indicator */}
            {isProcessing && !isPaused && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
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

        {/* Stage Progress Bar */}
        {isProcessing && !isPaused && (
          <div className="mt-4 bg-gray-100 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000"
              style={{ 
                width: `${overallProgress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
              }}
            ></div>
          </div>
        )}

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