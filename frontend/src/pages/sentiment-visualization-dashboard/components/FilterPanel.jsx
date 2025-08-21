import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const sentimentOptions = [
    { value: 'all', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive Only' },
    { value: 'negative', label: 'Negative Only' },
    { value: 'neutral', label: 'Neutral Only' }
  ];

  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'snapdeal', label: 'Snapdeal Reviews' },
    { value: 'verified', label: 'Verified Purchases Only' },
    { value: 'recent', label: 'Recent Reviews' }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      sentiment: 'all',
      dateRange: 'last30days',
      source: 'all',
      minScore: 0,
      maxScore: 100,
      startDate: '',
      endDate: ''
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      {/* Filter Panel */}
      <div className={`
        fixed lg:relative top-0 right-0 h-full lg:h-auto w-80 lg:w-full
        bg-background lg:bg-card border-l lg:border border-border
        transform transition-transform duration-300 z-50 lg:z-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:rounded-lg lg:p-6 p-4
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-4">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-6">
          {/* Sentiment Filter */}
          <div>
            <Select
              label="Sentiment Type"
              options={sentimentOptions}
              value={localFilters?.sentiment}
              onChange={(value) => handleFilterChange('sentiment', value)}
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={localFilters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />
          </div>

          {/* Custom Date Range */}
          {localFilters?.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Date"
                type="date"
                value={localFilters?.startDate}
                onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={localFilters?.endDate}
                onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
              />
            </div>
          )}

          {/* Source Filter */}
          <div>
            <Select
              label="Review Source"
              options={sourceOptions}
              value={localFilters?.source}
              onChange={(value) => handleFilterChange('source', value)}
            />
          </div>

          {/* Sentiment Score Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Sentiment Score Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Score"
                type="number"
                min="0"
                max="100"
                value={localFilters?.minScore}
                onChange={(e) => handleFilterChange('minScore', parseInt(e?.target?.value) || 0)}
              />
              <Input
                label="Max Score"
                type="number"
                min="0"
                max="100"
                value={localFilters?.maxScore}
                onChange={(e) => handleFilterChange('maxScore', parseInt(e?.target?.value) || 100)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-border">
            <Button
              variant="default"
              onClick={handleApplyFilters}
              iconName="Filter"
              iconPosition="left"
              iconSize={16}
              fullWidth
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={16}
              fullWidth
            >
              Reset Filters
            </Button>
          </div>

          {/* Active Filters Summary */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">Active Filters</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Sentiment: {sentimentOptions?.find(opt => opt?.value === localFilters?.sentiment)?.label}</p>
              <p>Date: {dateRangeOptions?.find(opt => opt?.value === localFilters?.dateRange)?.label}</p>
              <p>Source: {sourceOptions?.find(opt => opt?.value === localFilters?.source)?.label}</p>
              <p>Score: {localFilters?.minScore}% - {localFilters?.maxScore}%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;