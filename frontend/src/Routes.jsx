// src/Routes.jsx - Updated with Protected Routes
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import SentimentAnalysisProcessing from './pages/sentiment-analysis-processing';
import UserProfileSettings from './pages/user-profile-settings';
import UserAuthentication from './pages/user-authentication';
import ProductSearchSelection from './pages/product-search-selection';
import ReportsAnalytics from './pages/reports-analytics';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/user-authentication" element={<UserAuthentication />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/product-search-selection" 
            element={
              <ProtectedRoute>
                <ProductSearchSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sentiment-analysis-processing" 
            element={
              <ProtectedRoute>
                <SentimentAnalysisProcessing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports-analytics" 
            element={
              <ProtectedRoute>
                <ReportsAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user-profile-settings" 
            element={
              <ProtectedRoute>
                <UserProfileSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;