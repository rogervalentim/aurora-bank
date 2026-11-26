import { BUSINESS_RULES } from '../constants';

const brlFormatter = new Intl.NumberFormat(BUSINESS_RULES.LOCALE, {
  style: 'currency',
  currency: BUSINESS_RULES.CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plainFormatter = new Intl.NumberFormat(BUSINESS_RULES.LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata um valor em reais no padrão `pt-BR`: `1234.5` → `"R$ 1.234,50"`.
 * O separador é o espaço não separável (U+00A0) usado pelo `Intl`.
 */
export function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Valor inválido para formatação monetária: ${value}.`);
  }
  // Normaliza -0 para 0 para não exibir "-R$ 0,00".
  const safeValue = Object.is(value, -0) ? 0 : value;
  return brlFormatter.format(safeValue);
}

/** Formata um número no padrão `pt-BR` sem o símbolo da moeda: `1234.5` → `"1.234,50"`. */
export function formatDecimalBRL(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Valor inválido para formatação numérica: ${value}.`);
  }
  return plainFormatter.format(Object.is(value, -0) ? 0 : value);
}

/** Formata uma taxa em percentual `pt-BR`: `0.0165` → `"1,65%"`. */
export function formatPercentBR(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Valor inválido para formatação percentual: ${value}.`);
  }
  return new Intl.NumberFormat(BUSINESS_RULES.LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Converte um texto monetário `pt-BR` em número: `"R$ 1.234,56"` → `1234.56`. */
export function parseCurrencyBRL(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/** Aplica a máscara `000.000.000-00` a um CPF (parcial ou completo). */
export function maskCpf(digits: string): string {
  const value = digits.replace(/\D/g, '').slice(0, 11);
  return value
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

/** Aplica a máscara `(00) 00000-0000` a um telefone brasileiro. */
export function maskPhone(digits: string): string {
  const value = digits.replace(/\D/g, '').slice(0, 11);
  if (value.length < 3) {
    return value.length === 2 ? `(${value})` : value;
  }
  const withDdd = value.replace(/^(\d{2})(\d)/, '($1) $2');
  return value.length <= 10
    ? withDdd.replace(/(\d{4})(\d{1,4})$/, '$1-$2')
    : withDdd.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** Aplica a máscara monetária `R$ 0,00` a um valor em reais. */
export function maskCurrencyBRL(value: number): string {
  return formatCurrencyBRL(Number.isFinite(value) ? value : 0);
}
