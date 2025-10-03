// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: 'BarChart3',
      title: 'Sentiment Analysis',
      description: 'Analyze customer reviews and feedback to understand product sentiment',
      color: 'text-[#E40046]'
    },
    {
      icon: 'TrendingUp',
      title: 'Product Insights',
      description: 'Get actionable insights from customer opinions and ratings',
      color: 'text-[#E40046]'
    },
    {
      icon: 'Compare',
      title: 'Competitor Analysis',
      description: 'Compare multiple products and track market trends',
      color: 'text-[#E40046]'
    },
    {
      icon: 'FileText',
      title: 'Detailed Reports',
      description: 'Generate comprehensive reports with visual analytics',
      color: 'text-[#E40046]'
    }
  ];

  const quickActions = [
    {
      title: 'Start New Analysis',
      description: 'Analyze product reviews and get insights',
      icon: 'Search',
      action: () => navigate('/product-search-selection'),
      variant: 'default'
    },
    {
      title: 'View Reports',
      description: 'See your analytics and reports',
      icon: 'BarChart3',
      action: () => navigate('/reports-analytics'),
      variant: 'outline'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Products Analyzed' },
    { value: '2M+', label: 'Reviews Processed' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Real-time Analysis' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-white to-red-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="w-20 h-20 bg-[#E40046] rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Icon name="TrendingUp" size={40} color="white" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Snapdeal 
                <span className="text-[#E40046]"> Sentiment Analyzer</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform customer reviews into actionable insights with AI-powered sentiment analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  onClick={() => navigate('/product-search-selection')}
                  iconName="Search"
                  iconPosition="left"
                  className="text-lg px-8 py-3 bg-[#E40046] hover:bg-[#C3003A]"
                >
                  Start Analyzing
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/reports-analytics')}
                  iconName="BarChart3"
                  iconPosition="left"
                  className="text-lg px-8 py-3 border-[#E40046] text-[#E40046] hover:bg-[#E40046] hover:text-white"
                >
                  View Reports
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to understand customer sentiment and make data-driven decisions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name={feature.icon} size={32} className="text-[#E40046]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Started Quickly
              </h2>
              <p className="text-lg text-gray-600">
                Choose your starting point
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-8 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                    action.variant === 'default' 
                      ? 'border-[#E40046] bg-[#E40046] text-white' 
                      : 'border-[#E40046] bg-white text-[#E40046] hover:bg-[#E40046] hover:text-white'
                  }`}
                >
                  <Icon 
                    name={action.icon} 
                    size={32} 
                    className="mb-4" 
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm opacity-90">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="p-6">
                  <div className="text-3xl lg:text-4xl font-bold text-[#E40046] mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#E40046]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using our sentiment analysis platform to make better decisions
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/products')}
              iconName="Search"
              iconPosition="left"
              className="text-lg px-8 py-3 bg-white text-[#E40046] hover:bg-gray-100 font-semibold"
            >
              Start Free Analysis
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#E40046] rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} color="white" />
            </div>
            <span className="text-lg font-bold">Snapdeal Sentiment Analyzer</span>
          </div>
          <p className="text-gray-400 mb-2">
            Transforming customer feedback into actionable insights
          </p>
          <div className="text-sm text-gray-500">
            © 2025 Snapdeal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;