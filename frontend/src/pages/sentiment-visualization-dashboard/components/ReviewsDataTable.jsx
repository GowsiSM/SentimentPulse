import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReviewsDataTable = ({ reviews, onReviewClick }) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded?.has(reviewId)) {
      newExpanded?.delete(reviewId);
    } else {
      newExpanded?.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-warning bg-warning/10';
      case 'negative':
        return 'text-accent bg-accent/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'ThumbsUp';
      case 'negative':
        return 'ThumbsDown';
      default:
        return 'Minus';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    return text?.length > maxLength ? text?.substring(0, maxLength) + '...' : text;
  };

  const sortedReviews = [...reviews]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground">
            Individual Reviews
          </h3>
          <span className="text-sm text-muted-foreground">
            {reviews?.length?.toLocaleString('en-IN')} reviews
          </span>
        </div>
      </div>
      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-muted border-b border-border text-sm font-medium text-muted-foreground">
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('rating')}
            className="p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            Rating
            <Icon 
              name={sortField === 'rating' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
              size={14} 
              className="ml-1"
            />
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('sentiment')}
            className="p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            Sentiment
            <Icon 
              name={sortField === 'sentiment' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
              size={14} 
              className="ml-1"
            />
          </Button>
        </div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('score')}
            className="p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            Score
            <Icon 
              name={sortField === 'score' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
              size={14} 
              className="ml-1"
            />
          </Button>
        </div>
        <div className="col-span-5">Review Text</div>
        <div className="col-span-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('date')}
            className="p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            Date
            <Icon 
              name={sortField === 'date' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
              size={14} 
              className="ml-1"
            />
          </Button>
        </div>
        <div className="col-span-1">Actions</div>
      </div>
      {/* Table Body */}
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {sortedReviews?.map((review) => (
          <div key={review?.id} className="p-4 hover:bg-muted/50 transition-colors">
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)]?.map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={14}
                        className={i < review?.rating ? 'text-warning fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({review?.rating})</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getSentimentColor(review?.sentiment)}`}>
                  <Icon name={getSentimentIcon(review?.sentiment)} size={12} />
                  <span>{review?.sentiment}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Score: {review?.score}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.date)?.toLocaleDateString('en-IN')}
                </span>
              </div>

              <p className="text-sm text-foreground">
                {expandedReviews?.has(review?.id) ? review?.text : truncateText(review?.text)}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  by {review?.reviewer}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReviewExpansion(review?.id)}
                  iconName={expandedReviews?.has(review?.id) ? 'ChevronUp' : 'ChevronDown'}
                  iconPosition="right"
                  iconSize={14}
                >
                  {expandedReviews?.has(review?.id) ? 'Show Less' : 'Show More'}
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start">
              <div className="col-span-1">
                <div className="flex items-center">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={14}
                      className={i < review?.rating ? 'text-warning fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              
              <div className="col-span-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getSentimentColor(review?.sentiment)}`}>
                  <Icon name={getSentimentIcon(review?.sentiment)} size={12} />
                  <span>{review?.sentiment}</span>
                </div>
              </div>
              
              <div className="col-span-1">
                <span className="text-sm font-medium text-foreground">{review?.score}%</span>
              </div>
              
              <div className="col-span-5">
                <p className="text-sm text-foreground">
                  {expandedReviews?.has(review?.id) ? review?.text : truncateText(review?.text, 150)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">by {review?.reviewer}</p>
              </div>
              
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground">
                  {new Date(review.date)?.toLocaleDateString('en-IN')}
                </span>
              </div>
              
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReviewExpansion(review?.id)}
                  iconName={expandedReviews?.has(review?.id) ? 'ChevronUp' : 'ChevronDown'}
                  iconSize={14}
                >
                  <span className="sr-only">
                    {expandedReviews?.has(review?.id) ? 'Show Less' : 'Show More'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="p-4 bg-muted border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {reviews?.length} reviews</span>
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            iconPosition="left"
            iconSize={14}
          >
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsDataTable;