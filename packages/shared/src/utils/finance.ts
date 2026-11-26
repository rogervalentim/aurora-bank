import { BUSINESS_RULES } from '../constants';
import type { ConsignadoCalculation } from '../types/consignado';
import { assertPositiveFinite, roundMoney, roundTo } from './number';

/** Resultado de uma simulação de consignado, com validação de margem. */
export type ConsignadoSimulationResult = ConsignadoCalculation;

/** Percentual da renda comprometido por uma parcela. */
export function calculateMarginCommitment(installmentAmount: number, monthlyIncome: number): number {
  assertPositiveFinite(monthlyIncome, 'monthlyIncome');
  return roundTo((installmentAmount / monthlyIncome) * 100, 2);
}

/** Teto legal da margem consignável para uma renda mensal (35%). */
export function calculateMarginLimit(monthlyIncome: number): number {
  assertPositiveFinite(monthlyIncome, 'monthlyIncome');
  return roundMoney(monthlyIncome * BUSINESS_RULES.CONSIGNADO_MARGIN_RATE);
}

/**
 * Verifica se uma parcela respeita o limite legal de 35% da renda mensal.
 * Compara com tolerância de centavos para evitar erros de ponto flutuante.
 */
export function isWithinConsignableMargin(installmentAmount: number, monthlyIncome: number): boolean {
  assertPositiveFinite(installmentAmount, 'installmentAmount');
  return installmentAmount <= calculateMarginLimit(monthlyIncome) + 0.005;
}

/**
 * Calcula a parcela fixa pela Tabela Price:
 * `PMT = PV * (i * (1 + i)^n) / ((1 + i)^n - 1)`.
 * Com taxa zero, degrada para amortização simples (`PV / n`).
 */
export function calculatePriceInstallment(amount: number, installments: number, monthlyRate: number): number {
  assertPositiveFinite(amount, 'amount');
  assertPositiveFinite(installments, 'installments');
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
    throw new RangeError(`monthlyRate deve ser um número finito e não negativo (recebido: ${monthlyRate}).`);
  }
  if (!Number.isInteger(installments)) {
    throw new RangeError(`installments deve ser um inteiro (recebido: ${installments}).`);
  }
  if (monthlyRate === 0) {
    return roundMoney(amount / installments);
  }
  const factor = (1 + monthlyRate) ** installments;
  return roundMoney((amount * (monthlyRate * factor)) / (factor - 1));
}

/**
 * Custo Efetivo Total anual a partir da taxa mensal, com capitalização composta:
 * `CET_anual = (1 + i)^12 - 1`.
 */
export function calculateAnnualCet(monthlyRate: number): number {
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
    throw new RangeError(`monthlyRate deve ser um número finito e não negativo (recebido: ${monthlyRate}).`);
  }
  return roundTo((1 + monthlyRate) ** 12 - 1, 6);
}

/**
 * Simula um crédito consignado completo: parcela Price, total, juros, CET anual
 * e enquadramento na margem consignável de 35% da renda.
 */
export function calculateConsignado(
  amount: number,
  installments: number,
  monthlyRate: number,
  monthlyIncome: number,
): ConsignadoSimulationResult {
  assertPositiveFinite(monthlyIncome, 'monthlyIncome');
  const installmentAmount = calculatePriceInstallment(amount, installments, monthlyRate);
  const totalAmount = roundMoney(installmentAmount * installments);
  const annualCet = calculateAnnualCet(monthlyRate);
  const marginLimit = calculateMarginLimit(monthlyIncome);

  return {
    amount,
    installments,
    monthlyRate,
    installmentAmount,
    totalAmount,
    totalInterest: roundMoney(totalAmount - amount),
    annualCet,
    annualCetPercent: roundTo(annualCet * 100, 2),
    marginLimit,
    maxInstallment: marginLimit,
    committedIncomePercent: calculateMarginCommitment(installmentAmount, monthlyIncome),
    isWithinMargin: isWithinConsignableMargin(installmentAmount, monthlyIncome),
  };
}
