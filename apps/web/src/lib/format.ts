import { formatCurrencyBRL, formatCpf as formatCpfShared, formatPercentBR } from '@aurora/shared';

/** Centavos → "R$ 1.234,56". */
export function brlFromCents(cents: number): string {
  return formatCurrencyBRL(cents / 100);
}

/** Fração decimal → "1,65%". */
export function percent(rate: number, decimals = 2): string {
  return formatPercentBR(rate, decimals);
}

/** Percentual já em pontos (ex.: 12.4) → "12,4%". */
export function percentFromPoints(points: number, decimals = 1): string {
  return formatPercentBR(points / 100, decimals);
}

/** CPF mascarado para listagens. */
export function cpf(value: string): string {
  return formatCpfShared(value);
}

/** Data ISO → "05 fev 2025, 14:32". */
export function dateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
    .format(new Date(iso))
    .replace('.', '');
}

/** Iniciais para avatar. */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
