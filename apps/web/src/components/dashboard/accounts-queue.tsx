'use client';

import { useMemo, useState } from 'react';
import { Inbox, RefreshCw, Search, ShieldCheck, UserX } from 'lucide-react';
import { Badge, AccountStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/data';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/feedback';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/lib/use-async';
import { brlFromCents, cpf, dateTime, initials } from '@/lib/format';
import type { AccountDTO, AccountStatus } from '@/lib/types';
import { approveAccount, listAccounts, rejectAccount } from '@/services/backoffice';

const FILTERS: ReadonlyArray<{ value: AccountStatus | 'ALL'; label: string }> = [
  { value: 'PENDING_KYC', label: 'Em análise' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'BLOCKED', label: 'Bloqueadas' },
  { value: 'ALL', label: 'Todas' },
];

const EMPLOYMENT_LABEL: Readonly<Record<AccountDTO['employmentType'], string>> = {
  INSS: 'Aposentado/pensionista INSS',
  PUBLIC_SERVANT: 'Servidor público',
  CLT: 'CLT',
};

/** Fila de aprovação de contas (KYC) com modal de auditoria. */
export function AccountsQueue({ onNotify }: { readonly onNotify: (message: string) => void }) {
  const [status, setStatus] = useState<AccountStatus | 'ALL'>('PENDING_KYC');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AccountDTO | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  const { data, loading, error, reload } = useAsync(
    () => listAccounts(status === 'ALL' ? undefined : status),
    [status],
  );

  const rows = useMemo(() => {
    const items = data?.items ?? [];

    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (account) =>
        account.fullName.toLowerCase().includes(term) ||
        account.email.toLowerCase().includes(term) ||
        account.cpf.includes(term.replace(/\D/g, '')),
    );
  }, [data, query]);

  async function handleApprove(): Promise<void> {
    if (!selected) return;
    setBusy('approve');
    try {
      await approveAccount(selected.id);
      onNotify(`Conta de ${selected.fullName} aprovada.`);
      setSelected(null);
      reload();
    } catch {
      onNotify('Não foi possível aprovar a conta. Tente novamente.');
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(): Promise<void> {
    if (!selected) return;
    if (reason.trim().length < 5) {
      onNotify('Descreva o motivo da recusa (mínimo 5 caracteres).');
      return;
    }
    setBusy('reject');
    try {
      await rejectAccount(selected.id, reason.trim());
      onNotify(`Conta de ${selected.fullName} reprovada.`);
      setSelected(null);
      setReason('');
      reload();
    } catch {
      onNotify('Não foi possível reprovar a conta. Tente novamente.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Aprovação de contas"
        description="Audite os dados declarados antes de liberar o acesso à conta."
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} strokeWidth={1.75} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, CPF ou e-mail"
                aria-label="Buscar contas"
                className="w-64 rounded-[9px] border border-line bg-card py-1.5 pl-8 pr-2.5 text-[13px] placeholder:text-slate-400 focus:border-accent focus:outline-none"
              />
            </div>
            <Button variant="secondary" onClick={reload} aria-label="Recarregar contas">
              <RefreshCw size={14} strokeWidth={1.75} aria-hidden />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5 border-b border-line px-5 py-3">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            aria-pressed={status === filter.value}
            className={
              status === filter.value
                ? 'rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-white'
                : 'rounded-full border border-line px-3 py-1 text-[12px] text-ink-soft hover:bg-slate-50'
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="p-5">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      ) : loading ? (
        <TableSkeleton rows={3} columns={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhuma conta nesta fila"
          description="Quando um cliente abrir conta no app, ela aparece aqui para auditoria de KYC."
        />
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-slate-500">
              <th scope="col" className="px-5 py-2.5 font-medium">Cliente</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Vínculo</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Renda</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Entrada</th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((account) => (
              <tr key={account.id} className="border-b border-line/70 last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-ink-soft">
                      {initials(account.fullName)}
                    </span>
                    <div className="leading-tight">
                      <p className="text-[13px] font-medium text-ink">{account.fullName}</p>
                      <p className="numeric text-[12px] text-muted tabular-nums">{cpf(account.cpf)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[13px] text-ink-soft">{EMPLOYMENT_LABEL[account.employmentType]}</td>
                <td className="numeric px-3 py-3 text-right text-[13px] tabular-nums text-ink">
                  {brlFromCents(account.monthlyIncomeCents)}
                </td>
                <td className="px-3 py-3">
                  <AccountStatusBadge status={account.status} />
                </td>
                <td className="px-3 py-3 text-[12px] text-muted">{dateTime(account.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <Button variant="secondary" onClick={() => setSelected(account)}>
                    Auditar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={selected !== null}
        title={selected ? `Auditoria de ${selected.fullName}` : 'Auditoria'}
        description="Confira os dados declarados no onboarding antes de decidir."
        onClose={() => {
          setSelected(null);
          setReason('');
        }}
        footer={
          <>
            <Button
              variant="secondary"
              tone="danger"
              loading={busy === 'reject'}
              onClick={handleReject}
              disabled={selected?.status !== 'PENDING_KYC'}
            >
              <UserX size={14} strokeWidth={1.75} aria-hidden />
              Reprovar
            </Button>
            <Button
              tone="accent"
              loading={busy === 'approve'}
              onClick={handleApprove}
              disabled={selected?.status !== 'PENDING_KYC'}
            >
              <ShieldCheck size={14} strokeWidth={1.75} aria-hidden />
              Aprovar conta
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'CPF', value: cpf(selected.cpf), numeric: true },
                { label: 'E-mail', value: selected.email, numeric: false },
                { label: 'Vínculo', value: EMPLOYMENT_LABEL[selected.employmentType], numeric: false },
                { label: 'Renda declarada', value: brlFromCents(selected.monthlyIncomeCents), numeric: true },
                { label: 'Saldo atual', value: brlFromCents(selected.balanceCents), numeric: true },
                { label: 'Abertura', value: dateTime(selected.createdAt), numeric: false },
              ].map((item) => (
                <div key={item.label}>
                  <dt>
                    <Label>{item.label}</Label>
                  </dt>
                  <dd className={item.numeric ? 'numeric mt-1 text-[14px] tabular-nums text-ink' : 'mt-1 text-[14px] text-ink'}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex items-center gap-2">
              <AccountStatusBadge status={selected.status} />
              {selected.rejectionReason ? (
                <Badge tone="danger">{selected.rejectionReason}</Badge>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reject-reason" className="block text-[12px] font-medium text-ink-soft">
                Motivo da recusa (obrigatório para reprovar)
              </label>
              <textarea
                id="reject-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                maxLength={280}
                placeholder="Ex.: CPF divergente da base da Receita."
                className="w-full resize-none rounded-[10px] border border-line bg-card px-3 py-2 text-[13px] placeholder:text-slate-400 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}
