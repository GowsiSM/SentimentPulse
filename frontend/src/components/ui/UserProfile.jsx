// src/components/ui/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import Icon from '../AppIcon';
import authService from '../../services/authService';

const UserProfile = ({ onClose, className = '' }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    avatarUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleOptions = [
    { value: 'business-analyst', label: 'Business Analyst' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'marketing-manager', label: 'Marketing Manager' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'small-business-owner', label: 'Small Business Owner' },
    { value: 'consumer', label: 'Consumer' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getProfile();
      setUser(userData);
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        company: userData.company || '',
        role: userData.role || '',
        avatarUrl: userData.avatarUrl || ''
      });
    } catch (error) {
      setError('Failed to load profile');
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Only send fields that can be updated
      const updateData = {
        fullName: formData.fullName,
        company: formData.company,
        role: formData.role,
        avatarUrl: formData.avatarUrl
      };
      
      const updatedUser = await authService.updateProfile(updateData);
      setUser(updatedUser);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      company: user.company || '',
      role: user.role || '',
      avatarUrl: user.avatarUrl || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-lg shadow-card p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
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
          <div>
            <h2 className="text-xl font-semibold text-foreground">User Profile</h2>
            <p className="text-sm text-muted-foreground">Manage your account information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              iconName="Edit2"
              iconPosition="left"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                loading={saving}
                iconName="Save"
                iconPosition="left"
              >
                Save Changes
              </Button>
            </div>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
            
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              disabled={true}
              description="Email cannot be changed"
            />
            
            <Input
              label="Company/Organization"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your company name"
            />
            
            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(value) => handleSelectChange('role', value)}
              disabled={!isEditing}
              placeholder="Select your role"
            />
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Account Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Account Created</label>
                <p className="text-sm text-muted-foreground">{formatDate(user?.createdAt)}</p>
              </div>
              
              {user?.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-foreground">Last Login</label>
                  <p className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-foreground">Account Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <Input
                label="Avatar URL"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
                description="Optional: URL to your profile picture"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;