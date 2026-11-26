/**
 * Domínio do backoffice.
 * Tipos de enums, cálculo e formatação vêm de `@aurora/shared`; aqui ficam apenas
 * os DTOs que a camada de API expõe para as telas (valores em centavos na API).
 */
import type { AccountStatus, EmploymentType, LoanStatus, TransactionType } from '@aurora/shared';

export type { AccountStatus, EmploymentType, LoanStatus, TransactionType };

/** Conta como a API REST a devolve (valores monetários em centavos). */
export interface AccountDTO {
  readonly id: string;
  readonly userId: string;
  readonly fullName: string;
  readonly cpf: string;
  readonly email: string;
  readonly balanceCents: number;
  readonly monthlyIncomeCents: number;
  readonly employmentType: EmploymentType;
  readonly status: AccountStatus;
  readonly createdAt: string;
  readonly reviewedAt: string | null;
  readonly reviewedBy: string | null;
  readonly rejectionReason: string | null;
}

/** Proposta de consignado como a API REST a devolve. */
export interface ProposalDTO {
  readonly id: string;
  readonly accountId: string;
  readonly customerName: string;
  readonly cpf: string;
  readonly employmentType: EmploymentType;
  readonly monthlyIncomeCents: number;
  readonly amountCents: number;
  readonly installments: number;
  readonly monthlyRate: number;
  readonly installmentAmountCents: number;
  readonly totalAmountCents: number;
  readonly annualCetPercent: number;
  readonly committedIncomePercent: number;
  readonly marginLimitCents: number;
  readonly isWithinMargin: boolean;
  readonly status: LoanStatus;
  readonly createdAt: string;
  readonly reviewedAt: string | null;
  readonly reviewedBy: string | null;
  readonly rejectionReason: string | null;
}

/** Movimentação de extrato. */
export interface TransactionDTO {
  readonly id: string;
  readonly accountId: string;
  readonly direction: 'CREDIT' | 'DEBIT';
  readonly type: TransactionType;
  readonly amountCents: number;
  readonly description: string;
  readonly createdAt: string;
}

/** Métricas do dashboard. */
export interface DashboardMetrics {
  readonly pendingAccounts: number;
  readonly proposalsUnderReview: number;
  readonly approvedVolumeCents: number;
  readonly activeAccounts: number;
}

/** Sessão do analista logado. */
export interface AnalystSession {
  readonly uid: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: 'analyst';
}

/** Corpo de erro padrão da API (ver `ApiError` em @aurora/shared). */
export interface ApiErrorBody {
  readonly code: string;
  readonly status: number;
  readonly message: string;
  readonly fields?: Readonly<Record<string, string>>;
}

/** Resposta paginada da API. */
export interface PageDTO<T> {
  readonly items: readonly T[];
  readonly total: number;
}
