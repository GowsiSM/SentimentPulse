import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';

import Button from '../../components/ui/Button';
import SentimentOverviewCards from './components/SentimentOverviewCards';
import SentimentCharts from './components/SentimentCharts';
import FilterPanel from './components/FilterPanel';
import ReviewsDataTable from './components/ReviewsDataTable';
import ActionButtons from './components/ActionButtons';

const SentimentVisualizationDashboard = () => {
  const [activeChart, setActiveChart] = useState('pie');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [filters, setFilters] = useState({
    sentiment: 'all',
    dateRange: 'last30days',
    source: 'all',
    minScore: 0,
    maxScore: 100,
    startDate: '',
    endDate: ''
  });

  // Mock sentiment data
  const sentimentData = {
    positive: { count: 1247, percentage: '62.4%' },
    negative: { count: 423, percentage: '21.2%' },
    neutral: { count: 330, percentage: '16.4%' },
    total: 2000
  };

  // Mock chart data
  const chartData = {
    distribution: [
      { name: 'Positive', value: 62.4 },
      { name: 'Negative', value: 21.2 },
      { name: 'Neutral', value: 16.4 }
    ],
    trends: [
      { date: '10/08', positive: 65, negative: 20, neutral: 15 },
      { date: '11/08', positive: 68, negative: 18, neutral: 14 },
      { date: '12/08', positive: 62, negative: 22, neutral: 16 },
      { date: '13/08', positive: 70, negative: 16, neutral: 14 },
      { date: '14/08', positive: 64, negative: 21, neutral: 15 },
      { date: '15/08', positive: 66, negative: 19, neutral: 15 },
      { date: '16/08', positive: 63, negative: 23, neutral: 14 },
      { date: '17/08', positive: 69, negative: 17, neutral: 14 },
      { date: '18/08', positive: 62, negative: 21, neutral: 17 }
    ],
    volume: [
      { date: '10/08', reviews: 180 },
      { date: '11/08', reviews: 220 },
      { date: '12/08', reviews: 195 },
      { date: '13/08', reviews: 240 },
      { date: '14/08', reviews: 210 },
      { date: '15/08', reviews: 185 },
      { date: '16/08', reviews: 200 },
      { date: '17/08', reviews: 225 },
      { date: '18/08', reviews: 190 }
    ]
  };

  // Mock reviews data
  const reviewsData = [
    {
      id: 1,
      rating: 5,
      sentiment: 'Positive',
      score: 92,
      text: `Excellent product! The iPhone 14 Pro exceeded my expectations. The camera quality is outstanding, especially in low light conditions. The build quality feels premium and the performance is smooth. Battery life easily lasts a full day with heavy usage. Highly recommended for anyone looking for a flagship smartphone.`,
      reviewer: 'Rajesh Kumar',
      date: '2025-08-17'
    },
    {
      id: 2,
      rating: 2,
      sentiment: 'Negative',
      score: 15,
      text: `Very disappointed with this purchase. The Samsung Galaxy S24 has heating issues during gaming and the battery drains quickly. The camera app crashes frequently and the overall experience is frustrating. Expected much better quality for this price range. Would not recommend.`,
      reviewer: 'Priya Sharma',
      date: '2025-08-16'
    },
    {
      id: 3,
      rating: 4,
      sentiment: 'Positive',
      score: 78,
      text: `Good value for money. The OnePlus 12 offers decent performance and the display quality is impressive. Some minor software bugs but overall a solid choice. Fast charging is a great feature. Camera performance is acceptable for the price point.`,
      reviewer: 'Amit Patel',
      date: '2025-08-15'
    },
    {
      id: 4,
      sentiment: 'Neutral',
      rating: 3,
      score: 55,
      text: `Average product with mixed feelings. The Xiaomi 14 has some good features like fast charging and decent display, but the software experience could be better. Build quality is okay but not exceptional. It's an average choice in this price segment.`,reviewer: 'Sneha Gupta',date: '2025-08-14'
    },
    {
      id: 5,
      rating: 5,
      sentiment: 'Positive',
      score: 88,
      text: `Fantastic smartphone! The Google Pixel 8 Pro has an amazing camera system with excellent computational photography. Clean Android experience with timely updates. Performance is smooth and the display is vibrant. Great choice for photography enthusiasts.`,
      reviewer: 'Vikram Singh',date: '2025-08-13'
    },
    {
      id: 6,
      rating: 1,
      sentiment: 'Negative',
      score: 8,
      text: `Terrible experience with this product. The Nothing Phone 2 arrived with a cracked screen and poor packaging. Customer service was unhelpful and the return process was complicated. The phone itself feels cheap and the unique design doesn't compensate for poor quality.`,
      reviewer: 'Anita Reddy',
      date: '2025-08-12'
    }
  ];

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      alert('Report generated successfully! Check your downloads folder.');
    }, 3000);
  };

  const handleCompareProducts = () => {
    window.location.href = '/product-search-selection?compare=true';
  };

  const handleScheduleUpdates = (scheduleType) => {
    alert(`Scheduled ${scheduleType} updates successfully!`);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // In a real app, this would trigger data refetch
    console.log('Filters updated:', newFilters);
  };

  const handleReviewClick = (reviewId) => {
    console.log('Review clicked:', reviewId);
  };

  const handleSearchClick = () => {
    window.location.href = '/product-search-selection';
  };

  const handleHistoryClick = (analysisId) => {
    console.log('Loading analysis:', analysisId);
  };

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
                Comprehensive sentiment analysis for iPhone 14 Pro - Last updated: 18/08/2025, 04:37 IST
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                iconName="Filter"
                iconPosition="left"
                iconSize={16}
                className="lg:hidden"
              >
                Filters
              </Button>
              
              <Button
                variant="default"
                onClick={() => window.location.href = '/product-search-selection'}
                iconName="Search"
                iconPosition="left"
                iconSize={16}
              >
                New Analysis
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Dashboard Content */}
            <div className="lg:col-span-3 space-y-6">
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

            {/* Filter Panel - Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <FilterPanel 
                isOpen={true}
                onClose={() => {}}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <FilterPanel 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Product Info Card */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Current Product Analysis
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Product:</strong> iPhone 14 Pro (128GB, Deep Purple)</p>
                  <p><strong>Price Range:</strong> ₹1,20,000 - ₹1,35,000</p>
                  <p><strong>Reviews Analyzed:</strong> {sentimentData?.total?.toLocaleString('en-IN')}</p>
                  <p><strong>Analysis Period:</strong> Last 30 days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">4.2</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sentiment-positive">62%</div>
                  <div className="text-xs text-muted-foreground">Positive</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ExternalLink"
                  iconPosition="right"
                  iconSize={14}
                >
                  View on Snapdeal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SentimentVisualizationDashboard;