import { Calendar } from 'lucide-react';

interface DeadlineItem {
  university_id: string;
  university_name: string;
  university_abbreviation: string;
  days_left: number;
}

interface DeadlineTrackerProps {
  deadlines: DeadlineItem[];
}

function urgencyClasses(days: number): { dot: string; text: string; bg: string } {
  if (days <= 7)  return { dot: 'bg-[#e63946]', text: 'text-[#e63946]', bg: 'border-l-[#e63946]'  };
  if (days <= 30) return { dot: 'bg-amber-500', text: 'text-amber-600',  bg: 'border-l-amber-400'  };
  return             { dot: 'bg-[#1ec97e]',  text: 'text-[#1ec97e]',   bg: 'border-l-[#1ec97e]'  };
}

export default function DeadlineTracker({ deadlines }: DeadlineTrackerProps) {
  if (deadlines.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
        <Calendar size={12} />
        Upcoming deadlines
      </h2>

      <div className="space-y-2">
        {deadlines.map((d) => {
          const uc = urgencyClasses(d.days_left);
          return (
            <div
              key={d.university_id}
              className={`flex items-center gap-4 rounded-xl border border-gray-200 border-l-4 ${uc.bg} bg-white px-4 py-3`}
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${uc.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {d.university_name}
                </p>
              </div>
              <div className={`shrink-0 text-right text-xs font-bold ${uc.text}`}>
                {d.days_left === 1 ? '1 day left' : `${d.days_left} days left`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
