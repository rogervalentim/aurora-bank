import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Rótulo discreto acima de valores (SPEC §4). */
export function Label({ children, className }: { readonly children: ReactNode; readonly className?: string }) {
  return (
    <span className={cn('block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500', className)}>
      {children}
    </span>
  );
}

/** Valor monetário com algarismos tabulares. */
export function Money({
  value,
  className,
  size = 'md',
}: {
  readonly value: string;
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'text-[13px]',
    md: 'text-[15px] font-semibold',
    lg: 'text-[26px] font-semibold tracking-tight',
  } as const;

  return <span className={cn('numeric tabular-nums text-ink', sizes[size], className)}>{value}</span>;
}

/** Barra de comprometimento de margem: verde ≤ 35%, vermelho acima. */
export function MarginBar({ percent }: { readonly percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const over = percent > 35;

  return (
    <div className="flex items-center gap-2" title={`${percent.toFixed(1)}% da renda comprometida`}>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn('h-full rounded-full', over ? 'bg-danger' : 'bg-accent')}
          style={{ width: `${clamped}%` }}
        />
        <span className="absolute inset-y-0 left-[35%] w-px bg-ink/20" aria-hidden />
      </div>
      <span className={cn('numeric text-[12px] tabular-nums', over ? 'text-red-700' : 'text-accent-ink')}>
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}
