'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';
import StepProgress from '@/components/ui/StepProgress';
import type { Document, DocumentType } from '@/types';

interface DocSlot {
  type: DocumentType;
  label: string;
  required: boolean;
  tooltip?: string;
}

const DOC_SLOTS: DocSlot[] = [
  {
    type: 'id_copy',
    label: 'Certified copy of your ID',
    required: true,
  },
  {
    type: 'school_report',
    label: 'Your latest school report',
    required: true,
  },
  {
    type: 'proof_of_residence',
    label: 'Proof of where you live',
    required: true,
    tooltip:
      'A utility bill, bank statement, or letter from a traditional leader showing your address.',
  },
  {
    type: 'motivation_letter',
    label: 'Motivation letter',
    required: false,
    tooltip:
      'Some universities require a motivation letter explaining why you want to study there. Check the missing information screen to see which universities need this.',
  },
  {
    type: 'portfolio',
    label: 'Portfolio',
    required: false,
    tooltip:
      'Only needed for art, design, music, or drama programmes.',
  },
];

interface Step5FormProps {
  userId: string;
  existingDocuments?: Document[];
  completedSteps?: number[];
}

export default function Step5Form({ userId, existingDocuments = [], completedSteps }: Step5FormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map existing documents by type for quick lookup
  const [docs, setDocs] = useState<Partial<Record<DocumentType, Document>>>(() => {
    const map: Partial<Record<DocumentType, Document>> = {};
    for (const doc of existingDocuments) {
      map[doc.document_type] = doc;
    }
    return map;
  });

  const supabase = createClient();

  const handleUploaded = useCallback(
    async (type: DocumentType, path: string, name: string, size: number) => {
      const existing = docs[type];

      if (existing) {
        const { data } = await supabase
          .from('documents')
          .update({ file_path: path, file_name: name, file_size: size, uploaded_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (data) setDocs((prev) => ({ ...prev, [type]: data }));
      } else {
        const { data } = await supabase
          .from('documents')
          .insert({ profile_id: userId, document_type: type, file_path: path, file_name: name, file_size: size })
          .select()
          .single();
        if (data) setDocs((prev) => ({ ...prev, [type]: data }));
      }
    },
    [supabase, userId, docs]
  );

  const handleDeleted = useCallback(
    async (type: DocumentType) => {
      const existing = docs[type];
      if (existing) {
        await supabase.from('documents').delete().eq('id', existing.id);
      }
      setDocs((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    },
    [supabase, docs]
  );

  const handleFinish = async () => {
    setIsSubmitting(true);

    // Mark profile as complete
    const { error } = await supabase
      .from('profiles')
      .update({ profile_complete: true })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to save. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push('/profile/complete');
  };

  return (
    <div>
      <StepProgress currentStep={5} completedSteps={completedSteps} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload your documents</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Upload clear, certified copies of your documents. Blurry or uncertified documents may
          cause your application to be rejected.
        </p>
      </div>

      <div className="space-y-4">
        {DOC_SLOTS.map((slot) => {
          const existing = docs[slot.type];
          return (
            <FileUpload
              key={slot.type}
              label={slot.label}
              tooltip={slot.tooltip}
              documentType={slot.type}
              userId={userId}
              required={slot.required}
              existingPath={existing?.file_path ?? null}
              existingName={existing?.file_name ?? null}
              onUploaded={(path, name, size) => handleUploaded(slot.type, path, name, size)}
              onDeleted={() => handleDeleted(slot.type)}
            />
          );
        })}
      </div>

      {/* Certification tip */}
      <div className="mt-6 flex gap-3 rounded-xl bg-gray-50 border border-gray-200 p-4">
        <ShieldCheck size={20} className="shrink-0 text-[#0b4f6c] mt-0.5" />
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong className="text-gray-900">Certification tip:</strong> A certified copy has a stamp
          and signature from a commissioner of oaths. You can get this done for free at your nearest
          police station.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" fullWidth onClick={() => router.push('/profile/step-4')}>
          Back
        </Button>
        <Button fullWidth loading={isSubmitting} onClick={handleFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
}
