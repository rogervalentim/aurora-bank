import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Botão primário (navy) e secundário (contorno), com estado de carregamento. */
export function Button({
  children,
  variant = 'primary',
  tone = 'ink',
  loading = false,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly tone?: 'ink' | 'accent' | 'danger';
  readonly loading?: boolean;
}) {
  const palette =
    tone === 'accent'
      ? 'bg-accent text-white hover:bg-emerald-600 disabled:bg-accent/50'
      : tone === 'danger'
        ? 'bg-danger text-white hover:bg-red-600 disabled:bg-danger/50'
        : 'bg-ink text-white hover:bg-slate-800 disabled:bg-ink/50';

  const styles =
    variant === 'primary'
      ? palette
      : variant === 'secondary'
        ? 'border border-line bg-card text-ink hover:border-slate-300 hover:bg-slate-50'
        : 'text-ink-soft hover:bg-slate-100';

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-70',
        styles,
        className,
      )}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
      {children}
    </button>
  );
}
