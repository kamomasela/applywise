'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setOnline(navigator.onLine);

    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 bg-gray-800 text-white px-4 py-3"
    >
      <div className="mx-auto max-w-lg flex items-start gap-3">
        <WifiOff size={16} className="shrink-0 mt-0.5 text-gray-300" aria-hidden="true" />
        <p className="text-xs leading-relaxed">
          <span className="font-semibold">You are not connected to the internet.</span>{' '}
          Do not worry — everything you fill in is saved. We will submit your applications
          when you are back online.
        </p>
      </div>
    </div>
  );
}
