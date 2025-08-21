import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ProcessingHeader from './components/ProcessingHeader';
import OverallProgress from './components/OverallProgress';
import DetailedProgress from './components/DetailedProgress';
import ProcessingQueue from './components/ProcessingQueue';
import LivePreview from './components/LivePreview';
import ProcessingActions from './components/ProcessingActions';
import CancelConfirmationModal from './components/CancelConfirmationModal';

const SentimentAnalysisProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [overallProgress, setOverallProgress] = useState(45);
  const [currentStage, setCurrentStage] = useState('analyzing');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(180);

  // Mock data for current processing
  const currentProduct = {
    name: "iPhone 14 Pro Max - 128GB Deep Purple",
    totalProducts: 3,
    currentIndex: 2
  };

  // Mock progress details
  const [progressDetails, setProgressDetails] = useState({
    reviewsCollected: 1247,
    totalReviewsTarget: 2500,
    textBlobProgress: 78,
    vaderProgress: 65,
    transformersProgress: 32,
    visualizationProgress: 15
  });

  // Mock processing queue
  const [queueItems, setQueueItems] = useState([
    {
      id: 1,
      productName: "iPhone 14 Pro Max - 128GB Deep Purple",
      url: "https://www.snapdeal.com/product/apple-iphone-14-pro-max/123456",
      status: 'processing',
      progress: 45,
      reviewsFound: 1247,
      startTime: "14:25",
      estimatedCompletion: "14:48"
    },
    {
      id: 2,
      productName: "Samsung Galaxy S24 Ultra - 256GB Titanium Black",
      url: "https://www.snapdeal.com/product/samsung-galaxy-s24-ultra/789012",
      status: 'queued',
      progress: 0,
      reviewsFound: 0,
      startTime: null,
      estimatedCompletion: "15:15"
    },
    {
      id: 3,
      productName: "OnePlus 12 - 256GB Flowy Emerald",
      url: "https://www.snapdeal.com/product/oneplus-12-256gb/345678",
      status: 'completed',
      progress: 100,
      reviewsFound: 892,
      startTime: "13:45",
      estimatedCompletion: null
    },
    {
      id: 4,
      productName: "Google Pixel 8 Pro - 128GB Obsidian",
      url: "https://www.snapdeal.com/product/google-pixel-8-pro/901234",
      status: 'failed',
      progress: 25,
      reviewsFound: 156,
      startTime: "13:20",
      error: "Failed to access product page. The product may be out of stock or the URL is invalid."
    }
  ]);

  // Mock live preview data
  const [previewData, setPreviewData] = useState([
    {
      id: 1,
      reviewer: "Rajesh Kumar",
      rating: 5,
      date: "2025-08-17",
      text: "Excellent phone with amazing camera quality. The battery life is fantastic and the build quality is top-notch. Highly recommended!",
      sentiment: "positive",
      confidence: 92,
      model: "TextBlob"
    },
    {
      id: 2,
      reviewer: "Priya Sharma",
      rating: 2,
      date: "2025-08-16",
      text: "Very disappointing purchase. The phone heats up quickly and the battery drains fast. Poor value for money.",
      sentiment: "negative",
      confidence: 87,
      model: "VADER"
    },
    {
      id: 3,
      reviewer: "Amit Patel",
      rating: 4,
      date: "2025-08-15",
      text: "Good phone overall. The camera is decent and performance is smooth. Some minor issues with the software but manageable.",
      sentiment: "positive",
      confidence: 76,
      model: "Transformers"
    },
    {
      id: 4,
      reviewer: "Sneha Gupta",
      rating: 3,
      date: "2025-08-14",
      text: "Average phone. Nothing special about it. Works fine for basic usage but don't expect premium features.",
      sentiment: "neutral",
      confidence: 68,
      model: "TextBlob"
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isProcessing || isPaused) return;

    const interval = setInterval(() => {
      setOverallProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 2, 100);
        if (newProgress >= 100) {
          setIsProcessing(false);
          setCurrentStage('completed');
        }
        return newProgress;
      });

      setProgressDetails(prev => ({
        ...prev,
        reviewsCollected: Math.min(prev?.reviewsCollected + Math.floor(Math.random() * 10), prev?.totalReviewsTarget),
        textBlobProgress: Math.min(prev?.textBlobProgress + Math.random() * 3, 100),
        vaderProgress: Math.min(prev?.vaderProgress + Math.random() * 2, 100),
        transformersProgress: Math.min(prev?.transformersProgress + Math.random() * 1.5, 100),
        visualizationProgress: Math.min(prev?.visualizationProgress + Math.random() * 1, 100)
      }));

      setEstimatedTimeRemaining(prev => Math.max(prev - 3, 0));
    }, 3000);

    return () => clearInterval(interval);
  }, [isProcessing, isPaused]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setIsProcessing(false);
    setShowCancelModal(false);
    window.location.href = '/product-search-selection';
  };

  const handleViewPartialResults = () => {
    window.location.href = '/sentiment-visualization-dashboard';
  };

  const handlePauseItem = (itemId) => {
    setQueueItems(prev => prev?.map(item => 
      item?.id === itemId ? { ...item, status: 'paused' } : item
    ));
  };

  const handleResumeItem = (itemId) => {
    setQueueItems(prev => prev?.map(item => 
      item?.id === itemId ? { ...item, status: 'processing' } : item
    ));
  };

  const handleRemoveItem = (itemId) => {
    setQueueItems(prev => prev?.filter(item => item?.id !== itemId));
  };

  // Browser tab notification
  useEffect(() => {
    if (!isProcessing && overallProgress >= 100) {
      document.title = '✅ Analysis Complete - Snapdeal Sentiment Analyzer';
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Sentiment Analysis Complete', {
          body: `Analysis for ${currentProduct.name} has been completed successfully.`,
          icon: '/favicon.ico'
        });
      }
    } else if (isProcessing) {
      document.title = `${overallProgress}% - Processing - Snapdeal Sentiment Analyzer`;
    }

    return () => {
      document.title = 'Snapdeal Sentiment Analyzer';
    };
  }, [isProcessing, overallProgress, currentProduct?.name]);

  return (
    <div className="min-h-screen bg-surface">
      <Header 
        processingStatus={isProcessing ? `${overallProgress}% Complete` : null}
        onSearchClick={() => window.location.href = '/product-search-selection'}
        onHistoryClick={(id) => window.location.href = `/sentiment-visualization-dashboard?analysis=${id}`}
      />
      <div className="pt-16">
        <ProcessingHeader
          productName={currentProduct?.name}
          totalProducts={currentProduct?.totalProducts}
          currentProductIndex={currentProduct?.currentIndex}
          onPause={handlePause}
          onCancel={handleCancel}
          isPaused={isPaused}
          isProcessing={isProcessing}
        />

        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <OverallProgress
                overallProgress={overallProgress}
                currentStage={currentStage}
                estimatedTimeRemaining={estimatedTimeRemaining}
                isProcessing={isProcessing}
                isPaused={isPaused}
              />

              <DetailedProgress progressDetails={progressDetails} />

              <ProcessingActions
                onViewPartialResults={handleViewPartialResults}
                onPauseProcessing={handlePause}
                onCancelProcessing={handleCancel}
                hasPartialResults={overallProgress > 20}
                isProcessing={isProcessing}
                isPaused={isPaused}
              />
            </div>

            <div className="space-y-6">
              <LivePreview previewData={previewData} />
            </div>
          </div>

          <ProcessingQueue
            queueItems={queueItems}
            onPauseItem={handlePauseItem}
            onResumeItem={handleResumeItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </div>
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        productName={currentProduct?.name}
      />
    </div>
  );
};

export default SentimentAnalysisProcessing;