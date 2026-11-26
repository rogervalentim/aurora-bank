import type { LoanStatus } from './enums';

/** Resultado do cálculo financeiro de uma proposta de consignado. */
export interface ConsignadoCalculation {
  /** Valor solicitado (PV) em reais. */
  readonly amount: number;
  /** Número de parcelas (n). */
  readonly installments: number;
  /** Taxa mensal aplicada em fração decimal (ex.: 0.0165). */
  readonly monthlyRate: number;
  /** Parcela fixa calculada pela Tabela Price (PMT), arredondada a 2 casas. */
  readonly installmentAmount: number;
  /** Total a pagar (parcela × n), arredondado a 2 casas. */
  readonly totalAmount: number;
  /** Juros totais (total − valor solicitado), arredondado a 2 casas. */
  readonly totalInterest: number;
  /** Custo Efetivo Total anual em fração decimal (ex.: 0.2189). */
  readonly annualCet: number;
  /** Custo Efetivo Total anual em percentual (ex.: 21.89). */
  readonly annualCetPercent: number;
  /** Teto da margem consignável em reais (35% da renda). */
  readonly marginLimit: number;
  /** Valor máximo de parcela permitido pela margem consignável. */
  readonly maxInstallment: number;
  /** Percentual da renda comprometido pela parcela (ex.: 12.5). */
  readonly committedIncomePercent: number;
  /** `true` quando a parcela não excede o teto legal de 35% da renda. */
  readonly isWithinMargin: boolean;
}

/** Proposta de crédito consignado. */
export interface ConsignadoProposal {
  readonly id: string;
  readonly accountId: string;
  readonly customerName: string;
  readonly cpf: string;
  readonly employmentType: 'INSS' | 'PUBLIC_SERVANT' | 'CLT';
  /** Renda mensal declarada em reais. */
  readonly monthlyIncome: number;
  readonly amount: number;
  readonly installments: number;
  /** Taxa mensal em fração decimal (ex.: 0.0165). */
  readonly monthlyRate: number;
  readonly installmentAmount: number;
  readonly totalAmount: number;
  readonly annualCetPercent: number;
  readonly status: LoanStatus;
  readonly isWithinMargin: boolean;
  /** ISO 8601 (UTC). */
  readonly createdAt: string;
  readonly reviewedAt?: string;
  readonly reviewedBy?: string;
  readonly rejectionReason?: string;
}
