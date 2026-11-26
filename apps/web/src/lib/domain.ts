import { calculateConsignado } from '@aurora/shared';
import type { AccountDTO, ProposalDTO, TransactionDTO } from '@/lib/types';

/** Conta e movimentações de um cliente. */
export interface AccountRecord {
  account: AccountDTO;
  transactions: TransactionDTO[];
}

/** Estado em memória do banco sandbox. */
export interface DbState {
  accounts: AccountRecord[];
  proposals: ProposalDTO[];
}

/** Cria uma conta com status `PENDING_KYC` e saldo inicial configurável. */
export function createAccount(
  input: {
    readonly id: string;
    readonly fullName: string;
    readonly cpf: string;
    readonly email: string;
    readonly monthlyIncomeCents: number;
    readonly employmentType: AccountDTO['employmentType'];
  },
  options: { readonly initialBalanceCents: number; readonly now: string },
): AccountRecord {
  const account: AccountDTO = {
    id: input.id,
    userId: input.id,
    fullName: input.fullName,
    cpf: input.cpf,
    email: input.email,
    balanceCents: options.initialBalanceCents,
    monthlyIncomeCents: input.monthlyIncomeCents,
    employmentType: input.employmentType,
    status: 'PENDING_KYC',
    createdAt: options.now,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };

  const transactions: TransactionDTO[] =
    options.initialBalanceCents > 0
      ? [
          {
            id: `${input.id}-bonus`,
            accountId: input.id,
            direction: 'CREDIT',
            type: 'BONUS',
            amountCents: options.initialBalanceCents,
            description: 'Bônus de boas-vindas (sandbox)',
            createdAt: options.now,
          },
        ]
      : [];

  return { account, transactions };
}

/** Cria a proposta a partir da simulação (valores em centavos → reais no cálculo). */
export function createProposal(
  input: {
    readonly id: string;
    readonly account: AccountDTO;
    readonly amountCents: number;
    readonly installments: number;
    readonly monthlyRate: number;
    readonly now: string;
  },
): ProposalDTO {
  const simulation = calculateConsignado(
    input.amountCents / 100,
    input.installments,
    input.monthlyRate,
    input.account.monthlyIncomeCents / 100,
  );

  return {
    id: input.id,
    accountId: input.account.id,
    customerName: input.account.fullName,
    cpf: input.account.cpf,
    employmentType: input.account.employmentType,
    monthlyIncomeCents: input.account.monthlyIncomeCents,
    amountCents: input.amountCents,
    installments: input.installments,
    monthlyRate: input.monthlyRate,
    installmentAmountCents: Math.round(simulation.installmentAmount * 100),
    totalAmountCents: Math.round(simulation.totalAmount * 100),
    annualCetPercent: simulation.annualCetPercent,
    committedIncomePercent: simulation.committedIncomePercent,
    marginLimitCents: Math.round(simulation.marginLimit * 100),
    isWithinMargin: simulation.isWithinMargin,
    status: 'UNDER_REVIEW',
    createdAt: input.now,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };
}
