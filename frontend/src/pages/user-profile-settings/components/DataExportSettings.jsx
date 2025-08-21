// src/pages/user-profile-settings/components/DataExportSettings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const DataExportSettings = ({ exportSettings, onExportSettingsUpdate }) => {
  const [localSettings, setLocalSettings] = useState(exportSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)' },
    { value: 'json', label: 'JSON (JavaScript Object Notation)' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'pdf', label: 'PDF Report' },
    { value: 'xml', label: 'XML (Extensible Markup Language)' }
  ];

  const retentionOptions = [
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: '180', label: '6 months' },
    { value: '365', label: '1 year' },
    { value: 'forever', label: 'Forever' }
  ];

  const handleInputChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCheckboxChange = (key, checked) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const generateApiKey = async () => {
    setIsGeneratingKey(true);
    // Simulate API key generation
    setTimeout(() => {
      const newApiKey = 'sk-' + Math.random()?.toString(36)?.substring(2, 15) + Math.random()?.toString(36)?.substring(2, 15);
      handleInputChange('apiKey', newApiKey);
      setIsGeneratingKey(false);
    }, 1500);
  };

  const copyApiKey = () => {
    navigator.clipboard?.writeText(localSettings?.apiKey);
    // You could add a toast notification here
  };

  const handleSave = () => {
    onExportSettingsUpdate(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(exportSettings);
  };

  const downloadData = (type) => {
    // Simulate data download
    console.log(`Downloading ${type} data...`);
  };

  return (
    <div className="space-y-6">
      {/* API Integration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Key" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">API Integration</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Use the API key to integrate sentiment analysis data with your applications.
            </p>
            <div className="flex items-center gap-2">
              <Icon name="Info" size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">
                Keep your API key secure and never share it publicly
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localSettings?.apiKey}
                  readOnly
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-muted text-foreground font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showApiKey ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyApiKey}
                iconName="Copy"
                iconSize={16}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateApiKey}
              loading={isGeneratingKey}
              iconName="RefreshCw"
              iconPosition="left"
              iconSize={16}
            >
              Generate New Key
            </Button>
            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              iconSize={16}
            >
              Revoke Key
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Checkbox
              checked={localSettings?.enableApiAccess}
              onChange={(e) => handleCheckboxChange('enableApiAccess', e?.target?.checked)}
              label="Enable API access"
              description="Allow external applications to access your data"
            />
            <Checkbox
              checked={localSettings?.rateLimitEnabled}
              onChange={(e) => handleCheckboxChange('rateLimitEnabled', e?.target?.checked)}
              label="Enable rate limiting (1000 requests/hour)"
              description="Prevent excessive API usage"
            />
          </div>
        </div>
      </div>
      {/* Export Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Download" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Export Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <Select
            label="Default Export Format"
            description="Preferred format for data exports"
            options={formatOptions}
            value={localSettings?.defaultFormat}
            onChange={(value) => handleInputChange('defaultFormat', value)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Checkbox
              checked={localSettings?.includeMetadata}
              onChange={(e) => handleCheckboxChange('includeMetadata', e?.target?.checked)}
              label="Include metadata in exports"
              description="Add analysis timestamps and settings"
            />
            <Checkbox
              checked={localSettings?.compressExports}
              onChange={(e) => handleCheckboxChange('compressExports', e?.target?.checked)}
              label="Compress large exports"
              description="Use ZIP compression for files &gt; 10MB"
            />
            <Checkbox
              checked={localSettings?.includeCharts}
              onChange={(e) => handleCheckboxChange('includeCharts', e?.target?.checked)}
              label="Include charts in PDF exports"
              description="Embed visualizations in PDF reports"
            />
            <Checkbox
              checked={localSettings?.anonymizeData}
              onChange={(e) => handleCheckboxChange('anonymizeData', e?.target?.checked)}
              label="Anonymize exported data"
              description="Remove personally identifiable information"
            />
          </div>
        </div>
      </div>
      {/* Data Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Database" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
        </div>
        
        <div className="space-y-4">
          {/* Storage Usage */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Storage Usage</span>
              <span className="text-sm text-muted-foreground">{localSettings?.storageUsed} / {localSettings?.storageLimit}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(localSettings?.storageUsed / localSettings?.storageLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(((localSettings?.storageLimit - localSettings?.storageUsed) / localSettings?.storageLimit) * 100)}% remaining
            </p>
          </div>

          <Select
            label="Data Retention Period"
            description="How long to keep analysis data"
            options={retentionOptions}
            value={localSettings?.retentionPeriod}
            onChange={(value) => handleInputChange('retentionPeriod', value)}
          />

          <div className="space-y-3">
            <Checkbox
              checked={localSettings?.autoCleanup}
              onChange={(e) => handleCheckboxChange('autoCleanup', e?.target?.checked)}
              label="Automatic data cleanup"
              description="Automatically delete old data based on retention period"
            />
            <Checkbox
              checked={localSettings?.backupEnabled}
              onChange={(e) => handleCheckboxChange('backupEnabled', e?.target?.checked)}
              label="Enable data backups"
              description="Create regular backups of your analysis data"
            />
          </div>
        </div>
      </div>
      {/* Quick Export Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="FileText" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Quick Export</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => downloadData('all')}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            All Analysis Data
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadData('recent')}
            iconName="Clock"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Last 30 Days
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadData('favorites')}
            iconName="Star"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Favorite Products
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadData('reports')}
            iconName="BarChart3"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Generated Reports
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadData('settings')}
            iconName="Settings"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Account Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadData('history')}
            iconName="History"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Search History
          </Button>
        </div>
      </div>
      {/* GDPR Compliance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Privacy & Compliance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              In compliance with GDPR and data protection regulations, you have the right to access, modify, or delete your personal data at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => downloadData('personal')}
              iconName="User"
              iconPosition="left"
              iconSize={16}
              className="justify-start"
            >
              Download Personal Data
            </Button>
            <Button
              variant="destructive"
              iconName="Trash2"
              iconPosition="left"
              iconSize={16}
              className="justify-start"
            >
              Request Data Deletion
            </Button>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="default"
          onClick={handleSave}
          iconName="Save"
          iconPosition="left"
          iconSize={16}
        >
          Save Export Settings
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          iconName="RotateCcw"
          iconPosition="left"
          iconSize={16}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default DataExportSettings;