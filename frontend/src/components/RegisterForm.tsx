import React, { useState } from 'react';
import { UserCreate } from '../types';
import { authAPI } from '../services/auth';
import { CAPTCHA } from './Common/Captcha';
import { LogoUpload } from './LogoUpload';
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
  // const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate CAPTCHA before submitting
    if (!isCaptchaVerified) {
      setError('Please complete the CAPTCHA verification');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.register(formData);
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      // Show success message for 2 seconds, then redirect
      setTimeout(() => {
        onRegistrationSuccess(); // Call the success callback
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
     // Reset CAPTCHA on error - but only if it's not a validation error
      if (!err.response?.data?.detail?.includes('already exists')) {
        setCaptchaReset(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};


const handleCaptchaVerify = React.useCallback((verified: boolean) => {
  setIsCaptchaVerified(verified);
}, []);

// const handleLogoUpload = (logoUrl: string) => {
// setCompanyLogo(logoUrl);
// };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-left">
          {/* Replace with your actual logo path */}
          <img
            src="/images/banner.png"
            alt="INVYGO Logo"
            className="h-auto w-auto shadow-lg sm:rounded-xl"
          />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}
            {/* <div>
               <h3 className="text-lg font-semibold text-gray-800 mb-3">Company Logo</h3>
              <LogoUpload onLogoUpload={handleLogoUpload} /> 
              {companyLogo && (
                <div className="mt-3 flex items-center">
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="h-20 w-20 object-contain border rounded-lg"
                  />
                </div>
              )}
            </div> */}
            <div>
              <button onClick={onBack} className="btn-secondary mb-6">
                ← Back to Login
              </button>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="company_name"
                className="block text-sm font-medium text-gray-700"
              >
                Company / Business Name
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                maxLength={512}
                required
                value={formData.company_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={20}
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* <div>
                <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                  Tax ID
                </label>
                <input
                  id="tax_id"
                  name="tax_id"
                  type="text"
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="input-field"
                />
              </div> */}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Full Address
              </label>
              <textarea
                  id="address"
                  name="address"
                  rows={4}
                  cols={50}
                  required
                  value={formData.address}
                  minLength={10}
                  maxLength={5042}
                  onChange={handleTextareaChange}
                  className="input-field"
                  placeholder="Enter your full address"
                />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                maxLength={2048}
                value={formData.website}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <CAPTCHA
              key={captchaReset}
              onCaptchaVerify={handleCaptchaVerify}
              resetTrigger={captchaReset}
            />
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary-600 hover:text-primary-500 text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
      <CookieConsent />
    </div>
  );
};