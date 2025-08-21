import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ReportBuilder = ({ onGenerateReport }) => {
  const [reportConfig, setReportConfig] = useState({
    template: '',
    dateRange: 'last_30_days',
    startDate: '',
    endDate: '',
    categories: [],
    sentimentThreshold: 'all',
    outputFormat: 'pdf'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates = [
    { value: 'executive_summary', label: 'Executive Summary', description: 'High-level insights for leadership' },
    { value: 'detailed_analysis', label: 'Detailed Sentiment Analysis', description: 'Comprehensive review breakdown' },
    { value: 'competitive_comparison', label: 'Competitive Comparison', description: 'Compare with competitor products' },
    { value: 'trend_analysis', label: 'Trend Analysis', description: 'Historical sentiment patterns' }
  ];

  const dateRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'home_kitchen', label: 'Home & Kitchen' },
    { value: 'books', label: 'Books & Media' },
    { value: 'sports', label: 'Sports & Fitness' }
  ];

  const sentimentOptions = [
    { value: 'all', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive Only' },
    { value: 'negative', label: 'Negative Only' },
    { value: 'neutral', label: 'Neutral Only' },
    { value: 'mixed', label: 'Mixed Sentiments' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Report' },
    { value: 'csv', label: 'CSV Data' },
    { value: 'excel', label: 'Excel Workbook' },
    { value: 'json', label: 'JSON Data' }
  ];

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = async () => {
    if (!reportConfig?.template) {
      alert('Please select a report template');
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      if (onGenerateReport) {
        onGenerateReport(reportConfig);
      }
    }, 3000);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="FileText" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Report Builder</h2>
          <p className="text-sm text-muted-foreground">Create custom sentiment analysis reports</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Template Selection */}
        <div className="space-y-4">
          <Select
            label="Report Template"
            placeholder="Choose a report template"
            options={reportTemplates}
            value={reportConfig?.template}
            onChange={(value) => handleConfigChange('template', value)}
            required
          />

          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={reportConfig?.dateRange}
            onChange={(value) => handleConfigChange('dateRange', value)}
          />

          {reportConfig?.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={reportConfig?.startDate}
                onChange={(e) => handleConfigChange('startDate', e?.target?.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={reportConfig?.endDate}
                onChange={(e) => handleConfigChange('endDate', e?.target?.value)}
              />
            </div>
          )}
        </div>

        {/* Filters and Options */}
        <div className="space-y-4">
          <Select
            label="Product Categories"
            placeholder="Select categories (optional)"
            options={categoryOptions}
            value={reportConfig?.categories}
            onChange={(value) => handleConfigChange('categories', value)}
            multiple
            searchable
          />

          <Select
            label="Sentiment Filter"
            options={sentimentOptions}
            value={reportConfig?.sentimentThreshold}
            onChange={(value) => handleConfigChange('sentimentThreshold', value)}
          />

          <Select
            label="Output Format"
            options={formatOptions}
            value={reportConfig?.outputFormat}
            onChange={(value) => handleConfigChange('outputFormat', value)}
          />
        </div>
      </div>
      {/* Generate Button */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
        <Button
          variant="default"
          size="lg"
          onClick={handleGenerateReport}
          loading={isGenerating}
          iconName="Download"
          iconPosition="left"
          className="flex-1 sm:flex-none"
        >
          {isGenerating ? 'Generating Report...' : 'Generate Report'}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          iconName="Clock"
          iconPosition="left"
          className="flex-1 sm:flex-none"
        >
          Schedule Delivery
        </Button>
      </div>
      {/* Quick Templates */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Templates</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {reportTemplates?.map((template) => (
            <Button
              key={template?.value}
              variant="ghost"
              size="sm"
              onClick={() => handleConfigChange('template', template?.value)}
              className="h-auto p-3 text-left justify-start"
            >
              <div>
                <div className="font-medium text-xs">{template?.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{template?.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;