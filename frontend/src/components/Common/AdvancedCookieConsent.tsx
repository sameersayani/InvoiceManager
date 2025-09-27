// components/AdvancedCookieConsent.tsx
import React, { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const AdvancedCookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always enabled
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
      setIsVisible(true);
    } else if (savedConsent === 'custom') {
      const savedPrefs = localStorage.getItem('cookiePreferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  const savePreferences = (customPreferences?: CookiePreferences) => {
    const prefsToSave = customPreferences || preferences;
    
    if (prefsToSave.analytics || prefsToSave.marketing) {
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.setItem('cookiePreferences', JSON.stringify(prefsToSave));
    } else {
      localStorage.setItem('cookieConsent', 'declined');
    }
    
    setIsVisible(false);
    // Implement actual cookie setting based on preferences
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true
    });
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cookie Settings
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              We use cookies to secure your authentication, remember your preferences, 
              and improve our services. Choose which cookies you're comfortable with.
            </p>

            {showDetails && (
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Essential Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Required for security and basic functionality
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 bg-blue-600 rounded-full cursor-not-allowed opacity-50">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Help us improve our authentication flow
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.analytics ? 'transform translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Personalize your experience across visits
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.marketing ? 'transform translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              {showDetails ? 'Hide details' : 'Show detailed preferences'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={acceptAll}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
            >
              Accept All
            </button>
            <button
              onClick={() => savePreferences()}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors font-medium"
            >
              Save Preferences
            </button>
            <button
              onClick={() => savePreferences({ essential: true, analytics: false, marketing: false })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors font-medium"
            >
              Essential Only
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            By continuing, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCookieConsent;