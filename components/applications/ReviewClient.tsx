'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitApplications } from '@/app/(dashboard)/applications/actions';
import ApplicationCard, { ReadinessCheck } from './ApplicationCard';
import type { University, Programme } from '@/types';

interface ApplicationRow {
  id: string;
  university: University;
  firstChoice: Programme | null;
  secondChoice: Programme | null;
}

interface ReviewClientProps {
  applications: ApplicationRow[];
  apsScore: number;
  docsUploaded: number;
  totalRequiredDocs: number;
}

export default function ReviewClient({
  applications,
  apsScore,
  docsUploaded,
  totalRequiredDocs,
}: ReviewClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allHaveFirstChoice = applications.every((a) => a.firstChoice !== null);
  const docsReady = docsUploaded >= totalRequiredDocs;
  const apsReady = apsScore > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitApplications();
    if (result && 'error' in result) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
    // On success the server action redirects — component unmounts
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Readiness checklist */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Before you submit</h2>
        <div className="space-y-2">
          <ReadinessCheck label="APS score saved" ok={apsReady} />
          <ReadinessCheck
            label={`Required documents uploaded (${docsUploaded}/${totalRequiredDocs})`}
            ok={docsReady}
          />
          <ReadinessCheck
            label="First choice selected for every university"
            ok={allHaveFirstChoice}
          />
        </div>
        {(!docsReady || !apsReady) && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
            Some items need attention. You can still submit, but completing your profile first
            gives universities the best picture of you.
          </p>
        )}
      </div>

      {/* Application cards */}
      <div className="space-y-4">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            university={app.university}
            firstChoice={app.firstChoice}
            secondChoice={app.secondChoice}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={[
            'w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all',
            isSubmitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#0b4f6c] text-white hover:bg-[#093d54] active:scale-[0.98]',
          ].join(' ')}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              Submitting…
            </>
          ) : (
            <>
              <Send size={15} />
              Submit {applications.length} application{applications.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          Each application will be marked as submitted with a unique reference number.
        </p>
      </div>
    </div>
  );
}
