// src/pages/sentiment-analysis-processing/components/LivePreview.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const LivePreview = ({ previewData = [] }) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'ThumbsUp';
      case 'negative': return 'ThumbsDown';
      case 'neutral': return 'Minus';
      default: return 'HelpCircle';
    }
  };

  const highlightSentimentWords = (text, sentiment) => {
    if (!text) return '';
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor'];
    
    let highlightWords = [];
    if (sentiment === 'positive') highlightWords = positiveWords;
    if (sentiment === 'negative') highlightWords = negativeWords;
    
    let highlightedText = text;
    highlightWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark class="bg-${sentiment === 'positive' ? 'green' : 'red'}-200 px-1 rounded">$&</mark>`);
    });
    
    return highlightedText;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon name="Eye" size={20} />
        Live Preview - Sample Analyzed Reviews
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {previewData.length > 0 ? (
          previewData.map((review, index) => (
            <div
              key={review.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full ${getSentimentColor(review.sentiment).split(' ')[1]}`}>
                    <Icon
                      name={getSentimentIcon(review.sentiment)}
                      size={16}
                      className={getSentimentColor(review.sentiment).split(' ')[0]}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{review.reviewer}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          size={12}
                          className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  
                  <div
                    className="text-sm text-gray-900 mb-2 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightSentimentWords(review.text, review.sentiment)
                    }}
                  />
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Sentiment:</span>
                      <span className={`font-medium capitalize ${getSentimentColor(review.sentiment).split(' ')[0]}`}>
                        {review.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Confidence:</span>
                      <span className="font-medium text-gray-900">{review.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-medium text-gray-900">{review.model}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="MessageSquare" size={48} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No analyzed reviews available yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Sample reviews will appear here as processing completes
            </p>
          </div>
        )}
      </div>
      
      {previewData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {previewData.length} sample reviews
            </span>
            <button
              onClick={() => window.location.href = '/sentiment-visualization-dashboard'}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View All Results →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreview;