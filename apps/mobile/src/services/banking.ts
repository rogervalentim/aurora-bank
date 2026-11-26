import type { EmploymentType } from '@aurora/shared';
import { http } from './api';
import type { AccountDTO, HomeDTO, PageDTO, PixKeyDTO, PixTransferDTO, ProposalDTO, TransactionDTO } from '@/lib/types';

/** Payload do onboarding financeiro. */
export interface OpenAccountInput {
  readonly fullName: string;
  readonly cpf: string;
  readonly email: string;
  readonly monthlyIncome: number;
  readonly employmentType: EmploymentType;
}

/** Cria a conta do cliente (entra na fila de KYC do backoffice). */
export async function openAccount(input: OpenAccountInput): Promise<AccountDTO> {
  const { data } = await http.post<AccountDTO>('/api/accounts', input);
  return data;
}

/** Busca uma conta pelo id. */
export async function getAccount(accountId: string): Promise<AccountDTO> {
  const { data } = await http.get<PageDTO<AccountDTO>>('/api/accounts');
  const account = data.items.find((item) => item.id === accountId);
  if (!account) throw new Error('Conta não encontrada.');
  return account;
}

/** Home: conta + extrato. */
export async function getHome(accountId: string): Promise<HomeDTO> {
  const [account, transactions] = await Promise.all([
    getAccount(accountId),
    http.get<PageDTO<TransactionDTO>>('/api/transactions'),
  ]);
  return {
    account,
    transactions: transactions.data.items.filter((item) => item.accountId === accountId).slice(0, 20),
  };
}

/** Simula um consignado (cálculo feito pelo backoffice). */
export async function simulateConsignado(input: {
  accountId: string;
  amount: number;
  installments: number;
}): Promise<ProposalDTO> {
  const { data } = await http.post<ProposalDTO>('/api/loans/consignado', {
    ...input,
    monthlyRate: 0.0165,
  });
  return data;
}

/** Envia a proposta simulada para a mesa de crédito. */
export async function submitProposal(input: {
  accountId: string;
  amount: number;
  installments: number;
}): Promise<ProposalDTO> {
  return simulateConsignado(input);
}

/** Cadastra uma chave Pix. */
export async function createPixKey(input: {
  accountId: string;
  type: PixKeyDTO['type'];
  value: string;
}): Promise<PixKeyDTO> {
  const { data } = await http.post<PixKeyDTO>('/api/pix/keys', input);
  return data;
}

/** Envia um Pix. */
export async function sendPix(input: {
  senderAccountId: string;
  receiverKey: string;
  amountCents: number;
  description?: string;
}): Promise<PixTransferDTO> {
  const { data } = await http.post<PixTransferDTO>('/api/pix/transfers', input);
  return data;
}
