'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const MAX = 7;

interface SelectionBarProps {
  count: number;
}

export default function SelectionBar({ count }: SelectionBarProps) {
  const router = useRouter();
  const atMax = count >= MAX;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-lg">
        {/* Dots + count */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array(MAX).fill(null).map((_, i) => (
              <div
                key={i}
                className={[
                  'h-2 w-2 rounded-full transition-all duration-300',
                  i < count ? 'bg-[#0b4f6c] scale-110' : 'bg-gray-200',
                ].join(' ')}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-gray-700" aria-live="polite">
            {atMax
              ? 'You have reached the maximum of 7 universities'
              : `You have selected ${count} of ${MAX} universities`}
          </p>
        </div>

        <Button
          fullWidth
          disabled={count === 0}
          onClick={() => router.push('/universities/programmes')}
        >
          Continue to programme selection
        </Button>
      </div>
    </div>
  );
}
