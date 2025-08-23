// src/pages/sentiment-analysis-processing/components/DetailedProgress.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const DetailedProgress = ({ progressDetails }) => {
  const {
    reviewsCollected,
    totalReviewsTarget,
    textBlobProgress,
    vaderProgress,
    transformersProgress,
    visualizationProgress
  } = progressDetails;

  const ProgressBar = ({ label, progress, icon, color = "primary" }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={16} className={`text-${color}`} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="List" size={20} />
        Processing Details
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-foreground mb-3">Data Collection</h4>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Reviews Collected</span>
              <span className="text-lg font-bold text-primary">
                {reviewsCollected?.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Target: {totalReviewsTarget?.toLocaleString()} reviews
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(reviewsCollected / totalReviewsTarget) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-3">Sentiment Analysis Models</h4>
          <div className="space-y-3">
            <ProgressBar
              label="TextBlob Analysis"
              progress={textBlobProgress}
              icon="FileText"
              color="primary"
            />
            <ProgressBar
              label="VADER Analysis"
              progress={vaderProgress}
              icon="Zap"
              color="accent"
            />
            <ProgressBar
              label="Transformers Model"
              progress={transformersProgress}
              icon="Brain"
              color="secondary"
            />
            <ProgressBar
              label="Visualization Prep"
              progress={visualizationProgress}
              icon="BarChart3"
              color="success"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedProgress;