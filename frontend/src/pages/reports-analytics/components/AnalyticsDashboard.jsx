import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalyticsDashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('sentiment_trend');
  const [timeframe, setTimeframe] = useState('30d');

  // Mock analytics data
  const sentimentTrendData = [
    { date: '2025-08-01', positive: 65, negative: 20, neutral: 15 },
    { date: '2025-08-05', positive: 68, negative: 18, neutral: 14 },
    { date: '2025-08-10', positive: 72, negative: 16, neutral: 12 },
    { date: '2025-08-15', positive: 70, negative: 19, neutral: 11 },
    { date: '2025-08-18', positive: 74, negative: 15, neutral: 11 }
  ];

  const productPerformanceData = [
    { product: 'iPhone 14 Pro', score: 4.2, reviews: 1250, sentiment: 78 },
    { product: 'Samsung Galaxy S24', score: 4.0, reviews: 980, sentiment: 72 },
    { product: 'OnePlus 12', score: 4.1, reviews: 756, sentiment: 75 },
    { product: 'Xiaomi 14', score: 3.8, reviews: 642, sentiment: 68 },
    { product: 'Google Pixel 8', score: 4.3, reviews: 534, sentiment: 80 }
  ];

  const categoryDistribution = [
    { name: 'Electronics', value: 35, color: '#e40046' },
    { name: 'Fashion', value: 25, color: '#e06a6e' },
    { name: 'Home & Kitchen', value: 20, color: '#ffc315' },
    { name: 'Books', value: 12, color: '#10b981' },
    { name: 'Sports', value: 8, color: '#6b7280' }
  ];

  const reviewVolumeData = [
    { month: 'Feb', volume: 12500 },
    { month: 'Mar', volume: 15200 },
    { month: 'Apr', volume: 18900 },
    { month: 'May', volume: 22100 },
    { month: 'Jun', volume: 19800 },
    { month: 'Jul', volume: 24500 },
    { month: 'Aug', volume: 26800 }
  ];

  const keyMetrics = [
    {
      title: 'Total Reviews Analyzed',
      value: '2,45,678',
      change: '+12.5%',
      trend: 'up',
      icon: 'MessageSquare'
    },
    {
      title: 'Average Sentiment Score',
      value: '72.4%',
      change: '+3.2%',
      trend: 'up',
      icon: 'TrendingUp'
    },
    {
      title: 'Products Monitored',
      value: '1,234',
      change: '+8.7%',
      trend: 'up',
      icon: 'Package'
    },
    {
      title: 'Negative Alerts',
      value: '23',
      change: '-15.3%',
      trend: 'down',
      icon: 'AlertTriangle'
    }
  ];

  const renderChart = () => {
    switch (selectedMetric) {
      case 'sentiment_trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'product_performance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="product" type="category" stroke="#6b7280" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="sentiment" fill="#e40046" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'category_distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {categoryDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'review_volume':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reviewVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="volume" stroke="#e40046" strokeWidth={3} dot={{ fill: '#e40046', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics?.map((metric, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={metric?.icon} size={16} color="var(--color-primary)" />
              </div>
              <div className={`flex items-center space-x-1 text-xs ${
                metric?.trend === 'up' ? 'text-sentiment-positive' : 'text-sentiment-negative'
              }`}>
                <Icon name={metric?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={12} />
                <span>{metric?.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{metric?.value}</div>
            <div className="text-sm text-muted-foreground">{metric?.title}</div>
          </div>
        ))}
      </div>
      {/* Chart Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-0">Analytics Overview</h3>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {[
                { key: 'sentiment_trend', label: 'Sentiment' },
                { key: 'product_performance', label: 'Products' },
                { key: 'category_distribution', label: 'Categories' },
                { key: 'review_volume', label: 'Volume' }
              ]?.map((tab) => (
                <Button
                  key={tab?.key}
                  variant={selectedMetric === tab?.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric(tab?.key)}
                  className="rounded-none border-0"
                >
                  {tab?.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-80">
          {renderChart()}
        </div>
      </div>
      {/* Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-sentiment-positive rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={16} color="var(--color-sentiment-positive)" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-sentiment-positive rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Positive sentiment increased by 8% this month</p>
                <p className="text-xs text-muted-foreground">Electronics category showing strongest growth</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Review volume peaked during sale periods</p>
                <p className="text-xs text-muted-foreground">26% increase during promotional events</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-sentiment-negative rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Delivery complaints increased by 3%</p>
                <p className="text-xs text-muted-foreground">Focus area for customer satisfaction improvement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={16} color="var(--color-primary)" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-sentiment-positive/10 rounded-lg">
              <p className="text-sm font-medium text-foreground">Leverage positive electronics sentiment</p>
              <p className="text-xs text-muted-foreground mt-1">Consider expanding electronics inventory during high sentiment periods</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <p className="text-sm font-medium text-foreground">Address delivery concerns</p>
              <p className="text-xs text-muted-foreground mt-1">Implement proactive communication for shipping updates</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-foreground">Optimize review collection</p>
              <p className="text-xs text-muted-foreground mt-1">Focus on post-purchase engagement to increase review volume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;