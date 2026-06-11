'use client';

import { SA_PROVINCES } from '@/lib/utils/sa-data';

export interface FilterState {
  province: string;
  freeOnly: boolean;
  showAll: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const PROVINCE_OPTIONS = [{ value: '', label: 'All provinces' }, ...SA_PROVINCES.map((p) => ({ value: p, label: p }))];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Province select */}
      <div className="relative shrink-0">
        <select
          value={filters.province}
          onChange={(e) => onChange({ ...filters, province: e.target.value })}
          className="w-full sm:w-auto appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b4f6c]"
          aria-label="Filter by province"
        >
          {PROVINCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={filters.freeOnly}
            onClick={() => onChange({ ...filters, freeOnly: !filters.freeOnly })}
            className={[
              'relative h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:ring-offset-1',
              filters.freeOnly ? 'bg-[#0b4f6c]' : 'bg-gray-300',
            ].join(' ')}
          >
            <span className={['absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', filters.freeOnly ? 'translate-x-4' : ''].join(' ')} />
          </button>
          <span className="text-sm text-gray-700">Free applications only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={filters.showAll}
            onClick={() => onChange({ ...filters, showAll: !filters.showAll })}
            className={[
              'relative h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:ring-offset-1',
              filters.showAll ? 'bg-[#0b4f6c]' : 'bg-gray-300',
            ].join(' ')}
          >
            <span className={['absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', filters.showAll ? 'translate-x-4' : ''].join(' ')} />
          </button>
          <span className="text-sm text-gray-700">Show all universities</span>
        </label>
      </div>
    </div>
  );
}
