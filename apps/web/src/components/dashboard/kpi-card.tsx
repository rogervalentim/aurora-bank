import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/data';
import { cn } from '@/lib/cn';

/** KPI do dashboard: rótulo discreto + valor tabular. */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly icon: LucideIcon;
  readonly trend?: 'up' | 'down';
}) {
  return (
    <article className="rounded-[14px] border border-line bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <Label>{label}</Label>
        <Icon size={16} strokeWidth={1.5} className="text-slate-400" aria-hidden />
      </div>
      <p className="numeric mt-3 text-[28px] font-semibold leading-none tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-2.5 flex items-center gap-1 text-[12px] text-muted">
        {trend ? (
          <span className={cn('inline-flex items-center', trend === 'up' ? 'text-accent-ink' : 'text-red-700')}>
            {trend === 'up' ? (
              <ArrowUpRight size={13} strokeWidth={2} aria-hidden />
            ) : (
              <ArrowDownRight size={13} strokeWidth={2} aria-hidden />
            )}
          </span>
        ) : null}
        {hint}
      </p>
    </article>
  );
}
