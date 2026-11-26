import { View } from 'react-native';
import type { AccountStatus, LoanStatus } from '@aurora/shared';
import { Text } from './text';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'warn' | 'danger' | 'neutral';

const toneClass: Record<Tone, string> = {
  success: 'bg-emerald-50 border-emerald-200',
  warn: 'bg-amber-50 border-amber-200',
  danger: 'bg-red-50 border-red-200',
  neutral: 'bg-slate-50 border-line',
};

const toneText: Record<Tone, string> = {
  success: 'text-emerald-700',
  warn: 'text-amber-700',
  danger: 'text-red-700',
  neutral: 'text-slate-600',
};

export function Badge({ label, tone = 'neutral', testID }: { label: string; tone?: Tone; testID?: string }) {
  return (
    <View className={cn('self-start rounded-full border px-2.5 py-1', toneClass[tone])} testID={testID}>
      <Text className={cn('text-[11px] font-bold uppercase tracking-[0.06em]', toneText[tone])}>{label}</Text>
    </View>
  );
}

const accountStatusMap: Record<AccountStatus, { label: string; tone: Tone }> = {
  PENDING_KYC: { label: 'Em análise', tone: 'warn' },
  ACTIVE: { label: 'Ativa', tone: 'success' },
  BLOCKED: { label: 'Bloqueada', tone: 'danger' },
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const { label, tone } = accountStatusMap[status];
  return <Badge label={label} tone={tone} testID={`account-status-${status}`} />;
}

const loanStatusMap: Record<LoanStatus, { label: string; tone: Tone }> = {
  SIMULATED: { label: 'Simulada', tone: 'neutral' },
  UNDER_REVIEW: { label: 'Em análise', tone: 'warn' },
  APPROVED: { label: 'Aprovado', tone: 'success' },
  REJECTED: { label: 'Recusado', tone: 'danger' },
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const { label, tone } = loanStatusMap[status];
  return <Badge label={label} tone={tone} testID={`loan-status-${status}`} />;
}
