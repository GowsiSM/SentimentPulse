// src/components/ui/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';
import authService from '../../services/authService';

const ProfileDropdown = ({ user, onProfileClick, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
      await authService.logout();
      navigate('/user-authentication');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force local logout even if API fails
      authService.clearAuthData();
      navigate('/user-authentication');
    }
  };

  const menuItems = [
    {
      icon: 'User',
      label: 'View Profile',
      onClick: () => {
        setIsOpen(false);
        onProfileClick();
      }
    },
    {
      icon: 'Settings',
      label: 'Settings',
      onClick: () => {
        setIsOpen(false);
        // Navigate to settings page when implemented
        console.log('Settings clicked');
      }
    },
    {
      icon: 'HelpCircle',
      label: 'Help & Support',
      onClick: () => {
        setIsOpen(false);
        window.open('/help', '_blank');
      }
    },
    { divider: true },
    {
      icon: 'LogOut',
      label: 'Sign Out',
      onClick: handleLogout,
      loading: isLoggingOut,
      variant: 'destructive'
    }
  ];

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 h-auto"
      >
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getUserInitials()
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">
            {user?.fullName || 'User'}
          </div>
          <div className="text-xs text-muted-foreground">
            {user?.role?.replace('-', ' ') || 'User'}
          </div>
        </div>
        <Icon
          name="ChevronDown"
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-20">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </div>
                  {user?.company && (
                    <div className="text-xs text-muted-foreground truncate">
                      {user.company}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="py-2">
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return <div key={index} className="border-t border-border my-2" />;
                }
                
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    disabled={item.loading}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      item.variant === 'destructive'
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'text-foreground hover:bg-accent'
                    } ${item.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                    {item.loading && (
                      <div className="ml-auto">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;

