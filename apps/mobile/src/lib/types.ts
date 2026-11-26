/**
 * DTOs que a API do backoffice expõe ao app (valores em centavos).
 * Espelham `apps/web/src/lib/types.ts`.
 */
import type { AccountStatus, EmploymentType, LoanStatus, TransactionType } from '@aurora/shared';

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

export interface TransactionDTO {
  readonly id: string;
  readonly accountId: string;
  readonly direction: 'CREDIT' | 'DEBIT';
  readonly type: TransactionType;
  readonly amountCents: number;
  readonly description: string;
  readonly createdAt: string;
}

export interface PixKeyDTO {
  readonly id: string;
  readonly accountId: string;
  readonly type: 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';
  readonly value: string;
  readonly createdAt: string;
}

export interface PixTransferDTO {
  readonly id: string;
  readonly endToEndId: string;
  readonly receiverName: string;
  readonly receiverKey: string;
  readonly amountCents: number;
  readonly status: 'COMPLETED' | 'FAILED';
  readonly createdAt: string;
}

export interface PageDTO<T> {
  readonly items: readonly T[];
  readonly total: number;
}

/** Conta do cliente logado no app, já com o extrato mais recente. */
export interface HomeDTO {
  readonly account: AccountDTO;
  readonly transactions: readonly TransactionDTO[];
}

export type { AccountStatus, EmploymentType, LoanStatus, TransactionType };
