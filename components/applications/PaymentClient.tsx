'use client';

import { useState, useRef } from 'react';
import { Shield, X, CreditCard, Banknote } from 'lucide-react';

interface FeeRow {
  university_id: string;
  university_name: string;
  fee: number;
}

interface PayFastField {
  name: string;
  value: string;
}

interface PaymentClientProps {
  feeRows: FeeRow[];
  totalFees: number;
  freeCount: number;
  payfastUrl: string;
  payfastFields: PayFastField[];
  hasFreeApps: boolean;
}

export default function PaymentClient({
  feeRows,
  totalFees,
  freeCount,
  payfastUrl,
  payfastFields,
  hasFreeApps,
}: PaymentClientProps) {
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handlePay = () => {
    formRef.current?.submit();
  };

  return (
    <>
      {/* Fee breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-5">
        <div className="bg-[#0b4f6c]/5 px-4 py-2.5 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Fee breakdown
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {feeRows.map((row) => (
            <div key={row.university_id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-800 truncate flex-1 mr-3">{row.university_name}</span>
              {row.fee === 0 ? (
                <span className="text-sm font-medium text-[#1ec97e]">Free</span>
              ) : (
                <span className="text-sm font-semibold text-gray-900">R{row.fee}</span>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <span className="text-sm font-semibold text-gray-900">Total to pay</span>
            <span className="text-lg font-bold text-[#0b4f6c]">R{totalFees}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Payment method</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-lg border-2 border-[#0b4f6c] bg-[#f0f7fb] p-3 cursor-pointer">
            <input type="radio" name="method" defaultChecked className="accent-[#0b4f6c]" readOnly />
            <CreditCard size={16} className="text-[#0b4f6c] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Credit or Debit Card</p>
              <p className="text-xs text-gray-500">Visa &amp; Mastercard accepted</p>
            </div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer opacity-60">
            <input type="radio" name="method" className="accent-[#0b4f6c]" disabled />
            <Banknote size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">EFT via Ozow</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
          </label>
        </div>

        {/* Secured by PayFast badge */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <Shield size={12} className="text-[#1ec97e]" />
          Payments secured by{' '}
          <span className="font-semibold text-gray-600">PayFast</span>
        </div>
      </div>

      {/* Hidden PayFast form */}
      <form ref={formRef} action={payfastUrl} method="POST" className="hidden">
        {payfastFields.map((f) => (
          <input key={f.name} type="hidden" name={f.name} value={f.value} />
        ))}
      </form>

      {/* CTA buttons */}
      <button
        type="button"
        onClick={handlePay}
        className="w-full rounded-xl bg-[#0b4f6c] py-3.5 text-sm font-bold text-white hover:bg-[#093d54] active:scale-[0.98] transition-all mb-3"
      >
        Pay R{totalFees} and submit all
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          I cannot afford the fees right now
        </button>
      </div>

      {/* "Cannot afford" modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-2">No problem at all</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              We will submit your{' '}
              {hasFreeApps ? (
                <strong>{freeCount} free application{freeCount !== 1 ? 's' : ''}</strong>
              ) : (
                'free applications'
              )}{' '}
              right away and save your paid applications. You can come back and pay when you are ready.
            </p>

            <div className="space-y-2">
              <a
                href="/applications/submitting?mode=free"
                className="flex items-center justify-center w-full rounded-xl bg-[#0b4f6c] py-3 text-sm font-bold text-white hover:bg-[#093d54] transition-colors"
              >
                Submit free applications only
              </a>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
