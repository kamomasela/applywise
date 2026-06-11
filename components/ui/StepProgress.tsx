import { Check } from 'lucide-react';

const STEPS = ['Personal', 'Contact', 'Guardian', 'Academic', 'Documents'] as const;

interface StepProgressProps {
  currentStep: number; // 1–5
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  const pct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-8 select-none" aria-label={`Step ${currentStep} of ${STEPS.length}`}>
      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Step {currentStep} of {STEPS.length}
      </p>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-[#0b4f6c] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const completed = step < currentStep;
          const active = step === currentStep;

          return (
            <div key={label} className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 shrink-0',
                  completed
                    ? 'bg-[#0b4f6c] text-white'
                    : active
                      ? 'bg-[#0b4f6c] text-white ring-4 ring-[#0b4f6c]/20'
                      : 'bg-gray-200 text-gray-500',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                {completed ? <Check size={13} strokeWidth={3} /> : step}
              </div>
              <span
                className={[
                  'text-[10px] font-medium leading-tight text-center hidden sm:block',
                  active ? 'text-[#0b4f6c]' : 'text-gray-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
