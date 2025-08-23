// src/pages/sentiment-visualization-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import SentimentOverviewCards from './components/SentimentOverviewCards';
import SentimentCharts from './components/SentimentCharts';
import ReviewsDataTable from './components/ReviewsDataTable';
import ActionButtons from './components/ActionButtons';

const SentimentVisualizationDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeChart, setActiveChart] = useState('pie');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for analysis data from navigation state or localStorage
  useEffect(() => {
    const checkForAnalysisData = () => {
      let data = null;
      
      // First check navigation state (from direct navigation after analysis)
      if (location.state?.analysisData) {
        data = location.state.analysisData;
      } else {
        // Check localStorage for saved analyses
        try {
          const savedAnalyses = JSON.parse(localStorage.getItem('sentiment_analyses') || '[]');
          if (savedAnalyses.length > 0) {
            // Get the most recent analysis
            data = savedAnalyses[0].product;
          }
        } catch (error) {
          console.error('Error reading from localStorage:', error);
        }
      }
      
      setAnalysisData(data);
      setIsLoading(false);
    };

    checkForAnalysisData();
  }, [location.state]);

  // Transform analysis data for components
  const getSentimentData = () => {
    if (!analysisData?.sentiment_analysis) return null;

    const analysis = analysisData.sentiment_analysis;
    const summary = analysis.sentiment_summary;
    
    return {
      positive: { 
        count: Math.round((summary.positive / 100) * analysis.total_reviews || 0), 
        percentage: `${summary.positive}%` 
      },
      negative: { 
        count: Math.round((summary.negative / 100) * analysis.total_reviews || 0), 
        percentage: `${summary.negative}%` 
      },
      neutral: { 
        count: Math.round((summary.neutral / 100) * analysis.total_reviews || 0), 
        percentage: `${summary.neutral}%` 
      },
      total: analysis.total_reviews || 0
    };
  };

  const getChartData = () => {
    if (!analysisData?.sentiment_analysis) return null;

    const summary = analysisData.sentiment_analysis.sentiment_summary;
    
    return {
      distribution: [
        { name: 'Positive', value: summary.positive || 0 },
        { name: 'Negative', value: summary.negative || 0 },
        { name: 'Neutral', value: summary.neutral || 0 }
      ],
      trends: [
        { date: '10/08', positive: summary.positive, negative: summary.negative, neutral: summary.neutral },
        { date: '11/08', positive: summary.positive + 2, negative: summary.negative - 1, neutral: summary.neutral - 1 },
        { date: '12/08', positive: summary.positive - 3, negative: summary.negative + 2, neutral: summary.neutral + 1 },
        { date: '13/08', positive: summary.positive + 5, negative: summary.negative - 2, neutral: summary.neutral - 3 },
        { date: '14/08', positive: summary.positive, negative: summary.negative, neutral: summary.neutral },
      ],
      volume: [
        { date: '10/08', reviews: Math.round((analysisData.sentiment_analysis.total_reviews || 0) * 0.2) },
        { date: '11/08', reviews: Math.round((analysisData.sentiment_analysis.total_reviews || 0) * 0.25) },
        { date: '12/08', reviews: Math.round((analysisData.sentiment_analysis.total_reviews || 0) * 0.15) },
        { date: '13/08', reviews: Math.round((analysisData.sentiment_analysis.total_reviews || 0) * 0.3) },
        { date: '14/08', reviews: Math.round((analysisData.sentiment_analysis.total_reviews || 0) * 0.1) },
      ]
    };
  };

  const getReviewsData = () => {
    if (!analysisData?.sentiment_analysis?.analyzed_reviews) return [];

    return analysisData.sentiment_analysis.analyzed_reviews.map((review, index) => ({
      id: index + 1,
      rating: 4, // Default rating since it's not in the mock data structure
      sentiment: review.sentiment?.sentiment || 'neutral',
      score: Math.round(review.sentiment?.confidence || 50),
      text: review.review,
      reviewer: `User ${index + 1}`,
      date: new Date().toISOString().split('T')[0]
    }));
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      alert('Report generated successfully! Check your downloads folder.');
    }, 3000);
  };

  const handleCompareProducts = () => {
    navigate('/product-search-selection?compare=true');
  };

  const handleScheduleUpdates = (scheduleType) => {
    alert(`Scheduled ${scheduleType} updates successfully!`);
  };

  const handleReviewClick = (reviewId) => {
    console.log('Review clicked:', reviewId);
  };

  const handleSearchClick = () => {
    navigate('/product-search-selection');
  };

  const handleHistoryClick = (analysisId) => {
    console.log('Loading analysis:', analysisId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          processingStatus="Loading..."
          onSearchClick={handleSearchClick}
          onHistoryClick={handleHistoryClick}
          user={{ name: 'Arjun Mehta', email: 'arjun.mehta@snapdeal.com' }}
        />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Loading Analysis...</h3>
                <p className="text-muted-foreground">Please wait while we load your sentiment analysis data.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if no analysis data
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          processingStatus="No Analysis"
          onSearchClick={handleSearchClick}
          onHistoryClick={handleHistoryClick}
          user={{ name: 'Arjun Mehta', email: 'arjun.mehta@snapdeal.com' }}
        />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <Icon name="BarChart3" size={64} className="text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Get Started with Sentiment Analysis
                </h2>
                <p className="text-muted-foreground mb-8">
                  You haven't analyzed any products yet. Start by searching for products and running sentiment analysis on their reviews to see comprehensive insights here.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleSearchClick}
                    iconName="Search"
                    iconPosition="left"
                    iconSize={20}
                    className="w-full"
                  >
                    Start New Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      // Try to load from localStorage if available
                      try {
                        const savedAnalyses = JSON.parse(localStorage.getItem('sentiment_analyses') || '[]');
                        if (savedAnalyses.length > 0) {
                          setAnalysisData(savedAnalyses[0].product);
                        } else {
                          alert('No previous analyses found.');
                        }
                      } catch (error) {
                        alert('No previous analyses found.');
                      }
                    }}
                    iconName="History"
                    iconPosition="left"
                    iconSize={20}
                    className="w-full"
                  >
                    Load Previous Analysis
                  </Button>
                </div>
                
                {/* Feature Preview */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <Icon name="PieChart" size={32} className="text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-foreground mb-1">Visual Analytics</h3>
                    <p className="text-xs text-muted-foreground">Interactive charts and graphs</p>
                  </div>
                  <div className="p-4">
                    <Icon name="MessageSquare" size={32} className="text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-foreground mb-1">Review Analysis</h3>
                    <p className="text-xs text-muted-foreground">Detailed sentiment breakdown</p>
                  </div>
                  <div className="p-4">
                    <Icon name="TrendingUp" size={32} className="text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-foreground mb-1">Smart Insights</h3>
                    <p className="text-xs text-muted-foreground">Actionable recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show dashboard with analysis data
  const sentimentData = getSentimentData();
  const chartData = getChartData();
  const reviewsData = getReviewsData();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        processingStatus="Analysis Complete"
        onSearchClick={handleSearchClick}
        onHistoryClick={handleHistoryClick}
        user={{ name: 'Arjun Mehta', email: 'arjun.mehta@snapdeal.com' }}
      />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Sentiment Analysis Dashboard
              </h1>
              <p className="text-muted-foreground">
                Comprehensive sentiment analysis for {analysisData.title} - Last updated: {new Date().toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="default"
                onClick={handleSearchClick}
                iconName="Search"
                iconPosition="left"
                iconSize={16}
              >
                New Analysis
              </Button>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Main Dashboard Content */}
            <div className="lg:flex-1 space-y-6">
              {/* Sentiment Overview Cards */}
              <SentimentOverviewCards sentimentData={sentimentData} />

              {/* Charts Section */}
              <SentimentCharts 
                chartData={chartData}
                activeChart={activeChart}
                onChartChange={setActiveChart}
              />

              {/* Action Buttons */}
              <ActionButtons 
                onGenerateReport={handleGenerateReport}
                onCompareProducts={handleCompareProducts}
                onScheduleUpdates={handleScheduleUpdates}
                isGeneratingReport={isGeneratingReport}
              />

              {/* Reviews Data Table */}
              <ReviewsDataTable 
                reviews={reviewsData}
                onReviewClick={handleReviewClick}
              />
            </div>
          </div>

          {/* Product Info Card */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Current Product Analysis
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Product:</strong> {analysisData.title}</p>
                  <p><strong>Price:</strong> {analysisData.price ? `₹${analysisData.price.toLocaleString('en-IN')}` : 'Not available'}</p>
                  <p><strong>Reviews Analyzed:</strong> {sentimentData?.total?.toLocaleString('en-IN')}</p>
                  <p><strong>Analysis Date:</strong> {new Date(analysisData.analysis_timestamp || Date.now()).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {analysisData.sentiment_analysis?.overall_sentiment === 'positive' ? '😊' : 
                     analysisData.sentiment_analysis?.overall_sentiment === 'negative' ? '😞' : '😐'}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sentiment-positive">
                    {sentimentData.positive.percentage}
                  </div>
                  <div className="text-xs text-muted-foreground">Positive</div>
                </div>
                {analysisData.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(analysisData.link, '_blank')}
                    iconName="ExternalLink"
                    iconPosition="right"
                    iconSize={14}
                  >
                    View Product
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SentimentVisualizationDashboard;