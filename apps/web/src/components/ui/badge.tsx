import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { AccountStatus, LoanStatus } from '@/lib/types';

type Tone = 'neutral' | 'positive' | 'warning' | 'danger';

const TONES: Readonly<Record<Tone, string>> = {
  neutral: 'border-line bg-slate-50 text-ink-soft',
  positive: 'border-accent/25 bg-accent/10 text-accent-ink',
  warning: 'border-warn/25 bg-warn/10 text-amber-700',
  danger: 'border-danger/25 bg-danger/10 text-red-700',
};

/** Selo compacto de status. */
export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  readonly tone?: Tone;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium leading-5',
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

const ACCOUNT_LABELS: Readonly<Record<AccountStatus, { label: string; tone: Tone }>> = {
  PENDING_KYC: { label: 'Em análise', tone: 'warning' },
  ACTIVE: { label: 'Conta ativa', tone: 'positive' },
  BLOCKED: { label: 'Bloqueada', tone: 'danger' },
};

/** Status de conta (KYC). */
export function AccountStatusBadge({ status }: { readonly status: AccountStatus }) {
  const { label, tone } = ACCOUNT_LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

const LOAN_LABELS: Readonly<Record<LoanStatus, { label: string; tone: Tone }>> = {
  SIMULATED: { label: 'Simulada', tone: 'neutral' },
  UNDER_REVIEW: { label: 'Em análise', tone: 'warning' },
  APPROVED: { label: 'Aprovada', tone: 'positive' },
  REJECTED: { label: 'Recusada', tone: 'danger' },
};

/** Status de proposta de consignado. */
export function LoanStatusBadge({ status }: { readonly status: LoanStatus }) {
  const { label, tone } = LOAN_LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

/** Enquadramento na margem de 35%. */
export function MarginBadge({ isWithinMargin }: { readonly isWithinMargin: boolean }) {
  return (
    <Badge tone={isWithinMargin ? 'positive' : 'danger'}>{isWithinMargin ? 'Dentro da margem' : 'Acima da margem'}</Badge>
  );
}
