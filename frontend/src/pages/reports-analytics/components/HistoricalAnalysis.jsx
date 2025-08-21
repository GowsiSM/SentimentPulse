import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area, AreaChart } from 'recharts';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const HistoricalAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('sentiment_score');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Mock historical data
  const historicalData = {
    '3months': [
      { period: 'Jun 2025', sentiment_score: 68, review_volume: 15200, positive: 62, negative: 22, neutral: 16 },
      { period: 'Jul 2025', sentiment_score: 72, review_volume: 18900, positive: 68, negative: 18, neutral: 14 },
      { period: 'Aug 2025', sentiment_score: 74, review_volume: 22100, positive: 70, negative: 16, neutral: 14 }
    ],
    '6months': [
      { period: 'Mar 2025', sentiment_score: 65, review_volume: 12500, positive: 58, negative: 26, neutral: 16 },
      { period: 'Apr 2025', sentiment_score: 67, review_volume: 14800, positive: 61, negative: 24, neutral: 15 },
      { period: 'May 2025', sentiment_score: 69, review_volume: 16200, positive: 64, negative: 21, neutral: 15 },
      { period: 'Jun 2025', sentiment_score: 68, review_volume: 15200, positive: 62, negative: 22, neutral: 16 },
      { period: 'Jul 2025', sentiment_score: 72, review_volume: 18900, positive: 68, negative: 18, neutral: 14 },
      { period: 'Aug 2025', sentiment_score: 74, review_volume: 22100, positive: 70, negative: 16, neutral: 14 }
    ],
    '1year': [
      { period: 'Sep 2024', sentiment_score: 62, review_volume: 9800, positive: 55, negative: 28, neutral: 17 },
      { period: 'Oct 2024', sentiment_score: 63, review_volume: 10200, positive: 56, negative: 27, neutral: 17 },
      { period: 'Nov 2024', sentiment_score: 64, review_volume: 11500, positive: 58, negative: 26, neutral: 16 },
      { period: 'Dec 2024', sentiment_score: 66, review_volume: 13200, positive: 60, negative: 24, neutral: 16 },
      { period: 'Jan 2025', sentiment_score: 64, review_volume: 11800, positive: 57, negative: 25, neutral: 18 },
      { period: 'Feb 2025', sentiment_score: 65, review_volume: 12200, positive: 59, negative: 25, neutral: 16 },
      { period: 'Mar 2025', sentiment_score: 65, review_volume: 12500, positive: 58, negative: 26, neutral: 16 },
      { period: 'Apr 2025', sentiment_score: 67, review_volume: 14800, positive: 61, negative: 24, neutral: 15 },
      { period: 'May 2025', sentiment_score: 69, review_volume: 16200, positive: 64, negative: 21, neutral: 15 },
      { period: 'Jun 2025', sentiment_score: 68, review_volume: 15200, positive: 62, negative: 22, neutral: 16 },
      { period: 'Jul 2025', sentiment_score: 72, review_volume: 18900, positive: 68, negative: 18, neutral: 14 },
      { period: 'Aug 2025', sentiment_score: 74, review_volume: 22100, positive: 70, negative: 16, neutral: 14 }
    ]
  };

  const timeframeOptions = [
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last 12 Months' }
  ];

  const metricOptions = [
    { value: 'sentiment_score', label: 'Overall Sentiment Score' },
    { value: 'review_volume', label: 'Review Volume' },
    { value: 'sentiment_breakdown', label: 'Sentiment Breakdown' }
  ];

  const currentData = historicalData?.[selectedTimeframe] || [];
  
  // Calculate trend indicators
  const calculateTrend = (data, metric) => {
    if (data?.length < 2) return { trend: 'stable', change: 0 };
    
    const latest = data?.[data?.length - 1]?.[metric];
    const previous = data?.[data?.length - 2]?.[metric];
    const change = ((latest - previous) / previous * 100)?.toFixed(1);
    
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change)
    };
  };

  const sentimentTrend = calculateTrend(currentData, 'sentiment_score');
  const volumeTrend = calculateTrend(currentData, 'review_volume');

  const renderChart = () => {
    switch (selectedMetric) {
      case 'sentiment_score':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[50, 80]} stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Sentiment Score']}
              />
              <Line 
                type="monotone" 
                dataKey="sentiment_score" 
                stroke="#e40046" 
                strokeWidth={3}
                dot={{ fill: '#e40046', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#e40046', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'review_volume':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [value?.toLocaleString(), 'Reviews']}
              />
              <Bar dataKey="review_volume" fill="#e40046" radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="review_volume" 
                stroke="#06081fe0" 
                strokeWidth={2}
                dot={{ fill: '#06081fe0', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'sentiment_breakdown':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, '']}
              />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.8} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Historical Analysis</h2>
            <p className="text-sm text-muted-foreground">Track sentiment trends and patterns over time</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              label="Time Period"
              options={timeframeOptions}
              value={selectedTimeframe}
              onChange={setSelectedTimeframe}
              className="min-w-[160px]"
            />
            
            <Select
              label="Metric"
              options={metricOptions}
              value={selectedMetric}
              onChange={setSelectedMetric}
              className="min-w-[200px]"
            />
          </div>
        </div>
      </div>
      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-sentiment-positive/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} color="var(--color-sentiment-positive)" />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              sentimentTrend?.trend === 'up' ? 'text-sentiment-positive' : 
              sentimentTrend?.trend === 'down' ? 'text-sentiment-negative' : 'text-muted-foreground'
            }`}>
              <Icon name={
                sentimentTrend?.trend === 'up' ? 'TrendingUp' : 
                sentimentTrend?.trend === 'down' ? 'TrendingDown' : 'Minus'
              } size={16} />
              <span>{sentimentTrend?.change}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {currentData?.length > 0 ? `${currentData?.[currentData?.length - 1]?.sentiment_score}%` : 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">Current Sentiment Score</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={20} color="var(--color-primary)" />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              volumeTrend?.trend === 'up' ? 'text-sentiment-positive' : 
              volumeTrend?.trend === 'down' ? 'text-sentiment-negative' : 'text-muted-foreground'
            }`}>
              <Icon name={
                volumeTrend?.trend === 'up' ? 'TrendingUp' : 
                volumeTrend?.trend === 'down' ? 'TrendingDown' : 'Minus'
              } size={16} />
              <span>{volumeTrend?.change}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {currentData?.length > 0 ? currentData?.[currentData?.length - 1]?.review_volume?.toLocaleString() : 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">Monthly Reviews</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} color="var(--color-warning)" />
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedTimeframe === '3months' ? '3M' : selectedTimeframe === '6months' ? '6M' : '12M'} Period
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {currentData?.length}
          </div>
          <div className="text-sm text-muted-foreground">Data Points</div>
        </div>
      </div>
      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {metricOptions?.find(m => m?.value === selectedMetric)?.label} Trend
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={comparisonMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
              iconName="GitCompare"
              iconPosition="left"
            >
              Compare
            </Button>
          </div>
        </div>

        <div className="w-full">
          {renderChart()}
        </div>
      </div>
      {/* Insights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Historical Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-sentiment-positive rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Peak Performance Period</p>
                <p className="text-xs text-muted-foreground">
                  {currentData?.length > 0 && 
                    currentData?.reduce((max, item) => item?.sentiment_score > max?.sentiment_score ? item : max)?.period
                  } showed highest sentiment score
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Review Volume Growth</p>
                <p className="text-xs text-muted-foreground">
                  {volumeTrend?.trend === 'up' ? 'Increasing' : volumeTrend?.trend === 'down' ? 'Decreasing' : 'Stable'} trend in customer engagement
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Seasonal Patterns</p>
                <p className="text-xs text-muted-foreground">
                  Notable variations during promotional periods and festivals
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-sentiment-negative rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Areas for Improvement</p>
                <p className="text-xs text-muted-foreground">
                  Focus on maintaining consistency during low-sentiment periods
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAnalysis;