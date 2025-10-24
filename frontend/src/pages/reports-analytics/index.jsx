// src/pages/reports-analytics/index.jsx
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ReportsAnalytics = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMetric, setSelectedMetric] = useState('sentiment_trend');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [reportTemplate, setReportTemplate] = useState('executive');
  const [dateRange, setDateRange] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [exportType, setExportType] = useState('analytics');
  
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisStats, setAnalysisStats] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  const processAnalysisData = (rawData) => {
    if (!rawData) {
      return {
        total_reviews: 0,
        sentiment_score: 0,
        positive_percentage: 0,
        negative_percentage: 0,
        neutral_percentage: 0,
        overall_sentiment: 'neutral',
        positive_reviews: 0,
        negative_reviews: 0,
        neutral_reviews: 0
      };
    }
    
    let summary = null;
    
    if (rawData.sentiment_analysis?.summary) {
      summary = rawData.sentiment_analysis.summary;
    } else if (rawData.total_reviews !== undefined) {
      summary = rawData;
    } else if (rawData.analysisStats) {
      summary = rawData.analysisStats;
    } else if (rawData.analysis_data?.sentiment_analysis?.summary) {
      summary = rawData.analysis_data.sentiment_analysis.summary;
    } else if (rawData.sentiment_analysis?.analyzed_reviews) {
      const reviews = rawData.sentiment_analysis.analyzed_reviews;
      const total = reviews.length;
      const positive = reviews.filter(r => r.sentiment_analysis?.sentiment === 'positive').length;
      const negative = reviews.filter(r => r.sentiment_analysis?.sentiment === 'negative').length;
      const neutral = reviews.filter(r => r.sentiment_analysis?.sentiment === 'neutral').length;
      
      summary = {
        total_reviews: total,
        positive_reviews: positive,
        negative_reviews: negative,
        neutral_reviews: neutral,
        positive_percentage: total > 0 ? Math.round((positive / total) * 100) : 0,
        negative_percentage: total > 0 ? Math.round((negative / total) * 100) : 0,
        neutral_percentage: total > 0 ? Math.round((neutral / total) * 100) : 0,
        sentiment_score: total > 0 ? Math.round((positive / total) * 100) : 0,
        overall_sentiment: positive > negative && positive > neutral ? 'positive' : 
                         negative > positive && negative > neutral ? 'negative' : 'neutral'
      };
    }
    
    if (summary) {
      return {
        total_reviews: summary.total_reviews || 0,
        sentiment_score: summary.sentiment_score || 0,
        positive_percentage: summary.positive_percentage || 0,
        negative_percentage: summary.negative_percentage || 0,
        neutral_percentage: summary.neutral_percentage || 0,
        overall_sentiment: summary.overall_sentiment || 'neutral',
        positive_reviews: summary.positive_reviews || 0,
        negative_reviews: summary.negative_reviews || 0,
        neutral_reviews: summary.neutral_reviews || 0
      };
    }
    
    return {
      total_reviews: 0,
      sentiment_score: 0,
      positive_percentage: 0,
      negative_percentage: 0,
      neutral_percentage: 0,
      overall_sentiment: 'neutral',
      positive_reviews: 0,
      negative_reviews: 0,
      neutral_reviews: 0
    };
  };

  useEffect(() => {
    if (location.state) {
      let processedData = location.state.analysisData;
      let processedProductInfo = location.state.productInfo;
      
      // Handle bulk analysis data
      if (Array.isArray(location.state.analysisData)) {
        // Combine stats from all products
        const combinedStats = location.state.analysisData.reduce((acc, result) => {
          const stats = result.sentiment_analysis?.summary || {};
          return {
            total_reviews: (acc.total_reviews || 0) + (stats.total_reviews || 0),
            positive_reviews: (acc.positive_reviews || 0) + (stats.positive_reviews || 0),
            negative_reviews: (acc.negative_reviews || 0) + (stats.negative_reviews || 0),
            neutral_reviews: (acc.neutral_reviews || 0) + (stats.neutral_reviews || 0),
            sentiment_scores: [...(acc.sentiment_scores || []), stats.sentiment_score || 0],
          };
        }, {});
        
        // Calculate aggregated percentages
        const totalReviews = combinedStats.total_reviews || 0;
        processedData = {
          sentiment_analysis: {
            summary: {
              total_reviews: totalReviews,
              positive_reviews: combinedStats.positive_reviews,
              negative_reviews: combinedStats.negative_reviews,
              neutral_reviews: combinedStats.neutral_reviews,
              positive_percentage: totalReviews > 0 ? Math.round((combinedStats.positive_reviews / totalReviews) * 100) : 0,
              negative_percentage: totalReviews > 0 ? Math.round((combinedStats.negative_reviews / totalReviews) * 100) : 0,
              neutral_percentage: totalReviews > 0 ? Math.round((combinedStats.neutral_reviews / totalReviews) * 100) : 0,
              sentiment_score: combinedStats.sentiment_scores.length > 0 
                ? Math.round(combinedStats.sentiment_scores.reduce((a, b) => a + b, 0) / combinedStats.sentiment_scores.length)
                : 0,
            },
            analyzed_reviews: location.state.analysisData.flatMap(result => 
              result.sentiment_analysis?.analyzed_reviews || []
            )
          }
        };
        
        // Create combined product info
        processedProductInfo = {
          title: `Bulk Analysis (${location.state.analysisData.length} Products)`,
          total_products: location.state.analysisData.length,
          mode: 'bulk'
        };
      }
      
      setAnalysisData(processedData);
      setProductInfo(processedProductInfo);
      
      const processedStats = processAnalysisData(
        processedData || 
        location.state.analysisStats || 
        location.state
      );
      setAnalysisStats(processedStats);
    } else {
      setAnalysisStats({
        total_reviews: 0,
        sentiment_score: 0,
        positive_percentage: 0,
        negative_percentage: 0,
        neutral_percentage: 0,
        overall_sentiment: 'neutral',
        positive_reviews: 0,
        negative_reviews: 0,
        neutral_reviews: 0
      });
    }
  }, [location.state]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'export', label: 'Export', icon: 'Download' }
  ];

const keyMetrics = analysisStats ? [
    { 
      title: 'Total Reviews', 
      value: analysisStats.total_reviews?.toString() || '0', 
      change: analysisStats.total_reviews > 0 ? '+5%' : '+0%', 
      trend: 'up', 
      color: '#e40046' 
    },
    { 
      title: 'Sentiment Score', 
      value: `${analysisStats.sentiment_score || 0}%`, 
      change: (analysisStats.sentiment_score || 0) > 50 ? '+5%' : '-2%', 
      trend: (analysisStats.sentiment_score || 0) > 50 ? 'up' : 'down', 
      color: (analysisStats.sentiment_score || 0) > 70 ? '#6ee7b7' : (analysisStats.sentiment_score || 0) < 40 ? '#ef4444' : '#e40046'
    },
    { 
      title: 'Positive Reviews', 
      value: `${analysisStats.positive_percentage || 0}%`, 
      change: (analysisStats.positive_percentage || 0) > 50 ? '+3%' : '-1%', 
      trend: (analysisStats.positive_percentage || 0) > 50 ? 'up' : 'down', 
      color: '#6ee7b7'
    },
    { 
      title: 'Negative Reviews', 
      value: `${analysisStats.negative_percentage || 0}%`, 
      change: (analysisStats.negative_percentage || 0) > 30 ? '+4%' : '-2%', 
      trend: (analysisStats.negative_percentage || 0) > 30 ? 'up' : 'down', 
      color: (analysisStats.negative_percentage || 0) > 30 ? '#fca5a5' : '#ef4444'
    }
  ] : [];

  const sentimentTrendData = analysisData?.sentiment_analysis?.analyzed_reviews ? 
  analysisData.sentiment_analysis.analyzed_reviews.map((review, index) => {
    const sentiment = review.sentiment_analysis?.sentiment || 'neutral';
    return {
      date: `R${index + 1}`,
      positive: sentiment === 'positive' ? 1 : 0,
      negative: sentiment === 'negative' ? 1 : 0,
      neutral: sentiment === 'neutral' ? 1 : 0,
      reviewText: review.text?.substring(0, 50) + '...'
    };
  }) : [];

  const sentimentDistribution = analysisStats ? [
    { name: 'Positive', value: analysisStats.positive_percentage || 0, color: '#6ee7b7' },
    { name: 'Negative', value: analysisStats.negative_percentage || 0, color: '#fca5a5' },
    { name: 'Neutral', value: analysisStats.neutral_percentage || 0, color: '#d1d5db' }
  ] : [];

  const generateInsights = () => {
    if (!analysisStats) return [];
    
    const insights = [];
    const positivePercent = analysisStats.positive_percentage || 0;
    const negativePercent = analysisStats.negative_percentage || 0;
    const neutralPercent = analysisStats.neutral_percentage || 0;
    const totalReviews = analysisStats.total_reviews || 0;
    
    if (totalReviews === 0) {
      insights.push({
        text: 'No reviews available for analysis',
        type: 'info',
        detail: 'Please scrape reviews first'
      });
      return insights;
    }
    
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
    
    if (totalReviews > 0) {
      insights.push({
        text: `Based on ${totalReviews} reviews`,
        type: 'info',
        detail: 'Comprehensive analysis completed'
      });
    }

    const sentimentScore = analysisStats.sentiment_score || 0;
    if (sentimentScore > 70) {
      insights.push({
        text: `High sentiment score: ${sentimentScore}%`,
        type: 'positive',
        detail: 'Excellent customer satisfaction'
      });
    } else if (sentimentScore < 40) {
      insights.push({
        text: `Low sentiment score: ${sentimentScore}%`,
        type: 'negative',
        detail: 'Need to improve customer experience'
      });
    }
    
    return insights;
  };

  const insights = generateInsights();

  const generateRecommendations = () => {
    if (!analysisStats) return [];
    
    const recommendations = [];
    const positivePercent = analysisStats.positive_percentage || 0;
    const negativePercent = analysisStats.negative_percentage || 0;
    const totalReviews = analysisStats.total_reviews || 0;
    
    if (totalReviews === 0) {
      recommendations.push({
        text: 'Scrape more product reviews',
        detail: 'No reviews available for analysis'
      });
      return recommendations;
    }
    
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

  const generateReport = () => {
    if (!analysisData || !analysisStats) {
      alert('No analysis data available. Please analyze a product first.');
      return;
    }

    setIsExporting(true);

    setTimeout(() => {
      if (selectedFormat === 'pdf') {
        const content = `SENTIMENT ANALYSIS REPORT
${productInfo?.title || 'Product Analysis'}
Generated: ${new Date().toLocaleString()}

SUMMARY:
- Total Reviews: ${analysisStats.total_reviews}
- Sentiment Score: ${analysisStats.sentiment_score}%
- Overall Sentiment: ${analysisStats.overall_sentiment}
- Positive: ${analysisStats.positive_percentage}%
- Negative: ${analysisStats.negative_percentage}%
- Neutral: ${analysisStats.neutral_percentage}%

INSIGHTS:
${insights.map(i => `• ${i.text}: ${i.detail}`).join('\n')}

RECOMMENDATIONS:
${recommendations.map(r => `• ${r.text}: ${r.detail}`).join('\n')}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentiment-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const csvContent = [
          ['Metric', 'Value'],
          ['Total Reviews', analysisStats.total_reviews],
          ['Sentiment Score', `${analysisStats.sentiment_score}%`],
          ['Overall Sentiment', analysisStats.overall_sentiment],
          ['Positive Reviews', `${analysisStats.positive_percentage}%`],
          ['Negative Reviews', `${analysisStats.negative_percentage}%`],
          ['Neutral Reviews', `${analysisStats.neutral_percentage}%`],
          [''],
          ['Insights', ''],
          ...insights.map(i => [i.text, i.detail]),
          [''],
          ['Recommendations', ''],
          ...recommendations.map(r => [r.text, r.detail])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentiment-report-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setIsExporting(false);
      alert(`Report generated successfully as ${selectedFormat.toUpperCase()}`);
    }, 1500);
  };

  const exportData = () => {
    if (!analysisData || !analysisStats) {
      alert('No data available to export. Please analyze a product first.');
      return;
    }

    setIsExporting(true);

    setTimeout(() => {
      let dataToExport;
      
      if (exportType === 'analytics') {
        dataToExport = {
          productInfo: productInfo,
          stats: analysisStats,
          insights: insights,
          recommendations: recommendations,
          exportedAt: new Date().toISOString()
        };
      } else if (exportType === 'reviews') {
        dataToExport = {
          productInfo: productInfo,
          reviews: analysisData.reviews || [],
          totalReviews: analysisStats.total_reviews,
          exportedAt: new Date().toISOString()
        };
      } else if (exportType === 'sentiment') {
        dataToExport = {
          productInfo: productInfo,
          sentimentScores: {
            overall: analysisStats.sentiment_score,
            positive: analysisStats.positive_percentage,
            negative: analysisStats.negative_percentage,
            neutral: analysisStats.neutral_percentage,
            sentiment: analysisStats.overall_sentiment
          },
          distribution: sentimentDistribution,
          exportedAt: new Date().toISOString()
        };
      }

      if (selectedFormat === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        let csvContent = '';
        
        if (exportType === 'analytics') {
          csvContent = [
            ['Metric', 'Value'],
            ['Product', productInfo?.title || 'N/A'],
            ['Total Reviews', analysisStats.total_reviews],
            ['Sentiment Score', analysisStats.sentiment_score],
            ['Positive %', analysisStats.positive_percentage],
            ['Negative %', analysisStats.negative_percentage],
            ['Neutral %', analysisStats.neutral_percentage],
            ['Overall Sentiment', analysisStats.overall_sentiment]
          ].map(row => row.join(',')).join('\n');
        } else if (exportType === 'reviews') {
          const reviews = analysisData.reviews || [];
          csvContent = [
            ['Reviewer', 'Date', 'Rating', 'Review Text'],
            ...reviews.map(r => [
              r.reviewer || 'Anonymous',
              r.date || 'N/A',
              r.rating || 'N/A',
              `"${(r.text || '').replace(/"/g, '""')}"`
            ])
          ].map(row => row.join(',')).join('\n');
        } else if (exportType === 'sentiment') {
          csvContent = [
            ['Sentiment Type', 'Percentage'],
            ['Positive', analysisStats.positive_percentage],
            ['Negative', analysisStats.negative_percentage],
            ['Neutral', analysisStats.neutral_percentage],
            [''],
            ['Overall Score', analysisStats.sentiment_score],
            ['Overall Sentiment', analysisStats.overall_sentiment]
          ].map(row => row.join(',')).join('\n');
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setIsExporting(false);
      alert(`Data exported successfully as ${selectedFormat.toUpperCase()}`);
    }, 1500);
  };

  // const renderChart = () => {
  //   switch (selectedMetric) {
  //     case 'sentiment_trend':
  //       return (
  //         <ResponsiveContainer width="100%" height={300}>
  //           <AreaChart 
  //             data={sentimentTrendData}
  //             margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
  //           >
  //             <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
  //             <XAxis 
  //               dataKey="date" 
  //               stroke="#5a5a59" 
  //               fontSize={12}
  //               tickFormatter={(value) => value.replace('Review ', '')}
  //             />
  //             <YAxis 
  //               stroke="#5a5a59" 
  //               fontSize={12}
  //               domain={[0, 100]}
  //               tickFormatter={(value) => `${value}%`}
  //             />
  //             <Tooltip 
  //               contentStyle={{ 
  //                 backgroundColor: '#ffffff', 
  //                 border: '1px solid #0000001a', 
  //                 borderRadius: '8px',
  //                 padding: '8px'
  //               }}
  //               formatter={(value, name) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
  //             />
  //             <Area 
  //               type="monotone" 
  //               dataKey="positive" 
  //               name="Positive"
  //               stroke="#10b981" 
  //               fill="#10b981" 
  //               fillOpacity={0.4}
  //               strokeWidth={2}
  //             />
  //             <Area 
  //               type="monotone" 
  //               dataKey="neutral" 
  //               name="Neutral"
  //               stroke="#6b7280" 
  //               fill="#6b7280" 
  //               fillOpacity={0.4}
  //               strokeWidth={2}
  //             />
  //             <Area 
  //               type="monotone" 
  //               dataKey="negative" 
  //               name="Negative"
  //               stroke="#ef4444" 
  //               fill="#ef4444" 
  //               fillOpacity={0.4}
  //               strokeWidth={2}
  //             />
  //           </AreaChart>
  //         </ResponsiveContainer>
  //       );
      
  //     case 'sentiment_distribution':
  //       return (
  //         <ResponsiveContainer width="100%" height={300}>
  //           <PieChart>
  //             <Pie
  //               data={sentimentDistribution}
  //               cx="50%"
  //               cy="50%"
  //               outerRadius={100}
  //               dataKey="value"
  //               label={({ name, value }) => `${name}: ${value}%`}
  //             >
  //               {sentimentDistribution.map((entry, index) => (
  //                 <Cell key={`cell-${index}`} fill={entry.color} />
  //               ))}
  //             </Pie>
  //             <Tooltip />
  //           </PieChart>
  //         </ResponsiveContainer>
  //       );
      

      
  //     default:
  //       return (
  //         <ResponsiveContainer width="100%" height={300}>
  //           <AreaChart data={sentimentTrendData}>
  //             <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
  //             <XAxis dataKey="date" stroke="#5a5a59" fontSize={12} />
  //             <YAxis stroke="#5a5a59" fontSize={12} />
  //             <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #0000001a', borderRadius: '8px' }} />
  //             <Area type="monotone" dataKey="positive" stackId="1" stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.6} />
  //             <Area type="monotone" dataKey="neutral" stackId="1" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.6} />
  //             <Area type="monotone" dataKey="negative" stackId="1" stroke="#fca5a5" fill="#fca5a5" fillOpacity={0.6} />
  //           </AreaChart>
  //         </ResponsiveContainer>
  //       );
  //   }
  // };

  const renderChart = () => {
  switch (selectedMetric) {
    case 'sentiment_trend':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart 
            data={sentimentTrendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              label={{ value: 'Sentiment', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => {
                const labels = { positive: 'Positive', negative: 'Negative', neutral: 'Neutral' };
                return [value === 1 ? '✓' : '', labels[name]];
              }}
            />
            <Area 
              type="stepAfter" 
              dataKey="positive" 
              stackId="1" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.7}
            />
            <Area 
              type="stepAfter" 
              dataKey="neutral" 
              stackId="1" 
              stroke="#6b7280" 
              fill="#6b7280" 
              fillOpacity={0.7}
            />
            <Area 
              type="stepAfter" 
              dataKey="negative" 
              stackId="1" 
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.7}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    
    case 'sentiment_distribution':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={sentimentDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              dataKey="value"
              label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 30;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill="#374151" 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central"
                    className="font-semibold"
                  >
                    {`${name}: ${value}%`}
                  </text>
                );
              }}
            >
              {sentimentDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                padding: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    
    default:
      return null;
  }
};

  const DashboardView = () => (
    <div className="space-y-6">
      {/* {productInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black">{productInfo.title}</h3>
              {!productInfo.mode && (
                <p className="text-gray-600 text-sm">
                  {productInfo.price && `Price: ₹${productInfo.price}`} 
                  {productInfo.category && ` • Category: ${productInfo.category}`}
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
          
          {location.state?.analysisData && Array.isArray(location.state.analysisData) && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Analyzed Products:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {location.state.analysisData.map((product, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{
                        backgroundColor: product.sentiment_analysis?.summary.positive_percentage > 60 ? '#10b981' :
                                       product.sentiment_analysis?.summary.negative_percentage > 40 ? '#ef4444' : '#6b7280'
                      }}></div>
                      <span className="text-sm text-gray-800 font-medium truncate">
                        {(product.title || product.name || `Product ${index + 1}`).substring(0, 50)}
                        {(product.title || product.name || '').length > 50 ? '...' : ''}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 pl-4">
                      Reviews: {product.sentiment_analysis?.summary.total_reviews || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisData?.analysis_timestamp && (
            <div className="mt-4 text-gray-500 text-xs">
              Analyzed: {new Date(analysisData.analysis_timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )} */}
      {productInfo && (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-black mb-2">{productInfo.title}</h3>
        {!productInfo.mode && (
          <div className="space-y-1 text-sm text-gray-600">
            {productInfo.price && <p>Price: ₹{productInfo.price}</p>}
            {productInfo.category && <p>Category: {productInfo.category}</p>}
            {productInfo.link && (
              <p className="flex items-center gap-2">
                <a 
                  href={productInfo.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-md"
                >
                  {productInfo.link}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      <div className="text-right ml-4">
        <div className={`text-xl font-bold px-4 py-2 rounded-lg ${
          analysisStats?.overall_sentiment === 'positive' ? 'bg-green-100 text-green-700' :
          analysisStats?.overall_sentiment === 'negative' ? 'bg-red-100 text-red-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {analysisStats?.overall_sentiment?.toUpperCase() || 'NEUTRAL'}
        </div>
        <div className="text-xs text-gray-500 mt-1">Overall Sentiment</div>
      </div>
    </div>
    
    {location.state?.analysisData && Array.isArray(location.state.analysisData) && (
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          Analyzed Products ({location.state.analysisData.length})
        </h4>
        <div className="grid grid-cols-1 gap-4">
          {location.state.analysisData.map((product, index) => {
            const sentiment = product.sentiment_analysis?.summary;
            const isPositive = sentiment?.positive_percentage > 60;
            const isNegative = sentiment?.negative_percentage > 40;
            
            return (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
                        backgroundColor: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#6b7280'
                      }}></div>
                      <h5 className="text-sm font-semibold text-gray-900 truncate">
                        {product.title || product.name || `Product ${index + 1}`}
                      </h5>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                      {product.price && (
                        <span className="flex items-center gap-1">
                          ₹{product.price}
                        </span>
                      )}
                      {product.category && (
                        <span className="flex items-center gap-1">
                          {product.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {sentiment?.total_reviews || 0} reviews
                      </span>
                      <span className="flex items-center gap-1">
                        {sentiment?.sentiment_score || 0}% score
                      </span>
                    </div>
                    
                    {product.link && (
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate"
                      >
                        🔗 View Product
                      </a>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isPositive ? 'bg-green-100 text-green-700' :
                      isNegative ? 'bg-red-100 text-red-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {isPositive ? '😊 Positive' : isNegative ? '😞 Negative' : '😐 Neutral'}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-600 font-medium">👍 {sentiment?.positive_percentage || 0}%</span>
                      <span className="text-red-600 font-medium">👎 {sentiment?.negative_percentage || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {analysisData?.analysis_timestamp && (
      <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
        Analyzed: {new Date(analysisData.analysis_timestamp).toLocaleString()}
      </div>
    )}
  </div>
)}

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

      {/* <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">
              {productInfo ? `${productInfo.title} - Sentiment Analysis` : 'Analytics Overview'}
            </h3>
            <p className="text-sm text-gray-500">
              {analysisStats?.total_reviews 
                ? `Analysis based on ${analysisStats.total_reviews} reviews`
                : 'No reviews analyzed yet'}
            </p>
          </div>
          
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50 mt-4 sm:mt-0 shrink-0">
            {[
              { key: 'sentiment_trend', label: 'Trend Analysis', icon: 'TrendingUp' },
              { key: 'sentiment_distribution', label: 'Distribution', icon: 'PieChart' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={selectedMetric === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(tab.key)}
                className={`rounded-none border-0 flex items-center gap-2 ${
                  selectedMetric === tab.key 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="h-[400px]">
            {renderChart()}
          </div>
        </div>
      </div> */}
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold text-black mb-1">Sentiment Analysis</h3>
      <p className="text-sm text-gray-500">
        {analysisStats?.total_reviews 
          ? `Visualizing ${analysisStats.total_reviews} customer reviews`
          : 'No reviews analyzed yet'}
      </p>
    </div>
    
    <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50 mt-4 sm:mt-0">
      {[
        { key: 'sentiment_trend', label: 'Timeline', icon: 'TrendingUp' },
        { key: 'sentiment_distribution', label: 'Distribution', icon: 'PieChart' }
      ].map((tab) => (
        <Button
          key={tab.key}
          variant={selectedMetric === tab.key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedMetric(tab.key)}
          className={`rounded-none border-0 flex items-center gap-2 px-4 py-2 ${
            selectedMetric === tab.key 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon name={tab.icon} size={16} />
          <span className="font-medium">{tab.label}</span>
        </Button>
      ))}
    </div>
  </div>

  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-100">
    {renderChart()}
  </div>
</div>
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

      {analysisData?.sentiment_analysis?.analyzed_reviews && analysisData.sentiment_analysis.analyzed_reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">
              Customer Reviews ({analysisData.sentiment_analysis.analyzed_reviews.length} total)
            </h3>
            <span className="text-sm text-gray-500">Scroll to see more</span>
          </div>
          <div 
            className="space-y-4 max-h-[400px] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#E5E7EB transparent'
            }}
          >
            {analysisData.sentiment_analysis.analyzed_reviews.map((review, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-800">
                    {review.reviewer || 'Anonymous Customer'}
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {review.date || 'Unknown date'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">{review.text}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      review.sentiment_analysis?.sentiment === 'positive' 
                        ? 'bg-green-100 text-green-800' 
                        : review.sentiment_analysis?.sentiment === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {review.sentiment_analysis?.sentiment.toUpperCase() || 'NEUTRAL'}
                    </span>
                  </div>
                </div>
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
      
      {!analysisData || !analysisStats ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Icon name="AlertCircle" size={32} color="#9ca3af" />
          </div>
          <p className="text-gray-600 mb-2">No analysis data available</p>
          <p className="text-sm text-gray-500">Please analyze a product first to generate reports</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Report Template</label>
                <select 
                  value={reportTemplate}
                  onChange={(e) => setReportTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="executive">Executive Summary</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="competitive">Competitive Report</option>
                  <option value="trend">Trend Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Date Range</label>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
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
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Categories</option>
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

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-black mb-3">Report Preview</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Product:</span> {productInfo?.title || 'N/A'}</p>
              <p><span className="font-medium">Template:</span> {reportTemplate.charAt(0).toUpperCase() + reportTemplate.slice(1)}</p>
              <p><span className="font-medium">Date Range:</span> {dateRange}</p>
              <p><span className="font-medium">Format:</span> {selectedFormat.toUpperCase()}</p>
              <p><span className="font-medium">Total Reviews:</span> {analysisStats.total_reviews}</p>
              <p><span className="font-medium">Sentiment Score:</span> {analysisStats.sentiment_score}%</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Report will include: Summary, Insights, Recommendations, and Charts
            </p>
            <Button
              variant="default"
              onClick={generateReport}
              disabled={isExporting}
              loading={isExporting}
              iconName="FileText"
              iconPosition="left"
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
            >
              {isExporting ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const ExportView = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-6">Export Data</h3>
        
        {!analysisData || !analysisStats ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Icon name="AlertCircle" size={32} color="#9ca3af" />
            </div>
            <p className="text-gray-600 mb-2">No data available to export</p>
            <p className="text-sm text-gray-500">Please analyze a product first to export data</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Export Type</label>
                <select 
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
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
                  onClick={exportData}
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

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-black mb-3">Export Preview</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Type:</span> {exportType.charAt(0).toUpperCase() + exportType.slice(1)} Data</p>
                <p><span className="font-medium">Format:</span> {selectedFormat.toUpperCase()}</p>
                <p><span className="font-medium">Product:</span> {productInfo?.title || 'N/A'}</p>
                {exportType === 'analytics' && (
                  <>
                    <p><span className="font-medium">Includes:</span> Stats, Insights, Recommendations</p>
                    <p><span className="font-medium">Records:</span> {Object.keys(analysisStats).length} metrics</p>
                  </>
                )}
                {exportType === 'reviews' && (
                  <>
                    <p><span className="font-medium">Includes:</span> All review text, ratings, dates</p>
                    <p><span className="font-medium">Records:</span> {analysisData.reviews?.length || 0} reviews</p>
                  </>
                )}
                {exportType === 'sentiment' && (
                  <>
                    <p><span className="font-medium">Includes:</span> Sentiment scores and distribution</p>
                    <p><span className="font-medium">Records:</span> 4 sentiment metrics</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-black">{analysisStats.total_reviews}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-black">{analysisStats.sentiment_score}%</div>
                <div className="text-sm text-gray-600">Sentiment Score</div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className={`text-2xl font-bold ${
                  analysisStats.overall_sentiment === 'positive' ? 'text-green-600' :
                  analysisStats.overall_sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysisStats.overall_sentiment?.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Overall Sentiment</div>
              </div>
            </div>
          </>
        )}
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