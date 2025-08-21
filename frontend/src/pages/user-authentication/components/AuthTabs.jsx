// src/pages/user-authentication/components/AuthTabs.jsx
import React from 'react';
import Button from '../../../components/ui/Button';

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex bg-muted rounded-lg p-1 mb-6">
      <Button
        variant={activeTab === 'login' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTabChange('login')}
        className="flex-1 transition-hover"
      >
        Login
      </Button>
      <Button
        variant={activeTab === 'register' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTabChange('register')}
        className="flex-1 transition-hover"
      >
        Register
      </Button>
    </div>
  );
};

export default AuthTabs;