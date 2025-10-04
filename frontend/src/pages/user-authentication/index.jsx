// src/pages/user-authentication/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AuthTabs from './components/AuthTabs';
import AuthHeader from './components/AuthHeader';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AuthFooter from './components/AuthFooter';
import authService from '../../services/authService';

const UserAuthentication = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/product-search-selection');
    }
  }, [navigate]);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    try {
      await authService.login(formData);
      navigate('/product-search-selection');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');

    try {
      await authService.register(formData);
      navigate('/product-search-selection');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearchClick={() => {}}
        onHistoryClick={() => {}}
      />
      
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl shadow-card p-8">
            <AuthHeader activeTab={activeTab} />
            
            <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />
            
            {activeTab === 'login' ? (
              <LoginForm
                onSubmit={handleLogin}
                loading={loading}
                error={error}
              />
            ) : (
              <RegisterForm
                onSubmit={handleRegister}
                loading={loading}
                error={error}
              />
            )}
            
            <AuthFooter
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default UserAuthentication;
