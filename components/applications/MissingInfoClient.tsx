'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import type { UniversityCheckResult } from '@/lib/utils/missing-info-checker';
import ConsentUploadSlot from './ConsentUploadSlot';

interface MissingInfoClientProps {
  results: UniversityCheckResult[];
  userId: string;
}

export default function MissingInfoClient({ results, userId }: MissingInfoClientProps) {
  const router = useRouter();

  /**
   * Tracks items resolved inline on this page (parental consent / language
   * declaration uploads). Items resolved on other pages (e.g. step-5) are
   * detected via router.refresh() on window focus.
   */
  const [inlineResolved, setInlineResolved] = useState<Set<string>>(new Set());

  // Re-check when user returns to this tab after uploading on another page
  useEffect(() => {
    const onFocus = () => router.refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [router]);

  const markResolved = useCallback(
    (universityId: string, itemType: string) => {
      setInlineResolved((prev) => new Set([...prev, `${universityId}:${itemType}`]));
      // Sync server state so the banner/button recompute correctly
      router.refresh();
    },
    [router]
  );

  // Merge server-side missing items with client-side resolved set
  const rows = results.map((result) => {
    const remaining = result.missing_items.filter(
      (item) => !inlineResolved.has(`${result.university_id}:${item.item_type}`)
    );
    return { ...result, remaining };
  });

  const readyCount = rows.filter((r) => r.remaining.length === 0).length;
  const totalCount = rows.length;
  const allClear   = readyCount === totalCount;

  return (
    <div className="space-y-4 pb-10">
      {/* ── Per-university rows ─────────────────────────────────────────── */}
      {rows.map((row) => {
        const isAllClear = row.remaining.length === 0;

        return (
          <div
            key={row.university_id}
            className={[
              'rounded-xl border overflow-hidden transition-colors duration-300',
              isAllClear
                ? 'border-[#1ec97e]/40 bg-[#f0fdf7]'
                : 'border-gray-200 bg-white',
            ].join(' ')}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3">
              {isAllClear ? (
                <CheckCircle2 size={18} className="text-[#1ec97e] shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-400 mr-1.5">
                  {row.university_abbreviation}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {row.university_name}
                </span>
              </div>
              {isAllClear && (
                <span className="text-xs font-medium text-[#0a8a54] shrink-0">
                  Everything looks good
                </span>
              )}
            </div>

            {/* Missing items */}
            {!isAllClear && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-4">
                {row.remaining.map((item) => {
                  const isInline = item.action_url.startsWith('inline:');
                  const inlineType = item.action_url.replace('inline:', '') as
                    | 'parental_consent'
                    | 'language_declaration';

                  return (
                    <div key={item.item_type}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm text-gray-700 font-medium">
                          {item.item_label}
                        </span>
                        {!isInline && (
                          <Link
                            href={item.action_url}
                            className="shrink-0 rounded-lg bg-[#0b4f6c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#093d54] transition-colors"
                          >
                            {item.action_label}
                          </Link>
                        )}
                      </div>

                      {isInline && (
                        <ConsentUploadSlot
                          itemType={inlineType}
                          userId={userId}
                          onResolved={() => markResolved(row.university_id, item.item_type)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ── All-clear banner ────────────────────────────────────────────── */}
      {allClear && (
        <div className="flex items-center gap-3 rounded-xl border border-[#1ec97e]/40 bg-[#f0fdf7] px-4 py-3">
          <CheckCircle2 size={18} className="text-[#1ec97e] shrink-0" />
          <p className="text-sm font-semibold text-[#0a8a54]">
            Everything is in order. You are ready to submit.
          </p>
        </div>
      )}

      {/* ── Submit ──────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <p className="text-center text-xs text-gray-400 mb-3">
          {readyCount} of {totalCount}{' '}
          {totalCount === 1 ? 'university' : 'universities'} ready to submit
        </p>

        {allClear ? (
          <Link
            href="/applications/review"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0b4f6c] py-3.5 text-sm font-bold text-white hover:bg-[#093d54] active:scale-[0.98] transition-all"
          >
            <Send size={15} />
            Submit all applications
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gray-200 py-3.5 text-sm font-bold text-gray-400 cursor-not-allowed"
          >
            <Send size={15} />
            Submit all applications
          </button>
        )}
      </div>
    </div>
  );
}
