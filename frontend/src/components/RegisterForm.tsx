import React, { useState } from 'react';
import { UserCreate } from '../types';
import { authAPI } from '../services/auth';

interface RegisterFormProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
  onRegistrationSuccess: () => void; // Add this new prop
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onSwitchToLogin, 
  onRegistrationSuccess 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authAPI.register(formData);
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      // Show success message for 2 seconds, then redirect
      setTimeout(() => {
        onRegistrationSuccess(); // Call the success callback
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account for Invygo
        </h2>
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                Company / Client Name
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                value={formData.company_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
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
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
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
    </div>
  );
};