// src/pages/user-profile-settings/components/AccountSettings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AccountSettings = ({ user, onSettingsUpdate }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled);
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e?.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPasswordStrength = (password) => {
    if (password?.length < 6) return { strength: 'weak', color: 'text-destructive' };
    if (password?.length < 10) return { strength: 'medium', color: 'text-warning' };
    return { strength: 'strong', color: 'text-sentiment-positive' };
  };

  const handlePasswordSubmit = () => {
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSettingsUpdate({ type: 'password', data: passwordData });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    onSettingsUpdate({ type: 'twoFactor', data: !twoFactorEnabled });
  };

  const passwordStrength = getPasswordStrength(passwordData?.newPassword);

  return (
    <div className="space-y-6">
      {/* Email Verification */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Email Verification</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            user?.emailVerified 
              ? 'bg-sentiment-positive-bg text-sentiment-positive' :'bg-sentiment-negative-bg text-sentiment-negative'
          }`}>
            {user?.emailVerified ? 'Verified' : 'Not Verified'}
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          {user?.emailVerified 
            ? 'Your email address has been verified and is secure.'
            : 'Please verify your email address to secure your account and receive important notifications.'
          }
        </p>
        {!user?.emailVerified && (
          <Button
            variant="outline"
            size="sm"
            iconName="Mail"
            iconPosition="left"
            iconSize={16}
          >
            Resend Verification Email
          </Button>
        )}
      </div>
      {/* Password Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Password</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            iconName="Key"
            iconPosition="left"
            iconSize={16}
          >
            Change Password
          </Button>
        </div>
        
        {showPasswordForm && (
          <div className="space-y-4 mt-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData?.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData?.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              description={passwordData?.newPassword && `Password strength: ${passwordStrength?.strength}`}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData?.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              error={passwordData?.confirmPassword && passwordData?.newPassword !== passwordData?.confirmPassword ? 'Passwords do not match' : ''}
              required
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handlePasswordSubmit}
                disabled={!passwordData?.currentPassword || !passwordData?.newPassword || passwordData?.newPassword !== passwordData?.confirmPassword}
              >
                Update Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
            <p className="text-muted-foreground text-sm">Add an extra layer of security to your account</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${twoFactorEnabled ? 'text-sentiment-positive' : 'text-muted-foreground'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleTwoFactorToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        {twoFactorEnabled && (
          <div className="flex items-center gap-2 text-sm text-sentiment-positive">
            <Icon name="Shield" size={16} />
            <span>Your account is protected with 2FA</span>
          </div>
        )}
      </div>
      {/* Login Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Login Activity</h3>
        <div className="space-y-3">
          {user?.loginActivity?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Icon name={activity?.device === 'desktop' ? 'Monitor' : 'Smartphone'} size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{activity?.location}</p>
                  <p className="text-xs text-muted-foreground">{activity?.device} • {activity?.browser}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground">{activity?.date}</p>
                <p className="text-xs text-muted-foreground">{activity?.time}</p>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          iconName="Eye"
          iconPosition="left"
          iconSize={16}
        >
          View All Activity
        </Button>
      </div>
    </div>
  );
};

export default AccountSettings;