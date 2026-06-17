'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Tooltip from '@/components/ui/Tooltip';

export interface FileUploadProps {
  label: string;
  documentType: string;
  userId: string;
  required?: boolean;
  tooltip?: string;
  existingPath?: string | null;
  existingName?: string | null;
  onUploaded: (path: string, name: string, size: number) => void;
  onDeleted: () => void;
}


export default function FileUpload({
  label,
  documentType,
  userId,
  required,
  tooltip,
  existingPath,
  existingName,
  onUploaded,
  onDeleted,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(existingName ?? null);
  const [uploaded, setUploaded] = useState(!!existingPath);

  const handleDelete = async () => {
    if (!existingPath) {
      setFileName(null);
      setUploaded(false);
      onDeleted();
      return;
    }
    const supabase = createClient();
    await supabase.storage.from('documents').remove([existingPath]);
    setFileName(null);
    setUploaded(false);
    setProgress(0);
    onDeleted();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-[#e63946] ml-0.5">*</span>}
        </span>
        {tooltip && <Tooltip text={tooltip} />}
      </div>

      {uploaded && fileName ? (
        /* Uploaded state */
        <div className="flex items-center gap-3 rounded-lg border border-[#1ec97e]/40 bg-[#1ec97e]/5 px-4 py-3">
          <CheckCircle2 size={20} className="shrink-0 text-[#1ec97e]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
            <p className="text-xs text-gray-400">Uploaded successfully</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 p-1.5 text-gray-400 hover:text-[#e63946] rounded transition-colors"
            aria-label="Remove file"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : uploading ? (
        /* Uploading state */
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} className="text-gray-400" />
            <span className="truncate">{fileName ?? 'Uploading…'}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0b4f6c] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Coming soon placeholder */
        <div className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-6 text-center">
          <Upload size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">Document upload coming soon</p>
        </div>
      )}
    </div>
  );
}
