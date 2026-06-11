'use client';

import { useRef, useState, useId } from 'react';
import { Upload, FileText, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_MB = 5;


export default function FileUpload({
  label,
  documentType,
  userId,
  required,
  existingPath,
  existingName,
  onUploaded,
  onDeleted,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(existingName ?? null);
  const [uploaded, setUploaded] = useState(!!existingPath);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are accepted.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be smaller than ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    setProgress(0);

    // Animate progress to 85% while uploading
    const tick = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 12 : p));
    }, 200);

    const ext = file.name.split('.').pop();
    const path = `${userId}/${documentType}/${Date.now()}.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true });

    clearInterval(tick);

    if (uploadError) {
      setError(uploadError.message);
      setProgress(0);
      setUploading(false);
      return;
    }

    setProgress(100);
    setFileName(file.name);
    setUploaded(true);
    setUploading(false);
    onUploaded(path, file.name, file.size);
  };

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-[#e63946] ml-0.5">*</span>}
        </span>
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
        /* Empty / drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={[
            'rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer',
            error ? 'border-[#e63946] bg-[#e63946]/5' : 'border-gray-300 hover:border-[#0b4f6c] hover:bg-blue-50/30',
          ].join(' ')}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label={`Upload ${label}`}
        >
          <Upload size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            Tap to upload or drag a file here
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG — max {MAX_MB} MB</p>

          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-[#e63946]">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
