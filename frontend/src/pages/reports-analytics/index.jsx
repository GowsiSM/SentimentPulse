// src/pages/reports-analytics/index.jsx
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ReportsAnalytics = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMetric, setSelectedMetric] = useState('sentiment_trend');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  
  // Get analysis data from navigation state
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisStats, setAnalysisStats] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    if (location.state) {
      setAnalysisData(location.state.analysisData);
      setAnalysisStats(location.state.analysisStats);
      setProductInfo(location.state.productInfo);
      console.log('📊 Received analysis data:', location.state);
    }
  }, [location.state]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'export', label: 'Export', icon: 'Download' }
  ];

  // Use actual data from analysis or fallback to mock data
  const keyMetrics = analysisStats ? [
    { 
      title: 'Total Reviews', 
      value: analysisStats.total_reviews?.toString() || '0', 
      change: '+0%', 
      trend: 'up', 
      color: '#e40046' 
    },
    { 
      title: 'Sentiment Score', 
      value: `${analysisStats.positive_percentage || 0}%`, 
      change: '+0%', 
      trend: 'up', 
      color: '#e40046' 
    },
    { 
      title: 'Positive Reviews', 
      value: `${analysisStats.positive_percentage || 0}%`, 
      change: '+0%', 
      trend: 'up', 
      color: '#e40046' 
    },
    { 
      title: 'Negative Reviews', 
      value: `${analysisStats.negative_percentage || 0}%`, 
      change: '+0%', 
      trend: analysisStats.negative_percentage > 20 ? 'up' : 'down', 
      color: analysisStats.negative_percentage > 20 ? '#e06a6e' : '#e40046' 
    }
  ] : [
    { title: 'Total Reviews', value: '0', change: '+0%', trend: 'up', color: '#e40046' },
    { title: 'Sentiment Score', value: '0%', change: '+0%', trend: 'up', color: '#e40046' },
    { title: 'Positive Reviews', value: '0%', change: '+0%', trend: 'up', color: '#e40046' },
    { title: 'Negative Reviews', value: '0%', change: '+0%', trend: 'down', color: '#e06a6e' }
  ];

  // Generate sentiment trend data from analysis
  const sentimentTrendData = analysisData?.sentiment_analysis?.analyzed_reviews ? 
    analysisData.sentiment_analysis.analyzed_reviews.slice(0, 5).map((review, index) => ({
      date: `Review ${index + 1}`,
      positive: review.sentiment?.sentiment === 'positive' ? 100 : 0,
      negative: review.sentiment?.sentiment === 'negative' ? 100 : 0,
      neutral: review.sentiment?.sentiment === 'neutral' ? 100 : 0,
      confidence: review.sentiment?.confidence || 0
    })) : [
      { date: 'Review 1', positive: 65, negative: 20, neutral: 15 },
      { date: 'Review 2', positive: 68, negative: 18, neutral: 14 },
      { date: 'Review 3', positive: 72, negative: 16, neutral: 12 }
    ];

  // Sentiment distribution for pie chart
  const sentimentDistribution = analysisStats ? [
    { name: 'Positive', value: analysisStats.positive_percentage || 0, color: '#10b981' },
    { name: 'Negative', value: analysisStats.negative_percentage || 0, color: '#ef4444' },
    { name: 'Neutral', value: analysisStats.neutral_percentage || 0, color: '#6b7280' }
  ] : [
    { name: 'Positive', value: 35, color: '#10b981' },
    { name: 'Negative', value: 25, color: '#ef4444' },
    { name: 'Neutral', value: 40, color: '#6b7280' }
  ];

  // Generate insights from actual analysis
  const generateInsights = () => {
    if (!analysisStats) return [];
    
    const insights = [];
    const positivePercent = analysisStats.positive_percentage || 0;
    const negativePercent = analysisStats.negative_percentage || 0;
    const neutralPercent = analysisStats.neutral_percentage || 0;
    
    if (positivePercent > 70) {
      insights.push({
        text: `Strong positive sentiment (${positivePercent}%)`,
        type: 'positive',
        detail: 'Customers are very satisfied with this product'
      });
    } else if (negativePercent > 30) {
      insights.push({
        text: `Significant negative feedback (${negativePercent}%)`,
        type: 'negative', 
        detail: 'Consider addressing customer concerns'
      });
    } else if (neutralPercent > 50) {
      insights.push({
        text: 'Mostly neutral opinions',
        type: 'neutral',
        detail: 'Customers have mixed or moderate feedback'
      });
    } else {
      insights.push({
        text: 'Balanced customer opinions',
        type: 'neutral',
        detail: 'Product has diverse feedback across sentiments'
      });
    }
    
    if (analysisStats.total_reviews > 0) {
      insights.push({
        text: `Based on ${analysisStats.total_reviews} reviews`,
        type: 'info',
        detail: 'Comprehensive analysis completed'
      });
    }

    // Add sentiment score insight
    if (analysisStats.sentiment_score !== undefined) {
      const score = analysisStats.sentiment_score;
      if (score > 70) {
        insights.push({
          text: `High sentiment score: ${score}%`,
          type: 'positive',
          detail: 'Excellent customer satisfaction'
        });
      } else if (score < 40) {
        insights.push({
          text: `Low sentiment score: ${score}%`,
          type: 'negative',
          detail: 'Need to improve customer experience'
        });
      }
    }
    
    return insights;
  };

  const insights = generateInsights();

  // Generate recommendations based on analysis
  const generateRecommendations = () => {
    if (!analysisStats) return [];
    
    const recommendations = [];
    const positivePercent = analysisStats.positive_percentage || 0;
    const negativePercent = analysisStats.negative_percentage || 0;
    
    if (positivePercent > 70) {
      recommendations.push({
        text: 'Leverage positive reviews for marketing',
        detail: 'Use customer testimonials to boost sales'
      });
      recommendations.push({
        text: 'Maintain product quality standards',
        detail: 'Continue delivering excellent customer experience'
      });
    } else if (negativePercent > 30) {
      recommendations.push({
        text: 'Address negative feedback promptly',
        detail: 'Identify and resolve common customer complaints'
      });
      recommendations.push({
        text: 'Improve product quality or features',
        detail: 'Consider customer suggestions for enhancements'
      });
    } else {
      recommendations.push({
        text: 'Focus on customer engagement',
        detail: 'Encourage more detailed reviews from customers'
      });
      recommendations.push({
        text: 'Monitor sentiment trends regularly',
        detail: 'Track changes in customer perception over time'
      });
    }

    recommendations.push({
      text: 'Continue sentiment monitoring',
      detail: 'Regular analysis helps maintain product quality'
    });
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  const renderChart = () => {
    switch (selectedMetric) {
      case 'sentiment_trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
              <XAxis dataKey="date" stroke="#5a5a59" fontSize={12} />
              <YAxis stroke="#5a5a59" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'sentiment_distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {sentimentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'review_confidence':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
              <XAxis dataKey="date" stroke="#5a5a59" fontSize={12} />
              <YAxis stroke="#5a5a59" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
              <Bar dataKey="confidence" fill="#87ceeb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
              <XAxis dataKey="date" stroke="#5a5a59" fontSize={12} />
              <YAxis stroke="#5a5a59" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Product Info Banner */}
      {productInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            {productInfo.imageUrl && (
              <img 
                src={productInfo.imageUrl} 
                alt={productInfo.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black">{productInfo.title}</h3>
              <p className="text-gray-600 text-sm">
                {productInfo.price && `Price: ₹${productInfo.price}`} 
                {productInfo.category && ` • Category: ${productInfo.category}`}
              </p>
              {analysisData?.analysis_timestamp && (
                <p className="text-gray-500 text-xs mt-1">
                  Analyzed: {new Date(analysisData.analysis_timestamp).toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                analysisStats?.overall_sentiment === 'positive' ? 'text-green-600' :
                analysisStats?.overall_sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analysisStats?.overall_sentiment?.toUpperCase() || 'NEUTRAL'}
              </div>
              <div className="text-sm text-gray-500">Overall Sentiment</div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics - Now shows actual analysis data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}1a` }}>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: metric.color }}></div>
              </div>
              <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                <span>{metric.trend === 'up' ? '↗' : '↘'}</span>
                <span className="ml-1">{metric.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.title}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-black mb-4 sm:mb-0">
            {productInfo ? `${productInfo.title} - Sentiment Analysis` : 'Analytics Overview'}
          </h3>
          
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            {[
              { key: 'sentiment_trend', label: 'Trend' },
              { key: 'sentiment_distribution', label: 'Distribution' },
              { key: 'review_confidence', label: 'Confidence' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={selectedMetric === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(tab.key)}
                className={`rounded-none border-0 ${selectedMetric === tab.key ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-700'}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          {renderChart()}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">Analysis Insights</h3>
          <div className="space-y-4">
            {insights.length > 0 ? insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  insight.type === 'positive' ? 'bg-green-500' :
                  insight.type === 'negative' ? 'bg-red-500' :
                  insight.type === 'neutral' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-black">{insight.text}</p>
                  <p className="text-xs text-gray-600">{insight.detail}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                No analysis data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.length > 0 ? recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm font-medium text-black">{rec.text}</p>
                <p className="text-xs text-gray-600 mt-1">{rec.detail}</p>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                No recommendations available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw Reviews Preview */}
      {analysisData?.reviews && analysisData.reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-black mb-4">Sample Reviews</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {analysisData.reviews.slice(0, 5).map((review, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {review.reviewer || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {review.date || 'Unknown date'}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{review.text}</p>
                {review.rating && (
                  <div className="mt-2 text-xs text-gray-600">
                    Rating: {review.rating}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ReportsView = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-6">Generate Custom Report</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Report Template</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="">Choose a template</option>
              <option value="executive">Executive Summary</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="competitive">Competitive Report</option>
              <option value="trend">Trend Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Date Range</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Categories</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Kitchen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Output Format</label>
            <select 
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Workbook</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="default"
          onClick={() => {
            setIsExporting(true);
            setTimeout(() => {
              setIsExporting(false);
              alert(`Report exported as ${selectedFormat.toUpperCase()}`);
            }, 2000);
          }}
          disabled={isExporting}
          loading={isExporting}
          iconName="FileText"
          iconPosition="left"
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
        >
          {isExporting ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </div>
  );

  const ExportView = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-6">Export Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Export Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="analytics">Analytics Data</option>
              <option value="reviews">Raw Reviews</option>
              <option value="sentiment">Sentiment Scores</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">Format</label>
            <select 
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="default"
              size="default"
              onClick={() => {
                setIsExporting(true);
                setTimeout(() => {
                  setIsExporting(false);
                  alert(`Data exported as ${selectedFormat.toUpperCase()}`);
                }, 2000);
              }}
              disabled={isExporting}
              loading={isExporting}
              iconName="Download"
              iconPosition="left"
              fullWidth
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-white border-b border-gray-200 shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Icon name="BarChart3" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  {productInfo ? `${productInfo.title} - Analysis` : 'Reports & Analytics'}
                </h1>
                <p className="text-gray-600">
                  {productInfo ? 'Product sentiment analysis results' : 'Comprehensive sentiment analysis and business insights'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="default"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'export' && <ExportView />}
      </div>
    </div>
  );
};

export default ReportsAnalytics;