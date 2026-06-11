'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ApplyWise] Dashboard error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 flex flex-col items-center text-center px-4">
      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-50 mb-5">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h1 className="text-lg font-bold text-gray-900">Something went wrong on our side.</h1>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs">
        Please try again. If the problem continues, contact our support team.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-[#0b4f6c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#093d54] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
