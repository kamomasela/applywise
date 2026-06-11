'use client';

import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import FileUpload from '@/components/ui/FileUpload';

// ── Config per consent type ──────────────────────────────────────────────────

const SLOT_CONFIG = {
  parental_consent: {
    description:
      'Because you are under 18, a signed parental consent form is required. ' +
      'Download it, have your parent or guardian sign it, and upload it here.',
    downloadLabel: 'Download consent form',
    downloadUrl:   '/forms/parental-consent.pdf',
    uploadLabel:   'Signed parental consent form',
  },
  language_declaration: {
    description:
      'This university requires a language declaration form. ' +
      'Download it, complete and sign it, then upload the signed copy here.',
    downloadLabel: 'Download declaration form',
    downloadUrl:   '/forms/language-declaration.pdf',
    uploadLabel:   'Signed language declaration form',
  },
} as const;

// ── Component ────────────────────────────────────────────────────────────────

interface ConsentUploadSlotProps {
  itemType: 'parental_consent' | 'language_declaration';
  userId: string;
  onResolved: () => void;
}

export default function ConsentUploadSlot({
  itemType,
  userId,
  onResolved,
}: ConsentUploadSlotProps) {
  const config  = SLOT_CONFIG[itemType];
  const supabase = createClient();

  const handleUploaded = async (path: string, name: string, size: number) => {
    const { error } = await supabase.from('documents').insert({
      profile_id:    userId,
      document_type: itemType,
      file_name:     name,
      file_path:     path,
      file_size:     size,
    });

    if (error) {
      toast.error('Could not save document record. Please try again.');
      return;
    }

    onResolved();
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-3">
      {/* Explanation */}
      <p className="text-xs text-gray-600 leading-relaxed">{config.description}</p>

      {/* Download template */}
      <a
        href={config.downloadUrl}
        download
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b4f6c] hover:underline"
      >
        <Download size={12} />
        {config.downloadLabel}
      </a>

      {/* Upload slot */}
      <FileUpload
        label={config.uploadLabel}
        documentType={itemType}
        userId={userId}
        onUploaded={handleUploaded}
        onDeleted={() => {}}
      />
    </div>
  );
}
