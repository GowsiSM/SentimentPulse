// // authService.js
// const API_BASE_URL = 'http://localhost:5000/api';

// class AuthService {
//   // Set up axios-like request handler
//   async request(endpoint, options = {}) {
//     const url = `${API_BASE_URL}${endpoint}`;
//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     };

//     // Add auth token if available
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     try {
//       const response = await fetch(url, config);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Request failed');
//       }

//       return data;
//     } catch (error) {
//       console.error('API Request failed:', error);
//       throw error;
//     }
//   }

//   async login(credentials) {
//     const response = await this.request('/auth/login', {
//       method: 'POST',
//       body: JSON.stringify(credentials),
//     });

//     if (response.token) {
//       localStorage.setItem('authToken', response.token);
//       localStorage.setItem('user', JSON.stringify(response.user));
//     }

//     return response;
//   }

//   async register(userData) {
//     const response = await this.request('/auth/register', {
//       method: 'POST',
//       body: JSON.stringify(userData),
//     });

//     if (response.token) {
//       localStorage.setItem('authToken', response.token);
//       localStorage.setItem('user', JSON.stringify(response.user));
//     }

//     return response;
//   }

//   async socialLogin(provider) {
//     const response = await this.request('/auth/social-login', {
//       method: 'POST',
//       body: JSON.stringify({ provider }),
//     });

//     if (response.token) {
//       localStorage.setItem('authToken', response.token);
//       localStorage.setItem('user', JSON.stringify(response.user));
//     }

//     return response;
//   }

//   async logout() {
//     try {
//       await this.request('/auth/logout', { method: 'POST' });
//     } catch (error) {
//       // Even if logout fails on server, clear local storage
//       console.warn('Server logout failed:', error);
//     } finally {
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('user');
//       localStorage.removeItem('rememberMe');
//     }
//   }

//   async getProfile() {
//     return await this.request('/auth/profile');
//   }

//   async changePassword(passwordData) {
//     return await this.request('/auth/change-password', {
//       method: 'POST',
//       body: JSON.stringify(passwordData),
//     });
//   }

//   isAuthenticated() {
//     return !!localStorage.getItem('authToken');
//   }

//   getCurrentUser() {
//     const user = localStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   }

//   getToken() {
//     return localStorage.getItem('authToken');
//   }
// }

// export default new AuthService();

// src/services/authService.js
const API_BASE_URL = 'http://localhost:5001/api/auth';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = this.getStoredUser();
  }

  // Get stored user data
  getStoredUser() {
    const userData = localStorage.getItem('user_data');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  // Store user data and token
  storeAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  // Clear stored auth data
  clearAuthData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // API request helper
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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await this.apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      this.storeAuthData(response.token, response.user);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // User login
  async login(credentials) {
    try {
      const response = await this.apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      this.storeAuthData(response.token, response.user);
      return response;
    } catch (error) {
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
      localStorage.setItem('user_data', JSON.stringify(response.user));
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
      localStorage.setItem('user_data', JSON.stringify(response.user));
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
        localStorage.setItem('user_data', JSON.stringify(response.user));
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

  // Social login (placeholder for future implementation)
  async socialLogin(provider) {
    try {
      // This would typically redirect to OAuth provider
      throw new Error(`${provider} login not implemented yet`);
    } catch (error) {
      throw new Error(error.message || 'Social login failed');
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
}

// Create singleton instance
const authService = new AuthService();

export default authService;