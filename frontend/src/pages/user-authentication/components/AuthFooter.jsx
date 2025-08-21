// src/pages/user-authentication/components/AuthFooter.jsx
import React from 'react';
import Button from '../../../components/ui/Button';

const AuthFooter = ({ activeTab, onTabChange }) => {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-muted-foreground">
        {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
        {' '}
        <Button
          variant="link"
          size="sm"
          onClick={() => onTabChange(activeTab === 'login' ? 'register' : 'login')}
          className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
        >
          {activeTab === 'login' ? 'Sign up' : 'Sign in'}
        </Button>
      </p>
      
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <Button
            variant="link"
            size="sm"
            onClick={() => window.open('/terms', '_blank')}
            className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
          >
            Terms of Service
          </Button>
          {' '}and{' '}
          <Button
            variant="link"
            size="sm"
            onClick={() => window.open('/privacy', '_blank')}
            className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
          >
            Privacy Policy
          </Button>
        </p>
      </div>
    </div>
  );
};

export default AuthFooter;