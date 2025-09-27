// hooks/useCookieConsent.ts
import { useEffect, useState } from 'react';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    setHasConsented(consent === 'accepted');
  }, []);

  const setConsent = (accepted: boolean) => {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
    setHasConsented(accepted);
  };

  return { hasConsented, setConsent };
};