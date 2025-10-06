import React, { useState } from 'react';
import { UserCreate } from '../types';
import { authAPI } from '../services/auth';
import { CAPTCHA } from './Common/Captcha';
import CookieConsent from './Common/CookieConsent';

interface RegisterFormProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
  onRegistrationSuccess: () => void; 
  onBack: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onSwitchToLogin, 
  onRegistrationSuccess,
  onBack,  
}) => {
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    password: '',
    company_name: '',
    address: '',
    phone: '',
    website: '',
    tax_id: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!isCaptchaVerified) {
      setError('Please complete the CAPTCHA verification');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.register(formData);
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        onRegistrationSuccess();
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      if (!err.response?.data?.detail?.includes('already exists')) {
        setCaptchaReset(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
    }
  };

  const handleCaptchaVerify = React.useCallback((verified: boolean) => {
    setIsCaptchaVerified(verified);
  }, []);

  return (
    <div className="background min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
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
            Create Your Account
          </h2>
          <p className="text-gray-300 text-lg">
            Join thousands of businesses using INVYGO
          </p>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <button 
            onClick={onBack}
            className="text-[#7e3af2] hover:text-[#6a2ee6] text-sm font-medium transition-colors duration-200 flex items-center gap-2 mb-4"
          >
            ← Back to Login
          </button>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/20 border border-green-400 text-green-300 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label htmlFor="company_name" className="block text-sm font-medium text-white mb-2">
                  Company / Business Name *
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  maxLength={512}
                  required
                  value={formData.company_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password (min 6 characters) *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                  placeholder="Create a strong password"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={20}
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                  placeholder="Your phone number"
                />
              </div>

              {/* Tax ID (Optional) */}
              <div>
                <label htmlFor="tax_id" className="block text-sm font-medium text-white mb-2">
                  Tax ID (Optional)
                </label>
                <input
                  id="tax_id"
                  name="tax_id"
                  type="text"
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                  placeholder="Tax identification number"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                  Full Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  minLength={10}
                  maxLength={5042}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm resize-none"
                  placeholder="Enter your complete business address"
                />
              </div>

              {/* Website */}
              <div className="sm:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                  Website (Optional)
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  maxLength={2048}
                  value={formData.website}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/30 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7e3af2] focus:border-transparent bg-white/5 text-white text-sm"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="pt-4 border-t border-white/20">
              <CAPTCHA
                key={captchaReset}
                onCaptchaVerify={handleCaptchaVerify}
                resetTrigger={captchaReset}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isCaptchaVerified}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7e3af2] hover:bg-[#6a2ee6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e3af2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-4 border-t border-white/20">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#7e3af2] hover:text-[#6a2ee6] text-sm font-medium transition-colors duration-200"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} INVYGO- YESITECH. All rights reserved.
          </p>
        </div>
        
        <CookieConsent />
      </div>
    </div>
  );
};