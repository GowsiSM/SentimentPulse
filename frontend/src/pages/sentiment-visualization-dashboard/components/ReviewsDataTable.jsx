// src/pages/sentiment-visualization-dashboard/components/ReviewsDataTable.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReviewsDataTable = ({ reviews = [], onReviewClick }) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
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
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
            Individual Reviews
          </h3>
          <span className="text-sm text-gray-500">
            {reviews.length.toLocaleString('en-IN')} reviews
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="MessageSquare" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Available</h3>
          <p className="text-gray-500 mb-6">
            There are no reviews to display at the moment. Start a new analysis to see reviews here.
          </p>
          <Button
            variant="default"
            onClick={() => window.location.href = '/product-search-selection'}
            iconName="Search"
            iconPosition="left"
            iconSize={16}
          >
            Start New Analysis
          </Button>
        </div>
      ) : (
        <>
          {/* Table Header - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('rating')}
                className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900"
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
                className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900"
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
                className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900"
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
                className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900"
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
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {sortedReviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Mobile Layout */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={14}
                            className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({review.rating})</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getSentimentColor(review.sentiment)}`}>
                      <Icon name={getSentimentIcon(review.sentiment)} size={12} />
                      <span>{review.sentiment}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Score: {review.score}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900">
                    {expandedReviews.has(review.id) ? review.text : truncateText(review.text)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      by {review.reviewer}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReviewExpansion(review.id)}
                      iconName={expandedReviews.has(review.id) ? 'ChevronUp' : 'ChevronDown'}
                      iconPosition="right"
                      iconSize={14}
                    >
                      {expandedReviews.has(review.id) ? 'Show Less' : 'Show More'}
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start">
                  <div className="col-span-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          size={14}
                          className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getSentimentColor(review.sentiment)}`}>
                      <Icon name={getSentimentIcon(review.sentiment)} size={12} />
                      <span>{review.sentiment}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-900">{review.score}%</span>
                  </div>
                  
                  <div className="col-span-5">
                    <p className="text-sm text-gray-900">
                      {expandedReviews.has(review.id) ? review.text : truncateText(review.text, 150)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">by {review.reviewer}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReviewExpansion(review.id)}
                      iconName={expandedReviews.has(review.id) ? 'ChevronUp' : 'ChevronDown'}
                      iconSize={14}
                    >
                      <span className="sr-only">
                        {expandedReviews.has(review.id) ? 'Show Less' : 'Show More'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {reviews.length} reviews</span>
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
        </>
      )}
    </div>
  );
};

export default ReviewsDataTable;