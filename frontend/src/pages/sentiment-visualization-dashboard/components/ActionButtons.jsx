import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const ActionButtons = ({ onGenerateReport, onCompareProducts, onScheduleUpdates, isGeneratingReport }) => {
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);

  const scheduleOptions = [
    { id: 'daily', label: 'Daily Updates', icon: 'Calendar' },
    { id: 'weekly', label: 'Weekly Reports', icon: 'CalendarDays' },
    { id: 'monthly', label: 'Monthly Analysis', icon: 'CalendarRange' }
  ];

  const handleScheduleOption = (optionId) => {
    onScheduleUpdates(optionId);
    setShowScheduleOptions(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <Button
          variant="default"
          onClick={onGenerateReport}
          loading={isGeneratingReport}
          iconName="FileText"
          iconPosition="left"
          iconSize={16}
          fullWidth
        >
          Generate Report
        </Button>

        <Button
          variant="outline"
          onClick={onCompareProducts}
          iconName="GitCompare"
          iconPosition="left"
          iconSize={16}
          fullWidth
        >
          Compare Products
        </Button>

        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setShowScheduleOptions(!showScheduleOptions)}
            iconName="Clock"
            iconPosition="left"
            iconSize={16}
            fullWidth
          >
            Schedule Updates
          </Button>

          {showScheduleOptions && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowScheduleOptions(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-modal z-50">
                <div className="p-2">
                  {scheduleOptions?.map((option) => (
                    <Button
                      key={option?.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleScheduleOption(option?.id)}
                      iconName={option?.icon}
                      iconPosition="left"
                      iconSize={14}
                      className="w-full justify-start mb-1 last:mb-0"
                    >
                      {option?.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Secondary Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          iconName="Download"
          iconPosition="left"
          iconSize={14}
          fullWidth
        >
          Export CSV
        </Button>

        <Button
          variant="ghost"
          size="sm"
          iconName="Share"
          iconPosition="left"
          iconSize={14}
          fullWidth
        >
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          iconName="Bookmark"
          iconPosition="left"
          iconSize={14}
          fullWidth
        >
          Save View
        </Button>

        <Button
          variant="ghost"
          size="sm"
          iconName="RefreshCw"
          iconPosition="left"
          iconSize={14}
          fullWidth
        >
          Refresh
        </Button>
      </div>
      {/* Export Options */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">Export Options</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="xs"
            iconName="FileText"
            iconPosition="left"
            iconSize={12}
          >
            PDF Report
          </Button>
          <Button
            variant="outline"
            size="xs"
            iconName="Table"
            iconPosition="left"
            iconSize={12}
          >
            Excel Data
          </Button>
          <Button
            variant="outline"
            size="xs"
            iconName="Image"
            iconPosition="left"
            iconSize={12}
          >
            Chart Images
          </Button>
          <Button
            variant="outline"
            size="xs"
            iconName="Code"
            iconPosition="left"
            iconSize={12}
          >
            Raw JSON
          </Button>
        </div>
      </div>
      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-sentiment-positive rounded-full"></div>
            <span className="text-muted-foreground">Data up to date</span>
          </div>
          <span className="text-muted-foreground">
            Last sync: 18/08/2025, 04:30 IST
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;