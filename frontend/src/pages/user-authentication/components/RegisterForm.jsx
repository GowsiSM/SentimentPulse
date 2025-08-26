// src/pages/user-authentication/components/RegisterForm.jsx
import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegisterForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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

  // Password strength checker
  const checkPasswordCriteria = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  };

  const getPasswordStrength = () => {
    const criteria = checkPasswordCriteria(formData.password);
    const metCriteria = Object.values(criteria).filter(Boolean).length;
    return {
      criteria,
      strength: metCriteria,
      percentage: (metCriteria / 4) * 100
    };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password?.trim()) {
      errors.password = 'Password is required';
    } else {
      const { strength } = getPasswordStrength();
      if (strength < 4) {
        errors.password = 'Please meet all password requirements';
      }
    }
    
    if (!formData?.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData?.role) {
      errors.role = 'Please select your role';
    }
    
    if (!formData?.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const { criteria, percentage } = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        value={formData?.fullName}
        onChange={handleInputChange}
        error={validationErrors?.fullName}
        required
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData?.email}
        onChange={handleInputChange}
        error={validationErrors?.email}
        required
      />
      <Input
        label="Company/Organization"
        type="text"
        name="company"
        placeholder="Enter your company name (optional)"
        value={formData?.company}
        onChange={handleInputChange}
        description="Optional - helps us understand your use case"
      />
      <Select
        label="Role"
        placeholder="Select your role"
        options={roleOptions}
        value={formData?.role}
        onChange={(value) => handleSelectChange('role', value)}
        error={validationErrors?.role}
        required
      />
      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Create a password"
            value={formData?.password}
            onChange={handleInputChange}
            error={validationErrors?.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-hover"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: '#e40046'
                }}
              />
            </div>
            
            {/* Criteria List */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center space-x-2 ${criteria.length ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.length ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center space-x-2 ${criteria.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.uppercase ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center space-x-2 ${criteria.number ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.number ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span>Number</span>
              </div>
              <div className={`flex items-center space-x-2 ${criteria.special ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.special ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span>Special character</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData?.confirmPassword}
          onChange={handleInputChange}
          error={validationErrors?.confirmPassword}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-hover"
        >
          <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
        </button>
      </div>
      <Checkbox
        label="I agree to the Terms of Service and Privacy Policy"
        name="acceptTerms"
        checked={formData?.acceptTerms}
        onChange={handleInputChange}
        error={validationErrors?.acceptTerms}
        required
      />
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={loading}
        fullWidth
        className="mt-6"
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;