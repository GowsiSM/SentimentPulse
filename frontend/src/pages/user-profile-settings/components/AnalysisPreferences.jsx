// src/pages/user-profile-settings/components/AnalysisPreferences.jsx
import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AnalysisPreferences = ({ preferences, onPreferencesUpdate }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const nlpModelOptions = [
    { value: 'textblob', label: 'TextBlob', description: 'Fast and simple sentiment analysis' },
    { value: 'vader', label: 'VADER', description: 'Optimized for social media text' },
    { value: 'transformers', label: 'Transformers', description: 'Advanced deep learning models' },
    { value: 'ensemble', label: 'Ensemble', description: 'Combines multiple models for accuracy' }
  ];

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'home', label: 'Home & Kitchen' },
    { value: 'books', label: 'Books & Media' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'beauty', label: 'Beauty & Personal Care' }
  ];

  const visualizationOptions = [
    { value: 'pie', label: 'Pie Charts' },
    { value: 'bar', label: 'Bar Charts' },
    { value: 'line', label: 'Line Graphs' },
    { value: 'scatter', label: 'Scatter Plots' },
    { value: 'heatmap', label: 'Heat Maps' }
  ];

  const handleSliderChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      sentimentThresholds: {
        ...prev?.sentimentThresholds,
        [key]: value
      }
    }));
  };

  const handleSelectChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCheckboxChange = (key, checked) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleSave = () => {
    onPreferencesUpdate(localPreferences);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
  };

  return (
    <div className="space-y-6">
      {/* NLP Model Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">NLP Model Preferences</h3>
        <div className="space-y-4">
          <Select
            label="Primary Analysis Model"
            description="Choose the main model for sentiment analysis"
            options={nlpModelOptions}
            value={localPreferences?.primaryModel}
            onChange={(value) => handleSelectChange('primaryModel', value)}
          />
          <Select
            label="Fallback Model"
            description="Secondary model used when primary fails"
            options={nlpModelOptions?.filter(opt => opt?.value !== localPreferences?.primaryModel)}
            value={localPreferences?.fallbackModel}
            onChange={(value) => handleSelectChange('fallbackModel', value)}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={localPreferences?.enableEnsemble}
              onChange={(e) => handleCheckboxChange('enableEnsemble', e?.target?.checked)}
              label="Enable ensemble analysis for higher accuracy"
              description="Uses multiple models and averages results"
            />
          </div>
        </div>
      </div>
      {/* Sentiment Thresholds */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Thresholds</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Positive Threshold: {localPreferences?.sentimentThresholds?.positive}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={localPreferences?.sentimentThresholds?.positive}
              onChange={(e) => handleSliderChange('positive', parseFloat(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.1</span>
              <span>1.0</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Negative Threshold: {localPreferences?.sentimentThresholds?.negative}
            </label>
            <input
              type="range"
              min="-1.0"
              max="-0.1"
              step="0.1"
              value={localPreferences?.sentimentThresholds?.negative}
              onChange={(e) => handleSliderChange('negative', parseFloat(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>-1.0</span>
              <span>-0.1</span>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Scores between {localPreferences?.sentimentThresholds?.negative} and {localPreferences?.sentimentThresholds?.positive} will be classified as neutral.
            </p>
          </div>
        </div>
      </div>
      {/* Default Categories */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Default Product Categories</h3>
        <Select
          label="Preferred Categories"
          description="Categories to show first in product search"
          options={categoryOptions}
          value={localPreferences?.defaultCategories}
          onChange={(value) => handleSelectChange('defaultCategories', value)}
          multiple
          searchable
        />
      </div>
      {/* Visualization Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Visualization Preferences</h3>
        <div className="space-y-4">
          <Select
            label="Default Chart Types"
            description="Preferred visualization formats for sentiment data"
            options={visualizationOptions}
            value={localPreferences?.preferredCharts}
            onChange={(value) => handleSelectChange('preferredCharts', value)}
            multiple
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localPreferences?.showPercentages}
                onChange={(e) => handleCheckboxChange('showPercentages', e?.target?.checked)}
                label="Show percentages on charts"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localPreferences?.animateCharts}
                onChange={(e) => handleCheckboxChange('animateCharts', e?.target?.checked)}
                label="Enable chart animations"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localPreferences?.darkMode}
                onChange={(e) => handleCheckboxChange('darkMode', e?.target?.checked)}
                label="Dark mode for charts"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localPreferences?.exportHighRes}
                onChange={(e) => handleCheckboxChange('exportHighRes', e?.target?.checked)}
                label="High-resolution exports"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Processing Options */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Processing Options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Maximum Reviews per Analysis: {localPreferences?.maxReviews}
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={localPreferences?.maxReviews}
              onChange={(e) => handleSelectChange('maxReviews', parseInt(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localPreferences?.autoSave}
                onChange={(e) => handleCheckboxChange('autoSave', e?.target?.checked)}
                label="Auto-save analysis results"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localPreferences?.parallelProcessing}
                onChange={(e) => handleCheckboxChange('parallelProcessing', e?.target?.checked)}
                label="Enable parallel processing"
              />
            </div>
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
          Save Preferences
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

export default AnalysisPreferences;