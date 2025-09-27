import React, { useState } from 'react';
import { authAPI } from '../services/auth';
import CookieConsent from './Common/CookieConsent';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSwitchToRegister: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onSwitchToRegister
}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.forgotPassword({ email });
      setMessage('Password reset instructions sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Watermark Background Image - Match LoginForm styling */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 z-0"
        style={{ 
          backgroundImage: 'url("/images/yesitech-powered.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          transform: 'translateX(-3%)'
        }}
      />
      
      <div className="relative z-10 ml-auto w-full max-w-md pr-8 lg:pr-16">
        <div className="sm:mx-auto sm:w-mid sm:max-w-md">
          <div className="flex justify-left">
            <img 
              src="/images/banner.png" 
              alt="INVYGO Logo" 
              className="h-auto w-auto shadow-lg sm:rounded-xl" 
            />
          </div>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
            {/* Remove the separate heading to match LoginForm */}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
              </div>

              {/* Match LoginForm button styling */}
              <div className="flex flex-col space-y-3 text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors duration-200"
                >
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-gray-600 hover:text-gray-500 text-sm font-medium transition-colors duration-200 underline"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <CookieConsent />
    </div>
  );
};