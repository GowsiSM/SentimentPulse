// src/components/ui/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';
import ProfileDropdown from './ProfileDropdown';
import UserProfile from './UserProfile';
import authService from '../../services/authService';

const Header = ({ 
  processingStatus = null,
  onSearchClick, 
  onHistoryClick, 
  className = '',
  showAuth = true 
}) => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { label: 'Dashboard', path: '/sentiment-visualization-dashboard', icon: 'BarChart3' },
    { label: 'Products', path: '/product-search-selection', icon: 'Search' },
    { label: 'Reports', path: '/reports-analytics', icon: 'FileText' }
  ];

  const recentAnalyses = [
    { id: 1, product: 'iPhone 14 Pro', date: '2025-08-17', sentiment: 'positive' },
    { id: 2, product: 'Samsung Galaxy S24', date: '2025-08-16', sentiment: 'mixed' },
    { id: 3, product: 'OnePlus 12', date: '2025-08-15', sentiment: 'positive' }
  ];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await authService.initializeAuth();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setUser(authService.getCurrentUser());
    }
  };

  const isActive = (path) => location?.pathname === path;

  const handleAuthClick = () => {
    navigate('/user-authentication');
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/product-search-selection');
    }
  };

  const handleHistoryItemClick = (analysisId) => {
    if (onHistoryClick) {
      onHistoryClick(analysisId);
    } else {
      navigate(`/sentiment-visualization-dashboard?analysis=${analysisId}`);
    }
    setIsHistoryOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => navigate('/')}
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} color="white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Snapdeal</h1>
                  <p className="text-xs text-muted-foreground">Sentiment Analyzer</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className={`text-muted-foreground hover:text-foreground transition-hover ${
                  isActive('/') ? 'text-foreground bg-accent' : ''
                }`}
              >
                Home
              </Button>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  iconName={item.icon}
                  iconPosition="left"
                  iconSize={16}
                  className="transition-hover"
                >
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Processing Status Indicator */}
              {processingStatus && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">{processingStatus}</span>
                </div>
              )}

              {/* Search Quick Access */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClick}
                className="transition-hover hidden sm:inline-flex"
                title="Search Products"
              >
                <Icon name="Search" size={20} />
              </Button>

              {/* Analysis History Dropdown */}
              {isAuthenticated && (
                <div className="relative hidden sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="transition-hover"
                    title="Recent Analyses"
                  >
                    <Icon name="History" size={20} />
                  </Button>
                  
                  {isHistoryOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsHistoryOpen(false)} 
                      />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-20">
                        <div className="p-4">
                          <h3 className="font-medium text-foreground mb-3">Recent Analyses</h3>
                          <div className="space-y-2">
                            {recentAnalyses.map((analysis) => (
                              <div
                                key={analysis.id}
                                onClick={() => handleHistoryItemClick(analysis.id)}
                                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-hover"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{analysis.product}</p>
                                  <p className="text-xs text-muted-foreground">{analysis.date}</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${
                                  analysis.sentiment === 'positive' ? 'bg-green-500' :
                                  analysis.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Auth Section */}
              {showAuth && (
                <>
                  {isAuthenticated && user ? (
                    <ProfileDropdown
                      user={user}
                      onProfileClick={handleProfileClick}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAuthClick}
                        className="hidden sm:inline-flex"
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleAuthClick}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden transition-hover"
              >
                <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border">
            <nav className="p-4 space-y-2">
              <Button
                variant={isActive('/') ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation('/')}
                iconName="Home"
                iconPosition="left"
                iconSize={16}
                className="w-full justify-start transition-hover"
              >
                Home
              </Button>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  iconName={item.icon}
                  iconPosition="left"
                  iconSize={16}
                  className="w-full justify-start transition-hover"
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchClick}
                iconName="Search"
                iconPosition="left"
                iconSize={16}
                className="w-full justify-start transition-hover"
              >
                Search Products
              </Button>

              {/* Mobile Auth Actions */}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-border space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAuthClick}
                    iconName="LogIn"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAuthClick}
                    iconName="UserPlus"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile History */}
              {isAuthenticated && (
                <div className="pt-2 border-t border-border">
                  <div className="mb-2">
                    <p className="text-sm font-medium text-foreground px-2">Recent Analyses</p>
                  </div>
                  <div className="space-y-1">
                    {recentAnalyses.slice(0, 3).map((analysis) => (
                      <div
                        key={analysis.id}
                        onClick={() => handleHistoryItemClick(analysis.id)}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-hover"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{analysis.product}</p>
                          <p className="text-xs text-muted-foreground">{analysis.date}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          analysis.sentiment === 'positive' ? 'bg-green-500' :
                          analysis.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <UserProfile onClose={handleCloseProfile} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;