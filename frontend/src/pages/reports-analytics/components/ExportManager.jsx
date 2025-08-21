import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ExportManager = ({ onExport }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    emailDelivery: false,
    scheduledDelivery: false,
    deliveryFrequency: 'weekly',
    recipients: '',
    fileName: `sentiment_report_${new Date()?.toISOString()?.split('T')?.[0]}`
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    {
      id: 1,
      fileName: 'executive_summary_2025-08-17.pdf',
      format: 'PDF',
      size: '2.4 MB',
      date: '2025-08-17 14:30',
      status: 'completed'
    },
    {
      id: 2,
      fileName: 'detailed_analysis_2025-08-16.xlsx',
      format: 'Excel',
      size: '5.7 MB',
      date: '2025-08-16 09:15',
      status: 'completed'
    },
    {
      id: 3,
      fileName: 'trend_analysis_2025-08-15.csv',
      format: 'CSV',
      size: '1.2 MB',
      date: '2025-08-15 16:45',
      status: 'completed'
    }
  ]);

  const formatOptions = [
    { value: 'pdf', label: 'PDF Report', description: 'Formatted document with charts' },
    { value: 'excel', label: 'Excel Workbook', description: 'Spreadsheet with multiple sheets' },
    { value: 'csv', label: 'CSV Data', description: 'Raw data in comma-separated format' },
    { value: 'json', label: 'JSON Data', description: 'Structured data for API integration' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const handleConfigChange = (field, value) => {
    setExportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      const newExport = {
        id: exportHistory?.length + 1,
        fileName: `${exportConfig?.fileName}.${exportConfig?.format}`,
        format: exportConfig?.format?.toUpperCase(),
        size: `${(Math.random() * 5 + 1)?.toFixed(1)} MB`,
        date: new Date()?.toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'completed'
      };
      
      setExportHistory(prev => [newExport, ...prev]);
      setIsExporting(false);
      
      if (onExport) {
        onExport(exportConfig);
      }
    }, 2500);
  };

  const handleDownload = (exportItem) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = exportItem?.fileName;
    link?.click();
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Download" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Export Manager</h2>
            <p className="text-sm text-muted-foreground">Configure and download your reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Settings */}
          <div className="space-y-4">
            <Select
              label="Export Format"
              options={formatOptions}
              value={exportConfig?.format}
              onChange={(value) => handleConfigChange('format', value)}
            />

            <Input
              label="File Name"
              type="text"
              value={exportConfig?.fileName}
              onChange={(e) => handleConfigChange('fileName', e?.target?.value)}
              placeholder="Enter file name"
            />

            <div className="space-y-3">
              <Checkbox
                label="Include Charts & Visualizations"
                checked={exportConfig?.includeCharts}
                onChange={(e) => handleConfigChange('includeCharts', e?.target?.checked)}
              />
              
              <Checkbox
                label="Include Raw Data"
                description="Add detailed review data to export"
                checked={exportConfig?.includeRawData}
                onChange={(e) => handleConfigChange('includeRawData', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Checkbox
                label="Email Delivery"
                description="Send report via email"
                checked={exportConfig?.emailDelivery}
                onChange={(e) => handleConfigChange('emailDelivery', e?.target?.checked)}
              />
              
              {exportConfig?.emailDelivery && (
                <Input
                  label="Email Recipients"
                  type="email"
                  value={exportConfig?.recipients}
                  onChange={(e) => handleConfigChange('recipients', e?.target?.value)}
                  placeholder="Enter email addresses (comma separated)"
                />
              )}
            </div>

            <div className="space-y-3">
              <Checkbox
                label="Scheduled Delivery"
                description="Automatically generate and send reports"
                checked={exportConfig?.scheduledDelivery}
                onChange={(e) => handleConfigChange('scheduledDelivery', e?.target?.checked)}
              />
              
              {exportConfig?.scheduledDelivery && (
                <Select
                  label="Delivery Frequency"
                  options={frequencyOptions}
                  value={exportConfig?.deliveryFrequency}
                  onChange={(value) => handleConfigChange('deliveryFrequency', value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
          <Button
            variant="default"
            size="lg"
            onClick={handleExport}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            {isExporting ? 'Exporting...' : 'Export Now'}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            iconName="Calendar"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Schedule Export
          </Button>
        </div>
      </div>
      {/* Export History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Export History</h3>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {exportHistory?.map((item) => (
            <div key={item?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-hover">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon 
                    name={
                      item?.format === 'PDF' ? 'FileText' :
                      item?.format === 'EXCEL' ? 'Sheet' :
                      item?.format === 'CSV'? 'Database' : 'File'
                    } 
                    size={16} 
                    color="var(--color-primary)" 
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item?.fileName}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{item?.format}</span>
                    <span>{item?.size}</span>
                    <span>{item?.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  item?.status === 'completed' ? 'bg-sentiment-positive' :
                  item?.status === 'processing'? 'bg-warning' : 'bg-sentiment-negative'
                }`}></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(item)}
                  iconName="Download"
                  iconPosition="left"
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>

        {exportHistory?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="FileX" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <p className="text-muted-foreground">No export history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportManager;