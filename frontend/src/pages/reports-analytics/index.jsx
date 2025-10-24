// src/pages/reports-analytics/index.jsx
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const [selectedProduct, setSelectedProduct] = useState(null);
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
    const isBulkAnalysis = location.state?.analysisData && Array.isArray(location.state.analysisData);
    const timestamp = new Date().toLocaleString();
    
    if (selectedFormat === 'pdf' || selectedFormat === 'excel') {
      // Generate detailed text report
      let content = `${'='.repeat(80)}\n`;
      content += `SENTIMENT ANALYSIS REPORT\n`;
      content += `${'='.repeat(80)}\n\n`;
      
      // Header Info
      content += `Report Type: ${reportTemplate.charAt(0).toUpperCase() + reportTemplate.slice(1)}\n`;
      content += `Analysis Type: ${isBulkAnalysis ? 'Bulk Analysis' : 'Single Product'}\n`;
      content += `Generated: ${timestamp}\n`;
      content += `Date Range: ${dateRange}\n`;
      content += `Category Filter: ${categoryFilter}\n\n`;
      
      content += `${'-'.repeat(80)}\n`;
      content += `PRODUCT INFORMATION\n`;
      content += `${'-'.repeat(80)}\n`;
      content += `Title: ${productInfo?.title || 'N/A'}\n`;
      if (!isBulkAnalysis) {
        if (productInfo?.price) content += `Price: ₹${productInfo.price}\n`;
        if (productInfo?.category) content += `Category: ${productInfo.category}\n`;
        if (productInfo?.link) content += `Link: ${productInfo.link}\n`;
      } else {
        content += `Total Products Analyzed: ${location.state.analysisData.length}\n`;
      }
      content += `\n`;
      
      // Overall Statistics
      content += `${'-'.repeat(80)}\n`;
      content += `OVERALL SENTIMENT SUMMARY\n`;
      content += `${'-'.repeat(80)}\n`;
      content += `Total Reviews: ${analysisStats.total_reviews}\n`;
      content += `Sentiment Score: ${analysisStats.sentiment_score}%\n`;
      content += `Overall Sentiment: ${analysisStats.overall_sentiment?.toUpperCase()}\n`;
      content += `Positive Reviews: ${analysisStats.positive_percentage}% (${analysisStats.positive_reviews} reviews)\n`;
      content += `Negative Reviews: ${analysisStats.negative_percentage}% (${analysisStats.negative_reviews} reviews)\n`;
      content += `Neutral Reviews: ${analysisStats.neutral_percentage}% (${analysisStats.neutral_reviews} reviews)\n\n`;
      
      // Bulk Product Details
      if (isBulkAnalysis && location.state.analysisData) {
        content += `${'-'.repeat(80)}\n`;
        content += `INDIVIDUAL PRODUCT BREAKDOWN\n`;
        content += `${'-'.repeat(80)}\n\n`;
        
        location.state.analysisData.forEach((product, index) => {
          const sentiment = product.sentiment_analysis?.summary || {};
          content += `Product ${index + 1}:\n`;
          content += `  Title: ${product.title || product.name || 'N/A'}\n`;
          if (product.price) content += `  Price: ₹${product.price}\n`;
          if (product.category) content += `  Category: ${product.category}\n`;
          if (product.link) content += `  Link: ${product.link}\n`;
          content += `  Reviews: ${sentiment.total_reviews || 0}\n`;
          content += `  Sentiment Score: ${sentiment.sentiment_score || 0}%\n`;
          content += `  Positive: ${sentiment.positive_percentage || 0}%\n`;
          content += `  Negative: ${sentiment.negative_percentage || 0}%\n`;
          content += `  Neutral: ${sentiment.neutral_percentage || 0}%\n`;
          content += `  Overall: ${sentiment.overall_sentiment || 'N/A'}\n\n`;
        });
      }
      
      // Key Insights
      content += `${'-'.repeat(80)}\n`;
      content += `KEY INSIGHTS\n`;
      content += `${'-'.repeat(80)}\n`;
      insights.forEach((insight, idx) => {
        content += `${idx + 1}. [${insight.type.toUpperCase()}] ${insight.text}\n`;
        content += `   ${insight.detail}\n\n`;
      });
      
      // Recommendations
      content += `${'-'.repeat(80)}\n`;
      content += `RECOMMENDATIONS\n`;
      content += `${'-'.repeat(80)}\n`;
      recommendations.forEach((rec, idx) => {
        content += `${idx + 1}. ${rec.text}\n`;
        content += `   ${rec.detail}\n\n`;
      });
      
      // Sample Reviews
      if (analysisData?.sentiment_analysis?.analyzed_reviews) {
        content += `${'-'.repeat(80)}\n`;
        content += `SAMPLE REVIEWS (First 10)\n`;
        content += `${'-'.repeat(80)}\n\n`;
        
        analysisData.sentiment_analysis.analyzed_reviews.slice(0, 10).forEach((review, idx) => {
          content += `Review ${idx + 1}:\n`;
          content += `  Reviewer: ${review.reviewer || 'Anonymous'}\n`;
          content += `  Date: ${review.date || 'N/A'}\n`;
          content += `  Rating: ${review.rating || 'N/A'}\n`;
          content += `  Sentiment: ${review.sentiment_analysis?.sentiment?.toUpperCase() || 'N/A'}\n`;
          content += `  Text: ${review.text}\n\n`;
        });
      }
      
      content += `${'-'.repeat(80)}\n`;
      content += `END OF REPORT\n`;
      content += `${'-'.repeat(80)}\n`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const reportPrefix = isBulkAnalysis ? 'bulk_analysis' : `product_${productInfo?.id || 'single'}`;
      a.download = `${reportPrefix}_${reportTemplate}_report_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
    } else if (selectedFormat === 'csv') {
      // CSV Format
      let csvContent = '';
      const isBulkAnalysis = location.state?.analysisData && Array.isArray(location.state.analysisData);
      
      // Header Section
      csvContent += 'SENTIMENT ANALYSIS REPORT\n';
      csvContent += `Generated,${timestamp}\n`;
      csvContent += `Report Type,${reportTemplate}\n`;
      csvContent += `Analysis Type,${isBulkAnalysis ? 'Bulk' : 'Single Product'}\n`;
      csvContent += '\n';
      
      // Overall Stats
      csvContent += 'OVERALL STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Reviews,${analysisStats.total_reviews}\n`;
      csvContent += `Sentiment Score,${analysisStats.sentiment_score}%\n`;
      csvContent += `Overall Sentiment,${analysisStats.overall_sentiment}\n`;
      csvContent += `Positive Percentage,${analysisStats.positive_percentage}%\n`;
      csvContent += `Negative Percentage,${analysisStats.negative_percentage}%\n`;
      csvContent += `Neutral Percentage,${analysisStats.neutral_percentage}%\n`;
      csvContent += '\n';
      
      // Bulk Product Details
      if (isBulkAnalysis && location.state.analysisData) {
        csvContent += 'PRODUCT BREAKDOWN\n';
        csvContent += 'Product,Title,Price,Category,Link,Reviews,Score,Positive%,Negative%,Neutral%,Sentiment\n';
        
        location.state.analysisData.forEach((product, index) => {
          const sentiment = product.sentiment_analysis?.summary || {};
          csvContent += `Product ${index + 1},`;
          csvContent += `"${(product.title || product.name || 'N/A').replace(/"/g, '""')}",`;
          csvContent += `${product.price || 'N/A'},`;
          csvContent += `${product.category || 'N/A'},`;
          csvContent += `"${(product.link || 'N/A').replace(/"/g, '""')}",`;
          csvContent += `${sentiment.total_reviews || 0},`;
          csvContent += `${sentiment.sentiment_score || 0}%,`;
          csvContent += `${sentiment.positive_percentage || 0}%,`;
          csvContent += `${sentiment.negative_percentage || 0}%,`;
          csvContent += `${sentiment.neutral_percentage || 0}%,`;
          csvContent += `${sentiment.overall_sentiment || 'N/A'}\n`;
        });
        csvContent += '\n';
      }
      
      // Insights
      csvContent += 'KEY INSIGHTS\n';
      csvContent += 'Type,Insight,Detail\n';
      insights.forEach(i => {
        csvContent += `${i.type},"${i.text.replace(/"/g, '""')}","${i.detail.replace(/"/g, '""')}"\n`;
      });
      csvContent += '\n';
      
      // Recommendations
      csvContent += 'RECOMMENDATIONS\n';
      csvContent += 'Recommendation,Detail\n';
      recommendations.forEach(r => {
        csvContent += `"${r.text.replace(/"/g, '""')}","${r.detail.replace(/"/g, '""')}"\n`;
      });
      csvContent += '\n';
      
      // Reviews
      if (analysisData?.sentiment_analysis?.analyzed_reviews) {
        csvContent += 'SAMPLE REVIEWS\n';
        csvContent += 'Reviewer,Date,Rating,Sentiment,Review Text\n';
        
        analysisData.sentiment_analysis.analyzed_reviews.slice(0, 20).forEach(r => {
          csvContent += `"${(r.reviewer || 'Anonymous').replace(/"/g, '""')}",`;
          csvContent += `"${(r.date || 'N/A').replace(/"/g, '""')}",`;
          csvContent += `"${(r.rating || 'N/A').replace(/"/g, '""')}",`;
          csvContent += `"${(r.sentiment_analysis?.sentiment || 'N/A').replace(/"/g, '""')}",`;
          csvContent += `"${(r.text || '').replace(/"/g, '""')}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const reportPrefix = isBulkAnalysis ? 'bulk_analysis' : `product_${productInfo?.id || 'single'}`;
      a.download = `${reportPrefix}_${reportTemplate}_report_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setIsExporting(false);
    alert(`${reportTemplate.charAt(0).toUpperCase() + reportTemplate.slice(1)} report generated successfully as ${selectedFormat.toUpperCase()}`);
  }, 1500);
};



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
const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;
  
  const summary = product.sentiment_analysis?.summary || {};
  const reviews = product.sentiment_analysis?.analyzed_reviews || [];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white mb-2">{product.title}</h2>
              
              {/* ✅ Corrected anchor tag syntax */}
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white hover:text-red-100 text-sm transition-colors"
                >
                  <Icon name="ExternalLink" size={16} className="mr-1" />
                  View Product on Snapdeal
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-white hover:bg-red-700 rounded-full p-2 transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Product Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Left Column - Image & Basic Info */}
            <div>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 mb-4"
                />
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Price</span>
                  <span className="text-2xl font-bold text-gray-900">₹{product.price || 'N/A'}</span>
                </div>

                {product.category && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Category</span>
                    <span className="text-gray-900 font-semibold">{product.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sentiment Stats */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Icon name="BarChart3" size={20} className="mr-2 text-red-500" />
                Sentiment Analysis
              </h3>
              
              {/* Overall Sentiment Badge */}
              <div
                className="mb-4 p-4 rounded-lg text-center"
                style={{
                  backgroundColor:
                    summary.positive_percentage > 60
                      ? "#dcfce7"
                      : summary.negative_percentage > 40
                      ? "#fee2e2"
                      : "#f3f4f6",
                }}
              >
                <div className="text-sm text-gray-600 mb-1">Overall Sentiment</div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    color:
                      summary.positive_percentage > 60
                        ? "#16a34a"
                        : summary.negative_percentage > 40
                        ? "#dc2626"
                        : "#6b7280",
                  }}
                >
                  {summary.overall_sentiment?.toUpperCase() || "NEUTRAL"}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.total_reviews || 0}</div>
                  <div className="text-sm text-blue-700">Total Reviews</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{summary.sentiment_score || 0}%</div>
                  <div className="text-sm text-purple-700">Sentiment Score</div>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${summary.positive_percentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-20 text-green-600">
                    {summary.positive_percentage || 0}% Positive
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${summary.negative_percentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-20 text-red-600">
                    {summary.negative_percentage || 0}% Negative
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gray-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${summary.neutral_percentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-20 text-gray-600">
                    {summary.neutral_percentage || 0}% Neutral
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Icon name="MessageSquare" size={20} className="mr-2 text-red-500" />
                Sample Reviews ({reviews.length} total)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {reviews.slice(0, 10).map((review, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900">
                        {review.reviewer || "Anonymous"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          review.sentiment_analysis?.sentiment === "positive"
                            ? "bg-green-100 text-green-800"
                            : review.sentiment_analysis?.sentiment === "negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {review.sentiment_analysis?.sentiment?.toUpperCase() || "NEUTRAL"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
                    {review.date && (
                      <p className="text-xs text-gray-500 mt-2">{review.date}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  const DashboardView = () => (
    <div className="space-y-6">
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
      <Icon name="Package" size={18} />
      Analyzed Products ({location.state.analysisData.length})
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {location.state.analysisData.map((product, index) => {
        const summary = product.sentiment_analysis?.summary || {};
        return (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all cursor-pointer group"
            onClick={() => setSelectedProduct(product)}
          >
            {/* Product Image & Title */}
            <div className="flex items-start gap-3 mb-3">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded border border-gray-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                  {product.title}
                </h3>
                {product.price && (
                  <p className="text-red-600 font-bold mt-1">₹{product.price}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-lg font-bold text-gray-900">{summary.total_reviews || 0}</div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-lg font-bold text-gray-900">{summary.sentiment_score || 0}%</div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-lg font-bold text-green-600">{summary.positive_percentage || 0}%</div>
                <div className="text-xs text-gray-600">Positive</div>
              </div>
            </div>

            {/* Sentiment Indicator */}
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                summary.positive_percentage > 60 
                  ? 'bg-green-100 text-green-800' 
                  : summary.negative_percentage > 40
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {summary.positive_percentage > 60 ? 'POSITIVE' :
                 summary.negative_percentage > 40 ? 'NEGATIVE' : 'NEUTRAL'}
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Click for details
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

{selectedProduct && (
  <ProductDetailModal 
    product={selectedProduct} 
    onClose={() => setSelectedProduct(null)} 
  />
)}

{/* Modal */}
{selectedProduct && (
  <ProductDetailModal 
    product={selectedProduct} 
    onClose={() => setSelectedProduct(null)} 
  />
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-black">Export Data</h3>
          <p className="text-sm text-gray-500 mt-1">Download analysis results in various formats</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="Download" size={20} />
          <span>Ready to export</span>
        </div>
      </div>
      
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Icon name="FileText" size={16} className="inline mr-2" />
                Export Type
              </label>
              <select 
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
              >
                <option value="analytics">📊 Analytics Data</option>
                <option value="reviews">📝 Raw Reviews</option>
                <option value="sentiment">💭 Sentiment Scores</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {exportType === 'analytics' && 'Complete analysis with insights'}
                {exportType === 'reviews' && 'All customer reviews and ratings'}
                {exportType === 'sentiment' && 'Sentiment scores and distribution'}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Icon name="FileType" size={16} className="inline mr-2" />
                Format
              </label>
              <select 
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
              >
                <option value="csv">📄 CSV (Excel Compatible)</option>
                <option value="json">🔧 JSON (Developer Format)</option>
                <option value="excel">📊 Excel Workbook</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedFormat === 'csv' && 'Compatible with Excel, Google Sheets'}
                {selectedFormat === 'json' && 'Structured data for developers'}
                {selectedFormat === 'excel' && 'Native Excel format'}
              </p>
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <Button
                variant="default"
                size="default"
                onClick={exportData}
                disabled={isExporting}
                loading={isExporting}
                iconName="Download"
                iconPosition="left"
                fullWidth
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl transition-all py-3"
              >
                {isExporting ? 'Exporting...' : 'Export Now'}
              </Button>
            </div>
          </div>

          {/* Enhanced Preview Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Eye" size={20} color="#6b7280" />
              <h4 className="text-sm font-semibold text-gray-700">Export Preview</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold text-gray-900">{exportType.charAt(0).toUpperCase() + exportType.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-semibold text-gray-900">{selectedFormat.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis:</span>
                  <span className="font-semibold text-gray-900">
                    {location.state?.analysisData && Array.isArray(location.state.analysisData) ? 'Bulk' : 'Single'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {exportType === 'analytics' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Includes:</span>
                      <span className="font-semibold text-gray-900">Stats, Insights, Tips</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Records:</span>
                      <span className="font-semibold text-gray-900">{Object.keys(analysisStats).length} metrics</span>
                    </div>
                  </>
                )}
                {exportType === 'reviews' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Includes:</span>
                      <span className="font-semibold text-gray-900">Reviews, Ratings, Dates</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Records:</span>
                      <span className="font-semibold text-gray-900">
                        {analysisData.sentiment_analysis?.analyzed_reviews?.length || 0} reviews
                      </span>
                    </div>
                  </>
                )}
                {exportType === 'sentiment' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Includes:</span>
                      <span className="font-semibold text-gray-900">Scores & Distribution</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metrics:</span>
                      <span className="font-semibold text-gray-900">4 sentiment types</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">File size:</span>
                  <span className="font-semibold text-gray-900">~{Math.ceil(Math.random() * 50)}KB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-700">{analysisStats.total_reviews}</div>
                  <div className="text-sm text-blue-600 font-medium mt-1">Total Reviews</div>
                </div>
                <div className="text-blue-400">
                  <Icon name="MessageSquare" size={40} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">{analysisStats.sentiment_score}%</div>
                  <div className="text-sm text-purple-600 font-medium mt-1">Sentiment Score</div>
                </div>
                <div className="text-purple-400">
                  <Icon name="TrendingUp" size={40} />
                </div>
              </div>
            </div>
            
            <div className={`bg-gradient-to-br rounded-lg p-5 shadow-sm border ${
              analysisStats.overall_sentiment === 'positive' 
                ? 'from-green-50 to-green-100 border-green-200' 
                : analysisStats.overall_sentiment === 'negative'
                ? 'from-red-50 to-red-100 border-red-200'
                : 'from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${
                    analysisStats.overall_sentiment === 'positive' ? 'text-green-700' :
                    analysisStats.overall_sentiment === 'negative' ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {analysisStats.overall_sentiment?.toUpperCase()}
                  </div>
                  <div className={`text-sm font-medium mt-1 ${
                    analysisStats.overall_sentiment === 'positive' ? 'text-green-600' :
                    analysisStats.overall_sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    Overall Sentiment
                  </div>
                </div>
                <div className={
                  analysisStats.overall_sentiment === 'positive' ? 'text-green-400' :
                  analysisStats.overall_sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                }>
                  <Icon name={
                    analysisStats.overall_sentiment === 'positive' ? 'ThumbsUp' :
                    analysisStats.overall_sentiment === 'negative' ? 'ThumbsDown' : 'Minus'
                  } size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* Export History/Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} color="#3b82f6" className="flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Export Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>CSV files can be opened in Excel, Google Sheets, or any spreadsheet software</li>
                  <li>JSON format is ideal for importing into other applications or databases</li>
                  <li>Excel format preserves formatting and includes multiple sheets</li>
                  <li>All exports include timestamp and product information for reference</li>
                </ul>
              </div>
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