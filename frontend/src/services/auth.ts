import axios from 'axios';
import { UserCreate, UserLogin, AuthResponse, User } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const authAPI = {
  register: async (userData: UserCreate): Promise<User> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, userData).then(response => response.data);
        return response;
    } catch (error: any) {
      // Make sure to throw the error with proper details
      if (error.response) {
        throw new Error(error.response.data.detail || 'Registration failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error('Registration request failed. Please try again.');
      }
    }
},
  forgotPassword: async (data: { email: string }) => { // Change parameter type to object
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to send reset email');
    }

    return response.json();
  },

resetPassword: async (token: string, newPassword: string): Promise<void> =>
  await axios.post('/auth/reset-password', { token, new_password: newPassword }),

  login: async (loginData: UserLogin): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, 
        `username=${encodeURIComponent(loginData.email)}&password=${encodeURIComponent(loginData.password)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      // Make sure to throw the error with proper details
      if (error.response) {
        throw new Error(error.response.data.detail || 'Login failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error('Login request failed. Please try again.');
      }
    }
  },

  getCurrentUser: (token: string): Promise<User> =>
    axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => response.data),
};

// Token management
export const tokenService = {
  setToken: (token: string): void => {
    localStorage.setItem('access_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  removeToken: (): void => {
    localStorage.removeItem('access_token');
    delete axios.defaults.headers.common['Authorization'];
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  }
};