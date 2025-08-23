// src/pages/sentiment-analysis-processing/index.jsx
import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import ProcessingQueue from './components/ProcessingQueue';
import LivePreview from './components/LivePreview';

const SentimentAnalysisProcessing = () => {
  const [queueItems, setQueueItems] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  // Sentiment summary stats (will be populated from actual analysis)
  const [sentimentStats, setSentimentStats] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    total: 0
  });

  const handleGetStarted = () => {
    window.location.href = '/product-search-selection';
  };

  const handlePauseItem = (itemId) => {
    setQueueItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'paused' } : item
    ));
  };

  const handleResumeItem = (itemId) => {
    setQueueItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'processing' } : item
    ));
  };

  const handleRemoveItem = (itemId) => {
    setQueueItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchClick={() => window.location.href = '/product-search-selection'}
        onHistoryClick={(id) => window.location.href = `/sentiment-visualization-dashboard?analysis=${id}`}
      />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Icon name="TrendingUp" size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sentiment Analysis Processing
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Analyze product reviews and get insights into customer sentiment using advanced AI models
            </p>
          </div>

          {/* Main Content */}
          {queueItems.length === 0 && previewData.length === 0 ? (
            // Empty State - Get Started
            <div className="text-center py-16">
              <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto">
                <Icon name="BarChart3" size={64} className="text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Ready to Analyze Product Sentiment?
                </h2>
                <p className="text-gray-600 mb-6">
                  Start by selecting products you want to analyze. Our AI will process customer reviews 
                  and provide detailed sentiment insights to help you understand customer opinions.
                </p>
                <Button
                  onClick={handleGetStarted}
                  iconName="Search"
                  iconPosition="left"
                  iconSize={18}
                  className="px-8 py-3"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            // Main Processing Interface
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Processing Queue */}
              <div className="lg:col-span-2">
                <ProcessingQueue
                  queueItems={queueItems}
                  onPauseItem={handlePauseItem}
                  onResumeItem={handleResumeItem}
                  onRemoveItem={handleRemoveItem}
                />
              </div>

              {/* Right Column - Live Preview and Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sentiment Stats */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sentiment Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {sentimentStats.positive}
                      </div>
                      <div className="text-sm text-green-700">Positive</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {sentimentStats.negative}
                      </div>
                      <div className="text-sm text-red-700">Negative</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-600 mb-1">
                        {sentimentStats.neutral}
                      </div>
                      <div className="text-sm text-gray-700">Neutral</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {sentimentStats.total}
                      </div>
                      <div className="text-sm text-blue-700">Total Reviews</div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <LivePreview previewData={previewData} />
              </div>
            </div>
          )}

          {/* Quick Actions (if items exist) */}
          {queueItems.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleGetStarted}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                >
                  Add More Products
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/sentiment-visualization-dashboard'}
                  iconName="BarChart3"
                  iconPosition="left"
                  iconSize={16}
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysisProcessing;