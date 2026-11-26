import { BUSINESS_RULES, formatCurrencyBRL, formatDecimalBRL, formatPercentBR } from '@aurora/shared';

/** "R$ 1.234,56" a partir de centavos (formato da API). */
export function brlFromCents(cents: number): string {
  return formatCurrencyBRL(cents / 100);
}

/** Valor em reais (sem símbolo) a partir de centavos: "1.234,56". */
export function decimalFromCents(cents: number): string {
  return formatDecimalBRL(cents / 100);
}

/** Taxa mensal em fração decimal: 0.0165 → "1,65%". */
export function percentFromRate(rate: number, decimals = 2): string {
  return formatPercentBR(rate, decimals);
}

/** Percentual já em pontos: 35.27 → "35,27%". */
export function percentFromPoints(points: number, decimals = 2): string {
  return formatPercentBR(points / 100, decimals);
}

/** "1.234,56" → 123456 (centavos). Tolerante a símbolos e espaços. */
export function centsFromInput(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/** "05 de fev de 2025, 14:32" no fuso do aparelho. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(BUSINESS_RULES.LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "05 fev" — usado no extrato. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(BUSINESS_RULES.LOCALE, { day: '2-digit', month: 'short' });
}

/** "12x" */
export function formatInstallments(installments: number): string {
  return `${installments}x`;
}

/** Máscara de digitação para valores: 123456 → "1.234,56". */
export function maskAmountInput(digits: string): string {
  const onlyDigits = digits.replace(/\D/g, '').slice(0, 11);
  if (onlyDigits.length === 0) return '';
  const cents = Number.parseInt(onlyDigits, 10);
  return formatDecimalBRL(cents / 100);
}
