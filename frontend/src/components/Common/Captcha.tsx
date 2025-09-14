// CAPTCHA.tsx (simplified version)
import React, { useState, useCallback, useEffect, useRef } from 'react';

interface CaptchaProps {
  onCaptchaVerify: (isVerified: boolean) => void;
  resetTrigger?: number;
}

export const CAPTCHA: React.FC<CaptchaProps> = ({ onCaptchaVerify, resetTrigger }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const resetCountRef = useRef(0);

  // Generate CAPTCHA - only when resetTrigger changes
  useEffect(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let newCaptcha = '';
    for (let i = 0; i < 6; i++) {
      newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(newCaptcha);
    setUserInput('');
    setIsVerified(false);
    onCaptchaVerify(false);
  }, [resetTrigger, onCaptchaVerify]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (value.length === captchaText.length) {
      const isMatch = value.toUpperCase() === captchaText.toUpperCase();
      setIsVerified(isMatch);
      onCaptchaVerify(isMatch);
    } else if (isVerified) {
      setIsVerified(false);
      onCaptchaVerify(false);
    }
  };

  const handleRefresh = () => {
    resetCountRef.current += 1;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let newCaptcha = '';
    for (let i = 0; i < 6; i++) {
      newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(newCaptcha);
    setUserInput('');
    setIsVerified(false);
    onCaptchaVerify(false);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        CAPTCHA Verification
      </label>
      
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div 
            className="bg-white p-2 rounded-md border border-gray-300 text-2xl font-bold tracking-widest text-center select-none w-32 h-12 flex items-center justify-center"
            style={{ 
              fontFamily: 'monospace',
              userSelect: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'%3E%3Crect width='100' height='40' fill='white'/%3E%3Cline x1='0' y1='0' x2='100' y2='40' stroke='%23ddd' stroke-width='1'/%3E%3Cline x1='100' y1='0' x2='0' y2='40' stroke='%23ddd' stroke-width='1'/%3E%3Cline x1='50' y1='0' x2='50' y2='40' stroke='%23ddd' stroke-width='1'/%3E%3C/svg%3E")`
            }}
          >
            {captchaText}
          </div>
        </div>
        
        <div className="flex-grow">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Enter the code above"
            className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            maxLength={captchaText.length}
          />
        </div>
        
        <button
          type="button"
          onClick={handleRefresh}
          className="flex-shrink-0 p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
          title="Refresh CAPTCHA"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {userInput && userInput.length === captchaText.length && !isVerified && (
        <p className="mt-2 text-sm text-red-600">CAPTCHA code doesn't match</p>
      )}
      
      {isVerified && (
        <p className="mt-2 text-sm text-green-600">CAPTCHA verified successfully</p>
      )}
    </div>
  );
};