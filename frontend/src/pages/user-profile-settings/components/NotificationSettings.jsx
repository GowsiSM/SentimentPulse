// src/pages/user-profile-settings/components/NotificationSettings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const NotificationSettings = ({ notifications, onNotificationsUpdate }) => {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Summary' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'never', label: 'Never' }
  ];

  const timeOptions = [
    { value: '09:00', label: '9:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '21:00', label: '9:00 PM' }
  ];

  const handleCheckboxChange = (category, key, checked) => {
    setLocalNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [key]: checked
      }
    }));
  };

  const handleSelectChange = (category, key, value) => {
    setLocalNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onNotificationsUpdate(localNotifications);
  };

  const handleReset = () => {
    setLocalNotifications(notifications);
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Mail" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Checkbox
                checked={localNotifications?.email?.analysisComplete}
                onChange={(e) => handleCheckboxChange('email', 'analysisComplete', e?.target?.checked)}
                label="Analysis completion alerts"
                description="Get notified when sentiment analysis finishes"
              />
              <Checkbox
                checked={localNotifications?.email?.thresholdBreach}
                onChange={(e) => handleCheckboxChange('email', 'thresholdBreach', e?.target?.checked)}
                label="Sentiment threshold breaches"
                description="Alert when sentiment scores cross thresholds"
              />
              <Checkbox
                checked={localNotifications?.email?.weeklyReports}
                onChange={(e) => handleCheckboxChange('email', 'weeklyReports', e?.target?.checked)}
                label="Weekly summary reports"
                description="Comprehensive analysis summaries"
              />
            </div>
            <div className="space-y-3">
              <Checkbox
                checked={localNotifications?.email?.productAlerts}
                onChange={(e) => handleCheckboxChange('email', 'productAlerts', e?.target?.checked)}
                label="Product monitoring alerts"
                description="Updates on tracked products"
              />
              <Checkbox
                checked={localNotifications?.email?.systemUpdates}
                onChange={(e) => handleCheckboxChange('email', 'systemUpdates', e?.target?.checked)}
                label="System updates & maintenance"
                description="Important system notifications"
              />
              <Checkbox
                checked={localNotifications?.email?.marketingEmails}
                onChange={(e) => handleCheckboxChange('email', 'marketingEmails', e?.target?.checked)}
                label="Marketing & promotional emails"
                description="Product updates and feature announcements"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Select
              label="Email Frequency"
              description="How often to receive email notifications"
              options={frequencyOptions}
              value={localNotifications?.email?.frequency}
              onChange={(value) => handleSelectChange('email', 'frequency', value)}
            />
          </div>
        </div>
      </div>
      {/* Push Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Bell" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Push Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Checkbox
                checked={localNotifications?.push?.realTimeAlerts}
                onChange={(e) => handleCheckboxChange('push', 'realTimeAlerts', e?.target?.checked)}
                label="Real-time processing alerts"
                description="Instant notifications for analysis updates"
              />
              <Checkbox
                checked={localNotifications?.push?.errorNotifications}
                onChange={(e) => handleCheckboxChange('push', 'errorNotifications', e?.target?.checked)}
                label="Error & failure notifications"
                description="Alert when analysis fails or encounters errors"
              />
            </div>
            <div className="space-y-3">
              <Checkbox
                checked={localNotifications?.push?.dailyDigest}
                onChange={(e) => handleCheckboxChange('push', 'dailyDigest', e?.target?.checked)}
                label="Daily activity digest"
                description="Summary of daily analysis activity"
              />
              <Checkbox
                checked={localNotifications?.push?.browserNotifications}
                onChange={(e) => handleCheckboxChange('push', 'browserNotifications', e?.target?.checked)}
                label="Browser notifications"
                description="Show notifications in browser"
              />
            </div>
          </div>
        </div>
      </div>
      {/* SMS Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="MessageSquare" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">SMS Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Checkbox
                checked={localNotifications?.sms?.criticalAlerts}
                onChange={(e) => handleCheckboxChange('sms', 'criticalAlerts', e?.target?.checked)}
                label="Critical system alerts"
                description="Important system failures or security issues"
              />
              <Checkbox
                checked={localNotifications?.sms?.accountSecurity}
                onChange={(e) => handleCheckboxChange('sms', 'accountSecurity', e?.target?.checked)}
                label="Account security notifications"
                description="Login attempts and security changes"
              />
            </div>
            <div className="space-y-3">
              <Checkbox
                checked={localNotifications?.sms?.analysisComplete}
                onChange={(e) => handleCheckboxChange('sms', 'analysisComplete', e?.target?.checked)}
                label="Analysis completion (SMS)"
                description="Text message when analysis finishes"
              />
              <div className="text-sm text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                Standard messaging rates may apply
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scheduled Reports */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Calendar" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Scheduled Reports</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select
              label="Report Frequency"
              description="How often to receive automated reports"
              options={frequencyOptions}
              value={localNotifications?.reports?.frequency}
              onChange={(value) => handleSelectChange('reports', 'frequency', value)}
            />
            <Select
              label="Delivery Time"
              description="Preferred time for report delivery"
              options={timeOptions}
              value={localNotifications?.reports?.time}
              onChange={(value) => handleSelectChange('reports', 'time', value)}
            />
          </div>
          
          <div className="space-y-3">
            <Checkbox
              checked={localNotifications?.reports?.includeCharts}
              onChange={(e) => handleCheckboxChange('reports', 'includeCharts', e?.target?.checked)}
              label="Include charts and visualizations"
              description="Embed charts in email reports"
            />
            <Checkbox
              checked={localNotifications?.reports?.includeRawData}
              onChange={(e) => handleCheckboxChange('reports', 'includeRawData', e?.target?.checked)}
              label="Include raw data exports"
              description="Attach CSV files with detailed data"
            />
            <Checkbox
              checked={localNotifications?.reports?.comparativePeriod}
              onChange={(e) => handleCheckboxChange('reports', 'comparativePeriod', e?.target?.checked)}
              label="Include period-over-period comparison"
              description="Compare with previous time periods"
            />
          </div>
        </div>
      </div>
      {/* Notification Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Checkbox
              checked={localNotifications?.preferences?.quietHours}
              onChange={(e) => handleCheckboxChange('preferences', 'quietHours', e?.target?.checked)}
              label="Enable quiet hours (10 PM - 8 AM)"
              description="Suppress non-critical notifications during these hours"
            />
            <Checkbox
              checked={localNotifications?.preferences?.weekendNotifications}
              onChange={(e) => handleCheckboxChange('preferences', 'weekendNotifications', e?.target?.checked)}
              label="Weekend notifications"
              description="Receive notifications on weekends"
            />
            <Checkbox
              checked={localNotifications?.preferences?.groupSimilar}
              onChange={(e) => handleCheckboxChange('preferences', 'groupSimilar', e?.target?.checked)}
              label="Group similar notifications"
              description="Combine related notifications to reduce volume"
            />
            <Checkbox
              checked={localNotifications?.preferences?.soundEnabled}
              onChange={(e) => handleCheckboxChange('preferences', 'soundEnabled', e?.target?.checked)}
              label="Notification sounds"
              description="Play sound for push notifications"
            />
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
          Save Notification Settings
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

export default NotificationSettings;