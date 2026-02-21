import React, { useState } from 'react';
import { UserLogin } from '../types';
import { authAPI, tokenService } from '../services/auth';
import CookieConsent from './Common/CookieConsent';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  registrationSuccess?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  onSwitchToRegister,
  onForgotPassword,
  registrationSuccess = false
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserLogin>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      tokenService.setToken(response.access_token);
      onLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
    }
  };

  const handleForgotPasswordClick = () => {
    if (typeof onForgotPassword === 'function') {
      onForgotPassword();
    } else {
      setError('Forgot password functionality is currently unavailable');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a3a] to-[#0d1b2a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* <div className="flex justify-center mb-8">
            <img 
              src="/images/banner.png" 
              alt="INVYGO Logo" 
              className="h-16 sm:h-10 w-auto shadow-lg rounded-lg" 
            />
          </div> */}
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-300 text-lg">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {registrationSuccess && (
            <div className="bg-green-500/20 border border-green-400 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
              Registration successful! Please log in with your credentials.
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7e3af2] hover:bg-[#6a2ee6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e3af2] disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-white hover:text-yellow-300 text-sm font-semibold transition-colors duration-200 block w-full"
              >
                Don't have an account? Sign up
              </button>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 block w-full"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} INVYGO. All rights reserved.
          </p>
        </div>
        
        <CookieConsent />
      </div>
    </div>
  );
};