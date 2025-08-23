// src/pages/sentiment-visualization-dashboard/components/SentimentCharts.jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import Button from '../../../components/ui/Button';

const SentimentCharts = ({ chartData, activeChart, onChartChange }) => {
  const COLORS = {
    positive: '#ffc315',
    negative: '#e06a6e',
    neutral: '#6b7280'
  };

  const chartTypes = [
    { id: 'pie', name: 'Distribution', icon: 'PieChart' },
    { id: 'line', name: 'Trends', icon: 'TrendingUp' },
    { id: 'bar', name: 'Volume', icon: 'BarChart3' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {entry?.value}
              {entry?.name?.includes('Percentage') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData?.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData?.distribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS?.[entry?.name?.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData?.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke={COLORS?.positive} 
                strokeWidth={2}
                name="Positive"
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke={COLORS?.negative} 
                strokeWidth={2}
                name="Negative"
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                stroke={COLORS?.neutral} 
                strokeWidth={2}
                name="Neutral"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData?.volume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="reviews" fill={COLORS?.positive} name="Review Count" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
      {/* Chart Navigation - Mobile */}
      <div className="flex lg:hidden items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Sentiment Analysis</h3>
        <div className="flex items-center space-x-1">
          {chartTypes?.map((chart) => (
            <Button
              key={chart?.id}
              variant={activeChart === chart?.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onChartChange(chart?.id)}
              iconName={chart?.icon}
              iconSize={16}
              className="px-2"
            >
              <span className="sr-only">{chart?.name}</span>
            </Button>
          ))}
        </div>
      </div>
      {/* Chart Navigation - Desktop */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Sentiment Analysis</h3>
        <div className="flex items-center space-x-2">
          {chartTypes?.map((chart) => (
            <Button
              key={chart?.id}
              variant={activeChart === chart?.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onChartChange(chart?.id)}
              iconName={chart?.icon}
              iconPosition="left"
              iconSize={16}
            >
              {chart?.name}
            </Button>
          ))}
        </div>
      </div>
      {/* Chart Container */}
      <div className="h-64 lg:h-80 w-full">
        {renderChart()}
      </div>
      {/* Chart Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: 18/08/2025, 04:37 IST</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS?.positive }}></div>
              <span>Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS?.negative }}></div>
              <span>Negative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS?.neutral }}></div>
              <span>Neutral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentCharts;