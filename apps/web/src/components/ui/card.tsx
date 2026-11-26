import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Superfície branca com borda sutil de 1px e sombra suave (SPEC §4). */
export function Card({
  children,
  className,
  as: Tag = 'section',
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'section' | 'div' | 'article';
}) {
  return (
    <Tag className={cn('rounded-[14px] border border-line bg-card shadow-card', className)}>{children}</Tag>
  );
}

/** Cabeçalho de card: título + ação opcional. */
export function CardHeader({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="space-y-0.5">
        <h2 className="font-display text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="text-[13px] leading-5 text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
