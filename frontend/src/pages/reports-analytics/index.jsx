import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import ReportBuilder from './components/ReportBuilder';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExportManager from './components/ExportManager';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [processingStatus, setProcessingStatus] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Analytics', icon: 'BarChart3' },
    { id: 'reports', label: 'Report Builder', icon: 'FileText' },
    { id: 'historical', label: 'Historical', icon: 'TrendingUp' },
    { id: 'export', label: 'Export', icon: 'Download' }
  ];

  const handleGenerateReport = (config) => {
    setProcessingStatus('Generating report...');
    
    // Simulate report generation
    setTimeout(() => {
      setProcessingStatus(null);
      alert(`Report generated successfully!\nTemplate: ${config?.template}\nFormat: ${config?.outputFormat}`);
    }, 3000);
  };

  const handleExport = (config) => {
    alert(`Export initiated!\nFormat: ${config?.format}\nFile: ${config?.fileName}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'reports':
        return <ReportBuilder onGenerateReport={handleGenerateReport} />;
      case 'historical':
        return <HistoricalAnalysis />;
      case 'export':
        return <ExportManager onExport={handleExport} />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        processingStatus={processingStatus}
        onSearchClick={() => window.location.href = '/product-search-selection'}
        onHistoryClick={(id) => window.location.href = `/sentiment-visualization-dashboard?analysis=${id}`}
        user={{ name: 'Analytics User', email: 'analyst@snapdeal.com' }}
      />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="BarChart3" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                  Comprehensive sentiment analysis reporting and business intelligence
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sentiment-positive/10 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={16} color="var(--color-sentiment-positive)" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">74%</div>
                    <div className="text-xs text-muted-foreground">Avg Sentiment</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={16} color="var(--color-primary)" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">156</div>
                    <div className="text-xs text-muted-foreground">Reports Generated</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="Download" size={16} color="var(--color-warning)" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">89</div>
                    <div className="text-xs text-muted-foreground">Exports This Month</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={16} color="var(--color-secondary)" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">12</div>
                    <div className="text-xs text-muted-foreground">Scheduled Reports</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveTab('reports')}
                iconName="FileText"
                iconPosition="left"
                className="h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Generate Report</div>
                  <div className="text-xs text-muted-foreground mt-1">Create custom analysis</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveTab('export')}
                iconName="Download"
                iconPosition="left"
                className="h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Export Data</div>
                  <div className="text-xs text-muted-foreground mt-1">Download insights</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveTab('historical')}
                iconName="TrendingUp"
                iconPosition="left"
                className="h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">View Trends</div>
                  <div className="text-xs text-muted-foreground mt-1">Historical analysis</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/sentiment-visualization-dashboard'}
                iconName="BarChart3"
                iconPosition="left"
                className="h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Live Dashboard</div>
                  <div className="text-xs text-muted-foreground mt-1">Real-time insights</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsAnalytics;