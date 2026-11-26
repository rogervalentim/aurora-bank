'use client';

import { useState } from 'react';
import { CheckCircle2, CircleSlash, FileX2, RefreshCw } from 'lucide-react';
import { LoanStatusBadge, MarginBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Label, MarginBar, Money } from '@/components/ui/data';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/feedback';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/lib/use-async';
import { brlFromCents, cpf, dateTime, percent, percentFromPoints } from '@/lib/format';
import type { ProposalDTO } from '@/lib/types';
import { approveProposal, listProposals, rejectProposal } from '@/services/backoffice';

/** Mesa de crédito consignado: fila de propostas e decisão. */
export function LoansDesk({ onNotify }: { readonly onNotify: (message: string) => void }) {
  const [selected, setSelected] = useState<ProposalDTO | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  const { data, loading, error, reload } = useAsync(() => listProposals('UNDER_REVIEW'), []);
  const rows = data?.items ?? [];

  async function handleApprove(proposal: ProposalDTO): Promise<void> {
    setBusy('approve');
    try {
      await approveProposal(proposal.id);
      onNotify(`Crédito de ${proposal.customerName} aprovado e creditado na conta.`);
      setSelected(null);
      reload();
    } catch {
      onNotify('Não foi possível aprovar o crédito. Tente novamente.');
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
      await rejectProposal(selected.id, reason.trim());
      onNotify(`Proposta de ${selected.customerName} recusada.`);
      setSelected(null);
      setReason('');
      reload();
    } catch {
      onNotify('Não foi possível recusar a proposta. Tente novamente.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Mesa de crédito consignado"
        description="Enquadramento automático na margem legal de 35% da renda declarada."
        action={
          <Button variant="secondary" onClick={reload} aria-label="Recarregar propostas">
            <RefreshCw size={14} strokeWidth={1.75} aria-hidden />
          </Button>
        }
      />

      {error ? (
        <div className="p-5">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      ) : loading ? (
        <TableSkeleton rows={3} columns={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FileX2}
          title="Mesa livre"
          description="Nenhuma proposta aguardando decisão. Novas solicitações do app chegam aqui em tempo real."
        />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((proposal) => (
            <li key={proposal.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-medium text-ink">{proposal.customerName}</p>
                  <LoanStatusBadge status={proposal.status} />
                </div>
                <p className="numeric text-[12px] text-muted tabular-nums">
                  {cpf(proposal.cpf)} · renda {brlFromCents(proposal.monthlyIncomeCents)} · {proposal.employmentType}
                </p>
                <p className="text-[12px] text-muted">Solicitada em {dateTime(proposal.createdAt)}</p>
              </div>

              <div>
                <Label>Parcela {proposal.installments}x</Label>
                <Money value={brlFromCents(proposal.installmentAmountCents)} />
                <p className="numeric mt-0.5 text-[11px] text-muted tabular-nums">
                  {percent(proposal.monthlyRate)} a.m. · CET {percentFromPoints(proposal.annualCetPercent)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Margem comprometida</Label>
                <MarginBar percent={proposal.committedIncomePercent} />
                <MarginBadge isWithinMargin={proposal.isWithinMargin} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelected(proposal)}>
                  Revisar
                </Button>
                <Button
                  tone="accent"
                  loading={busy === 'approve'}
                  onClick={() => handleApprove(proposal)}
                  disabled={!proposal.isWithinMargin}
                  title={proposal.isWithinMargin ? undefined : 'Parcela acima da margem de 35%'}
                >
                  <CheckCircle2 size={14} strokeWidth={2} aria-hidden />
                  Aprovar crédito
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={selected !== null}
        title={selected ? `Proposta de ${selected.customerName}` : 'Proposta'}
        description="Confira o cálculo antes de aprovar o desembolso."
        onClose={() => {
          setSelected(null);
          setReason('');
        }}
        footer={
          <>
            <Button variant="secondary" tone="danger" loading={busy === 'reject'} onClick={handleReject}>
              <CircleSlash size={14} strokeWidth={1.75} aria-hidden />
              Recusar
            </Button>
            <Button
              tone="accent"
              loading={busy === 'approve'}
              onClick={() => (selected ? handleApprove(selected) : undefined)}
              disabled={selected ? !selected.isWithinMargin : true}
            >
              <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden />
              Aprovar e creditar
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'Valor solicitado', value: brlFromCents(selected.amountCents) },
                { label: 'Total a pagar', value: brlFromCents(selected.totalAmountCents) },
                { label: 'Parcela', value: `${brlFromCents(selected.installmentAmountCents)} × ${selected.installments}` },
                { label: 'Taxa mensal', value: percent(selected.monthlyRate) },
                { label: 'CET anual', value: percentFromPoints(selected.annualCetPercent) },
                { label: 'Teto da margem', value: brlFromCents(selected.marginLimitCents) },
              ].map((item) => (
                <div key={item.label}>
                  <dt>
                    <Label>{item.label}</Label>
                  </dt>
                  <dd className="numeric mt-1 text-[14px] tabular-nums text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-[10px] border border-line bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <Label>Comprometimento da renda</Label>
                <MarginBadge isWithinMargin={selected.isWithinMargin} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="numeric text-[13px] tabular-nums text-ink">
                  {percentFromPoints(selected.committedIncomePercent)}
                </span>
                <span className="text-[12px] text-muted">limite legal 35%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="loan-reject-reason" className="block text-[12px] font-medium text-ink-soft">
                Motivo da recusa (obrigatório para recusar)
              </label>
              <textarea
                id="loan-reject-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                maxLength={280}
                placeholder="Ex.: renda não comprovada pelo contracheque."
                className="w-full resize-none rounded-[10px] border border-line bg-card px-3 py-2 text-[13px] placeholder:text-slate-400 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}
