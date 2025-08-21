// src/pages/user-authentication/components/SocialLogin.jsx
import React from 'react';
import Button from '../../../components/ui/Button';


const SocialLogin = ({ onSocialLogin, loading }) => {
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'bg-white border border-border hover:bg-gray-50'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: 'Square',
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  ];

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.id}
            variant="outline"
            size="lg"
            onClick={() => onSocialLogin(provider?.id)}
            disabled={loading}
            iconName={provider?.icon}
            iconPosition="left"
            iconSize={20}
            className="transition-hover"
          >
            Continue with {provider?.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SocialLogin;