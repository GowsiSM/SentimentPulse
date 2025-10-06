import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, HelpCircle, LogOut, ChevronDown, Bell, Shield, Moon, Sun, Languages } from 'lucide-react';

const ProfileDropdown = ({ user, onProfileClick, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState('light');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // await authService.logout();
      setTimeout(() => {
        navigate('/user-authentication');
      }, 500);
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/user-authentication');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const menuSections = [
    {
      items: [
        {
          icon: User,
          label: 'View Profile',
          description: 'Manage your personal information',
          onClick: () => {
            setIsOpen(false);
            onProfileClick();
          }
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Configure alert preferences',
          badge: user?.unreadNotifications || 0,
          onClick: () => {
            setIsOpen(false);
            console.log('Notifications clicked');
          }
        }
      ]
    },
    {
      items: [
        {
          icon: Settings,
          label: 'Settings',
          description: 'Account and privacy settings',
          onClick: () => {
            setIsOpen(false);
            console.log('Settings clicked');
          }
        },
        {
          icon: Shield,
          label: 'Security',
          description: 'Password and authentication',
          onClick: () => {
            setIsOpen(false);
            console.log('Security clicked');
          }
        },
        {
          icon: Languages,
          label: 'Language',
          description: user?.language || 'English',
          onClick: () => {
            setIsOpen(false);
            console.log('Language clicked');
          }
        }
      ]
    },
    {
      items: [
        {
          icon: theme === 'light' ? Moon : Sun,
          label: 'Appearance',
          description: `${theme === 'light' ? 'Dark' : 'Light'} mode`,
          onClick: toggleTheme,
          isToggle: true
        }
      ]
    },
    {
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'Get help and documentation',
          onClick: () => {
            setIsOpen(false);
            window.open('/help', '_blank');
          }
        }
      ]
    },
    {
      items: [
        {
          icon: LogOut,
          label: 'Sign Out',
          description: 'Sign out of your account',
          onClick: handleLogout,
          loading: isLoggingOut,
          variant: 'destructive'
        }
      ]
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            getUserInitials()
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-foreground leading-tight">
            {user?.fullName || 'User'}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {user?.role?.replace('-', ' ') || 'User'}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Header Section */}
            <div className="p-4 bg-accent/50 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-base shadow-sm flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-base truncate">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-0.5">
                    {user?.email}
                  </div>
                  {user?.company && (
                    <div className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {user.company}
                    </div>
                  )}
                  {user?.memberSince && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Member since {user.memberSince}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Menu Sections */}
            <div className="py-1 max-h-96 overflow-y-auto">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {sectionIndex > 0 && (
                    <div className="border-t border-border my-1" />
                  )}
                  <div className="py-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={itemIndex}
                          onClick={item.onClick}
                          disabled={item.loading}
                          className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                            item.variant === 'destructive'
                              ? 'text-destructive hover:bg-destructive/10'
                              : 'text-foreground hover:bg-accent'
                          } ${item.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${item.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.label}</span>
                              {item.badge > 0 && (
                                <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.loading && (
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-accent/30 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                Version 2.0.1 · <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a> · <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;
