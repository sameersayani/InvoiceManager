// components/CookieConsent.tsx
import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    // You can add additional cookie setting logic here
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    // Remove any non-essential cookies if needed
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex flex-col space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cookie Preferences
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            We use cookies to enhance your experience on our authentication pages. 
            These include essential cookies for security and functionality. 
            By continuing, you agree to our use of cookies.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            Accept All Cookies
          </button>
          <button
            onClick={declineCookies}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors text-sm font-medium"
          >
            Essential Only
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Learn more in our{' '}
          <a 
            href="/privacy-policy" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;