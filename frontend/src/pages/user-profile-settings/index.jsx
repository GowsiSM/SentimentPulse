// snapdeal_sentiment_analyzer/src/pages/user-profile-settings/index.jsx
import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import ProfileCard from './components/ProfileCard';
import SettingsTabs from './components/SettingsTabs';
import AccountSettings from './components/AccountSettings';
import AnalysisPreferences from './components/AnalysisPreferences';
import NotificationSettings from './components/NotificationSettings';
import DataExportSettings from './components/DataExportSettings';

const UserProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('account');

  // Mock user data
  const mockUser = {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@techcorp.com",
    company: "TechCorp Solutions",
    role: "Product Manager",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    accountStatus: "verified",
    emailVerified: true,
    twoFactorEnabled: false,
    emailNotifications: true,
    memberSince: "March 2023",
    loginActivity: [
      {
        location: "Mumbai, India",
        device: "desktop",
        browser: "Chrome 118",
        date: "18/08/2025",
        time: "09:15 AM"
      },
      {
        location: "Mumbai, India",
        device: "mobile",
        browser: "Safari iOS",
        date: "17/08/2025",
        time: "06:30 PM"
      },
      {
        location: "Delhi, India",
        device: "desktop",
        browser: "Firefox 117",
        date: "16/08/2025",
        time: "02:45 PM"
      }
    ]
  };

  // Mock analysis preferences
  const mockPreferences = {
    primaryModel: "transformers",
    fallbackModel: "vader",
    enableEnsemble: true,
    sentimentThresholds: {
      positive: 0.6,
      negative: -0.6
    },
    defaultCategories: ["electronics", "fashion"],
    preferredCharts: ["pie", "bar", "line"],
    showPercentages: true,
    animateCharts: true,
    darkMode: false,
    exportHighRes: true,
    maxReviews: 5000,
    autoSave: true,
    parallelProcessing: true
  };

  // Mock notification settings
  const mockNotifications = {
    email: {
      analysisComplete: true,
      thresholdBreach: true,
      weeklyReports: true,
      productAlerts: false,
      systemUpdates: true,
      marketingEmails: false,
      frequency: "immediate"
    },
    push: {
      realTimeAlerts: true,
      errorNotifications: true,
      dailyDigest: false,
      browserNotifications: true
    },
    sms: {
      criticalAlerts: true,
      accountSecurity: true,
      analysisComplete: false
    },
    reports: {
      frequency: "weekly",
      time: "09:00",
      includeCharts: true,
      includeRawData: false,
      comparativePeriod: true
    },
    preferences: {
      quietHours: true,
      weekendNotifications: false,
      groupSimilar: true,
      soundEnabled: true
    }
  };

  // Mock export settings
  const mockExportSettings = {
    apiKey: "sk-1234567890abcdef1234567890abcdef",
    enableApiAccess: true,
    rateLimitEnabled: true,
    defaultFormat: "csv",
    includeMetadata: true,
    compressExports: true,
    includeCharts: true,
    anonymizeData: false,
    storageUsed: 2.4,
    storageLimit: 10.0,
    retentionPeriod: "365",
    autoCleanup: true,
    backupEnabled: true
  };

  const handleProfileUpdate = (updatedProfile) => {
    console.log('Profile updated:', updatedProfile);
    // In a real app, this would make an API call
  };

  const handleSettingsUpdate = (settingsData) => {
    console.log('Settings updated:', settingsData);
    // In a real app, this would make an API call
  };

  const handlePreferencesUpdate = (updatedPreferences) => {
    console.log('Preferences updated:', updatedPreferences);
    // In a real app, this would make an API call
  };

  const handleNotificationsUpdate = (updatedNotifications) => {
    console.log('Notifications updated:', updatedNotifications);
    // In a real app, this would make an API call
  };

  const handleExportSettingsUpdate = (updatedExportSettings) => {
    console.log('Export settings updated:', updatedExportSettings);
    // In a real app, this would make an API call
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountSettings 
            user={mockUser} 
            onSettingsUpdate={handleSettingsUpdate}
          />
        );
      case 'analysis':
        return (
          <AnalysisPreferences 
            preferences={mockPreferences}
            onPreferencesUpdate={handlePreferencesUpdate}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings 
            notifications={mockNotifications}
            onNotificationsUpdate={handleNotificationsUpdate}
          />
        );
      case 'data':
        return (
          <DataExportSettings 
            exportSettings={mockExportSettings}
            onExportSettingsUpdate={handleExportSettingsUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={mockUser} 
        onSearchClick={() => {}}
        onHistoryClick={() => {}}
      />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Profile & Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information, analysis preferences, and notification settings
            </p>
          </div>

          {/* Profile Card */}
          <div className="mb-8">
            <ProfileCard 
              user={mockUser} 
              onProfileUpdate={handleProfileUpdate}
            />
          </div>

          {/* Settings Tabs */}
          <SettingsTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfileSettings;