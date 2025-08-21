import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import SentimentAnalysisProcessing from './pages/sentiment-analysis-processing';
import UserProfileSettings from './pages/user-profile-settings';
import SentimentVisualizationDashboard from './pages/sentiment-visualization-dashboard';
import UserAuthentication from './pages/user-authentication';
import ProductSearchSelection from './pages/product-search-selection';
import ReportsAnalytics from './pages/reports-analytics';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<ProductSearchSelection />} />
        <Route path="/sentiment-analysis-processing" element={<SentimentAnalysisProcessing />} />
        <Route path="/user-profile-settings" element={<UserProfileSettings />} />
        <Route path="/sentiment-visualization-dashboard" element={<SentimentVisualizationDashboard />} />
        <Route path="/user-authentication" element={<UserAuthentication />} />
        <Route path="/product-search-selection" element={<ProductSearchSelection />} />
        <Route path="/reports-analytics" element={<ReportsAnalytics />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
