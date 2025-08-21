// src/pages/user-authentication/components/AuthHeader.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const AuthHeader = ({ activeTab }) => {
  const getHeaderContent = () => {
    if (activeTab === 'login') {
      return {
        title: 'Welcome Back',
        subtitle: 'Sign in to your Snapdeal Sentiment Analyzer account'
      };
    }
    return {
      title: 'Create Account',
      subtitle: 'Join thousands of users analyzing product sentiment'
    };
  };

  const { title, subtitle } = getHeaderContent();

  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <Icon name="TrendingUp" size={28} color="white" />
        </div>
        <div className="ml-3">
          <h1 className="text-2xl font-bold text-foreground">Snapdeal</h1>
          <p className="text-sm text-muted-foreground">Sentiment Analyzer</p>
        </div>
      </div>

      {/* Header Text */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthHeader;