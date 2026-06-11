interface StatCardProps {
  label: string;
  value: number;
  color: 'navy' | 'green' | 'amber' | 'red';
}

const COLOR_MAP: Record<StatCardProps['color'], string> = {
  navy:  'text-[#0b4f6c]',
  green: 'text-[#1ec97e]',
  amber: 'text-amber-500',
  red:   'text-[#e63946]',
};

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5">
      <p className={`text-2xl font-bold tabular-nums ${COLOR_MAP[color]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 leading-tight">{label}</p>
    </div>
  );
}
