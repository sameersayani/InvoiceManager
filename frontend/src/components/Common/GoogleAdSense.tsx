import React, { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  adClient?: string; // optional if you want to override
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  adClient = 'ca-pub-3276135926683835'
}) => {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (!adLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adLoaded.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  return (
    <div className="ad-container">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      ></ins>
    </div>
  );
};

export default GoogleAdSense;