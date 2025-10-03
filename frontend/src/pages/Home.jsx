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
      color: 'text-blue-600'
    },
    {
      icon: 'TrendingUp',
      title: 'Product Insights',
      description: 'Get actionable insights from customer opinions and ratings',
      color: 'text-green-600'
    },
    {
      icon: 'Compare',
      title: 'Competitor Analysis',
      description: 'Compare multiple products and track market trends',
      color: 'text-purple-600'
    },
    {
      icon: 'FileText',
      title: 'Detailed Reports',
      description: 'Generate comprehensive reports with visual analytics',
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Start New Analysis',
      description: 'Analyze product reviews',
      icon: 'Search',
      action: () => navigate('/product-search-selection'),
      variant: 'default'
    },
    {
      title: 'View Dashboard',
      description: 'See your analytics',
      icon: 'BarChart3',
      action: () => navigate('/sentiment-visualization-dashboard'),
      variant: 'outline'
    },
    {
      title: 'Generate Reports',
      description: 'Create detailed reports',
      icon: 'FileText',
      action: () => navigate('/reports-analytics'),
      variant: 'outline'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Snapdeal 
                <span className="text-blue-600"> Sentiment Analyzer</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform customer reviews into actionable insights with AI-powered sentiment analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  onClick={() => navigate('/product-search-selection')}
                  iconName="Search"
                  iconPosition="left"
                  className="text-lg px-8 py-3"
                >
                  Start Analyzing
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/sentiment-visualization-dashboard')}
                  iconName="BarChart3"
                  iconPosition="left"
                  className="text-lg px-8 py-3"
                >
                  View Demo
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
                <div key={index} className="text-center p-6">
                  <div className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon name={feature.icon} size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Started Quickly
              </h2>
              <p className="text-lg text-gray-600">
                Choose your starting point
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg hover:scale-105 ${
                    action.variant === 'default' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Icon 
                    name={action.icon} 
                    size={24} 
                    className={`mb-3 ${
                      action.variant === 'default' ? 'text-blue-600' : 'text-gray-600'
                    }`} 
                  />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    action.variant === 'default' ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {action.title}
                  </h3>
                  <p className="text-gray-600">
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
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Products Analyzed</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">2M+</div>
                <div className="text-gray-600">Reviews Processed</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Real-time Analysis</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using our sentiment analysis platform to make better decisions
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/product-search-selection')}
              iconName="Search"
              iconPosition="left"
              className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} color="white" />
            </div>
            <span className="text-lg font-bold">Snapdeal Sentiment Analyzer</span>
          </div>
          <p className="text-gray-400">
            Transforming customer feedback into actionable insights
          </p>
          <div className="mt-4 text-sm text-gray-500">
            © 2025 Snapdeal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;