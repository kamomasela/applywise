'use client';

import { useEffect } from 'react';
import Logo from '@/components/ui/Logo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ApplyWise] Global error:', error);
  }, [error]);

  return (
    <html lang="en-ZA">
      <body className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <Logo size={56} />
        <h1 className="mt-6 text-xl font-bold text-gray-900">
          Something went wrong on our side.
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
          Please try again. If the problem continues, contact our support team.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-[#0b4f6c] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#093d54] transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
