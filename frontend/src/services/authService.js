// src/services/authService.js
const API_BASE_URL = 'http://localhost:5000/api/auth';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.initializeFromStorage();
  }

  // Initialize from localStorage without using it directly in components
  initializeFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        this.user = userData ? JSON.parse(userData) : null;
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
      this.clearAuthData();
    }
  }

  // Store user data and token
  storeAuthData(token, user) {
    this.token = token;
    this.user = user;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  // Clear stored auth data
  clearAuthData() {
    this.token = null;
    this.user = null;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // API request helper with better error handling
  async apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    if (this.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      // Handle different content types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('API request successful:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to authentication service. Please check if the server is running on port 5001.');
      }
      
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      console.log('Registering user:', { ...userData, password: '[HIDDEN]' });
      
      const response = await this.apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      this.storeAuthData(response.token, response.user);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // User login
  async login(credentials) {
    try {
      console.log('Logging in user:', { ...credentials, password: '[HIDDEN]' });
      
      const response = await this.apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      this.storeAuthData(response.token, response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // User logout
  async logout() {
    try {
      if (this.token) {
        await this.apiRequest('/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      this.clearAuthData();
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await this.apiRequest('/profile');
      this.user = response.user;
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
      }
      
      return response.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await this.apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      this.user = response.user;
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
      }
      
      return response.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Verify token validity
  async verifyToken() {
    try {
      if (!this.token) {
        return false;
      }

      const response = await this.apiRequest('/verify-token', {
        method: 'POST',
      });

      if (response.valid) {
        this.user = response.user;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('user_data', JSON.stringify(response.user));
          }
        } catch (storageError) {
          console.error('Error storing user data:', storageError);
        }
        return true;
      } else {
        this.clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      this.clearAuthData();
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role;
  }

  // Get user's initials for avatar
  getUserInitials() {
    if (!this.user?.fullName) return 'U';
    
    const names = this.user.fullName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Format user display name
  getDisplayName() {
    return this.user?.fullName || 'User';
  }

  // Auto-refresh token before expiry (call this on app initialization)
  async initializeAuth() {
    if (this.token) {
      const isValid = await this.verifyToken();
      if (!isValid) {
        this.clearAuthData();
        return false;
      }
      return true;
    }
    return false;
  }

  // Test connection to auth service
  async testConnection() {
    try {
      const response = await this.apiRequest('/health');
      return response.status === 'healthy';
    } catch (error) {
      console.error('Auth service connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;