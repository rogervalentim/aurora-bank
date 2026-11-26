import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import type { AccountDTO, DashboardMetrics, PageDTO, ProposalDTO, TransactionDTO } from '@/lib/types';
import { getDb } from '@/lib/db';
import { createProposal } from '@/lib/domain';
import { ValidationError } from '@/lib/errors';
import { errorResponse, json, readJson } from '@/lib/http';
import {
  accountQuerySchema,
  createAccountBodySchema,
  createLoanBodySchema,
  createPixKeyBodySchema,
  loanQuerySchema,
  rejectionBodySchema,
  transferBodySchema,
} from '@/lib/validation';
import { createAccount as buildAccount } from '@/lib/domain';
import { sandboxBonusCents } from '@/lib/db';
import { onlyDigits } from '@aurora/shared';
import type { z } from 'zod';

/** Resposta para um `ValidationError` do Zod. */
export function validationResponse(error: unknown): ReturnType<typeof errorResponse> {
  if (error instanceof ValidationError) {
    const body = error.toBody();
    return errorResponse(422, body.message, body.fields);
  }
  return errorResponse(500, 'Erro interno ao processar a requisição.');
}

/** Valida o corpo e devolve `null` em caso de falha (o handler devolve 422). */
export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  return schema.parse(body) as z.infer<T>;
}

export function parseQuery<T extends z.ZodTypeAny>(schema: T, request: NextRequest): z.infer<T> {
  const raw: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  return schema.parse(raw) as z.infer<T>;
}

export interface Handlers {
  listAccounts(status?: AccountDTO['status']): PageDTO<AccountDTO>;
  createAccount(input: z.infer<typeof createAccountBodySchema>): AccountDTO;
  approveAccount(id: string): AccountDTO | null;
  rejectAccount(id: string, reason: string): AccountDTO | null;
  listProposals(status?: ProposalDTO['status']): PageDTO<ProposalDTO>;
  createProposal(input: z.infer<typeof createLoanBodySchema>): ProposalDTO | null;
  approveProposal(id: string): ProposalDTO | null;
  rejectProposal(id: string, reason: string): ProposalDTO | null;
  metrics(): DashboardMetrics;
  transactions(): PageDTO<TransactionDTO>;
}

/** Implementação do banco sandbox (Firestore no ambiente real). */
export const sandboxHandlers: Handlers = {
  listAccounts(status) {
    const items = getDb()
      .accounts.map((record) => record.account)
      .filter((account) => (status ? account.status === status : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items, total: items.length };
  },

  createAccount(input) {
    const record = buildAccount(
      {
        id: `acc_${randomUUID().slice(0, 8)}`,
        fullName: input.fullName,
        cpf: onlyDigits(input.cpf),
        email: input.email.toLowerCase(),
        monthlyIncomeCents: Math.round(input.monthlyIncome * 100),
        employmentType: input.employmentType,
      },
      {
        initialBalanceCents: input.initialBalanceCents ?? sandboxBonusCents(),
        now: new Date().toISOString(),
      },
    );
    getDb().accounts.push(record);
    return record.account;
  },

  approveAccount(id) {
    const record = getDb().accounts.find((item) => item.account.id === id);
    if (!record) return null;
    const updated: AccountDTO = {
      ...record.account,
      status: 'ACTIVE',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'analista@aurorabank.com',
      rejectionReason: null,
    };
    record.account = updated;
    return updated;
  },

  rejectAccount(id, reason) {
    const record = getDb().accounts.find((item) => item.account.id === id);
    if (!record) return null;
    const updated: AccountDTO = {
      ...record.account,
      status: 'BLOCKED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'analista@aurorabank.com',
      rejectionReason: reason,
    };
    record.account = updated;
    return updated;
  },

  listProposals(status) {
    const items = getDb()
      .proposals.filter((proposal) => (status ? proposal.status === status : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items, total: items.length };
  },

  createProposal(input) {
    const record = getDb().accounts.find((item) => item.account.id === input.accountId);
    if (!record) return null;
    const proposal = createProposal({
      id: `prop_${randomUUID().slice(0, 8)}`,
      account: record.account,
      amountCents: input.amountCents,
      installments: input.installments,
      monthlyRate: input.monthlyRate,
      now: new Date().toISOString(),
    });
    getDb().proposals.push(proposal);
    return proposal;
  },

  approveProposal(id) {
    const proposal = getDb().proposals.find((item) => item.id === id);
    if (!proposal) return null;
    const updated: ProposalDTO = {
      ...proposal,
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'analista@aurorabank.com',
      rejectionReason: null,
    };
    Object.assign(proposal, updated);

    const record = getDb().accounts.find((item) => item.account.id === proposal.accountId);
    if (record) {
      const netCents = proposal.amountCents;
      record.account = { ...record.account, balanceCents: record.account.balanceCents + netCents };
      record.transactions = [
        {
          id: `txn_${randomUUID().slice(0, 8)}`,
          accountId: record.account.id,
          direction: 'CREDIT',
          type: 'LOAN_DISBURSEMENT',
          amountCents: netCents,
          description: `Crédito consignado ${proposal.installments}x`,
          createdAt: updated.reviewedAt ?? new Date().toISOString(),
        },
        ...record.transactions,
      ];
    }
    return updated;
  },

  rejectProposal(id, reason) {
    const proposal = getDb().proposals.find((item) => item.id === id);
    if (!proposal) return null;
    const updated: ProposalDTO = {
      ...proposal,
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'analista@aurorabank.com',
      rejectionReason: reason,
    };
    Object.assign(proposal, updated);
    return updated;
  },

  metrics() {
    const db = getDb();
    return {
      pendingAccounts: db.accounts.filter((item) => item.account.status === 'PENDING_KYC').length,
      activeAccounts: db.accounts.filter((item) => item.account.status === 'ACTIVE').length,
      proposalsUnderReview: db.proposals.filter((item) => item.status === 'UNDER_REVIEW').length,
      approvedVolumeCents: db.proposals
        .filter((item) => item.status === 'APPROVED')
        .reduce((sum, item) => sum + item.amountCents, 0),
    };
  },

  transactions() {
    const items = getDb()
      .accounts.flatMap((record) => record.transactions)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items, total: items.length };
  },
};

export {
  accountQuerySchema,
  createAccountBodySchema,
  createLoanBodySchema,
  createPixKeyBodySchema,
  json,
  loanQuerySchema,
  readJson,
  rejectionBodySchema,
  transferBodySchema,
};
