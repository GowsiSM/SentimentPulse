// src/pages/user-profile-settings/components/SettingsTabs.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SettingsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'account',
      label: 'Account',
      icon: 'User',
      description: 'Personal information and security'
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: 'BarChart3',
      description: 'Sentiment analysis preferences'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      description: 'Email and push notifications'
    },
    {
      id: 'data',
      label: 'Data & Export',
      icon: 'Download',
      description: 'API keys and data management'
    }
  ];

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden lg:block">
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => onTabChange(tab?.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2 mb-6">
          {tabs?.map((tab) => (
            <Button
              key={tab?.id}
              variant={activeTab === tab?.id ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(tab?.id)}
              iconName={tab?.icon}
              iconPosition="left"
              iconSize={16}
              className="justify-start"
            >
              {tab?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Tab Description */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Icon 
            name={tabs?.find(tab => tab?.id === activeTab)?.icon} 
            size={20} 
            className="text-primary" 
          />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {tabs?.find(tab => tab?.id === activeTab)?.label} Settings
            </h2>
            <p className="text-muted-foreground text-sm">
              {tabs?.find(tab => tab?.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsTabs;