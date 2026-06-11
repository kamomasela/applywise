'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';

// BeforeInstallPromptEvent is not in the standard TS lib
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow]                     = useState(false);

  useEffect(() => {
    // Don't show if already installed, dismissed, or not eligible
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      localStorage.getItem(DISMISS_KEY)
    ) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so the page has a chance to render first
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    dismiss();
  };

  if (!show) return null;

  return (
    /* Bottom sheet */
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg px-5 py-5">
          <div className="flex items-start gap-4">
            <Logo size={44} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-snug">
                Add ApplyWise to your home screen
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                For easy access to your applications any time, even offline.
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 text-gray-400 hover:text-gray-600 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={install}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0b4f6c] py-2.5 text-sm font-semibold text-white hover:bg-[#093d54] transition-colors"
            >
              <Download size={15} />
              Add to home screen
            </button>
            <button
              onClick={dismiss}
              className="px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
