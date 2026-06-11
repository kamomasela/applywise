'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CAOModalProps {
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function CAOModal({ onConfirm, onDismiss }: CAOModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cao-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* CAO logo badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-[#0b4f6c]/10 px-3 py-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0b4f6c]">CAO</span>
          <span className="text-xs text-[#0b4f6c]">Central Applications Office</span>
        </div>

        <h2 id="cao-modal-title" className="text-lg font-bold text-gray-900 mb-3">
          These universities use CAO
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          UKZN, DUT, and MUT process applications through the{' '}
          <strong>Central Applications Office</strong> at{' '}
          <span className="text-[#0b4f6c] font-medium">cao.ac.za</span>. The fee of{' '}
          <strong>R240</strong> covers all three universities. We will guide you through the CAO
          process.
        </p>

        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={onConfirm}>
            I understand, keep selected
          </Button>
          <Button fullWidth variant="outline" onClick={onDismiss}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
