/**
 * Endpoints REST do backoffice consumidos pelas telas.
 * Em testes, o módulo é substituído por um dublê (`jest.mock('@/services/backoffice')`).
 */
import type { AccountDTO, DashboardMetrics, PageDTO, ProposalDTO } from '@/lib/types';
import { api } from './api';

export async function listAccounts(status?: AccountDTO['status']): Promise<PageDTO<AccountDTO>> {
  const { data } = await api.get<PageDTO<AccountDTO>>('/api/accounts', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function approveAccount(id: string): Promise<AccountDTO> {
  const { data } = await api.patch<AccountDTO>(`/api/accounts/${id}/approve`);
  return data;
}

export async function rejectAccount(id: string, reason: string): Promise<AccountDTO> {
  const { data } = await api.patch<AccountDTO>(`/api/accounts/${id}/reject`, { reason });
  return data;
}

export async function listProposals(status?: ProposalDTO['status']): Promise<PageDTO<ProposalDTO>> {
  const { data } = await api.get<PageDTO<ProposalDTO>>('/api/loans/consignado', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function approveProposal(id: string): Promise<ProposalDTO> {
  const { data } = await api.patch<ProposalDTO>(`/api/loans/${id}/approve`);
  return data;
}

export async function rejectProposal(id: string, reason: string): Promise<ProposalDTO> {
  const { data } = await api.patch<ProposalDTO>(`/api/loans/${id}/reject`, { reason });
  return data;
}

export async function getMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get<DashboardMetrics>('/api/metrics');
  return data;
}
