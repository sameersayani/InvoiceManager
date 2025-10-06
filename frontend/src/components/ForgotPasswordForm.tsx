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
      setMessage('Password reset instructions have been sent to your email address.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="background min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* <div className="flex justify-center mb-8">
            <img 
              src="/images/banner.png" 
              alt="INVYGO Logo" 
              className="h-16 sm:h-20 w-auto shadow-lg rounded-lg" 
            />
          </div> */}
          <h2 className="text-3xl font-bold text-white mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-300 text-lg">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {message && (
            <div className="bg-green-500/20 border border-green-400 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                placeholder="Enter your email address"
              />
              <p className="text-gray-300 text-sm mt-2">
                We'll send you a link to reset your password.
              </p>
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
                  Sending...
                </span>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-[#7e3af2] hover:text-[#6a2ee6] text-sm font-medium transition-colors duration-200 block w-full"
              >
                ← Back to Sign In
              </button>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 block w-full"
              >
                Don't have an account? Sign up
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