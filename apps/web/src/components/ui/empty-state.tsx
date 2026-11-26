import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Estado vazio com ícone e CTA (SPEC §4). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full border border-line bg-slate-50 text-muted">
        <Icon size={20} strokeWidth={1.5} aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
        <p className="mx-auto max-w-sm text-[13px] leading-5 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
