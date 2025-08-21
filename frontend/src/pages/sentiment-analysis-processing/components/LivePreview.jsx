import React from 'react';
import Icon from '../../../components/AppIcon';

const LivePreview = ({ previewData }) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-sentiment-positive bg-sentiment-positive';
      case 'negative': return 'text-sentiment-negative bg-sentiment-negative';
      case 'neutral': return 'text-sentiment-neutral bg-sentiment-neutral';
      default: return 'text-muted-foreground bg-muted';
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
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor'];
    
    let highlightWords = [];
    if (sentiment === 'positive') highlightWords = positiveWords;
    if (sentiment === 'negative') highlightWords = negativeWords;
    
    let highlightedText = text;
    highlightWords?.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText?.replace(regex, `<mark class="bg-${sentiment === 'positive' ? 'sentiment-positive' : 'sentiment-negative'} px-1 rounded">$&</mark>`);
    });
    
    return highlightedText;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="Eye" size={20} />
        Live Preview - Sample Analyzed Reviews
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {previewData?.map((review) => (
          <div
            key={review?.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-full ${getSentimentColor(review?.sentiment)?.split(' ')?.[1]}`}>
                  <Icon
                    name={getSentimentIcon(review?.sentiment)}
                    size={16}
                    className={getSentimentColor(review?.sentiment)?.split(' ')?.[0]}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-foreground">{review?.reviewer}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)]?.map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={12}
                        className={i < review?.rating ? 'text-warning fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review?.date}</span>
                </div>
                
                <div
                  className="text-sm text-foreground mb-2 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightSentimentWords(review?.text, review?.sentiment)
                  }}
                />
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Sentiment:</span>
                    <span className={`font-medium capitalize ${getSentimentColor(review?.sentiment)?.split(' ')?.[0]}`}>
                      {review?.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium text-foreground">{review?.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium text-foreground">{review?.model}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {previewData?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No analyzed reviews available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sample reviews will appear here as processing completes
            </p>
          </div>
        )}
      </div>
      {previewData?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {previewData?.length} sample reviews
            </span>
            <button
              onClick={() => window.location.href = '/sentiment-visualization-dashboard'}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
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