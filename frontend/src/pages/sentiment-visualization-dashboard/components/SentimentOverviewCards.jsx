// src/pages/sentiment-visualization-dashboard/components/SentimentOverviewCards.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const SentimentOverviewCards = ({ sentimentData }) => {
  const cards = [
    {
      title: 'Positive Reviews',
      value: sentimentData?.positive?.percentage,
      count: sentimentData?.positive?.count,
      icon: 'TrendingUp',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      iconBg: 'bg-warning'
    },
    {
      title: 'Negative Reviews',
      value: sentimentData?.negative?.percentage,
      count: sentimentData?.negative?.count,
      icon: 'TrendingDown',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      iconBg: 'bg-accent'
    },
    {
      title: 'Neutral Reviews',
      value: sentimentData?.neutral?.percentage,
      count: sentimentData?.neutral?.count,
      icon: 'Minus',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      iconBg: 'bg-muted-foreground'
    },
    {
      title: 'Total Reviews',
      value: '100%',
      count: sentimentData?.total,
      icon: 'MessageSquare',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      iconBg: 'bg-primary'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards?.map((card, index) => (
        <div key={index} className={`${card?.bgColor} rounded-lg p-4 border border-border`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${card?.iconBg} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={20} color="white" />
            </div>
            <span className={`text-2xl font-bold ${card?.color}`}>
              {card?.value}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">{card?.title}</h3>
            <p className="text-xs text-muted-foreground">
              {card?.count?.toLocaleString('en-IN')} reviews
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SentimentOverviewCards;