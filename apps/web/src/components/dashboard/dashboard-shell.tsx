'use client';

import { useCallback, useState } from 'react';
import { Banknote, ShieldCheck, Users, Wallet } from 'lucide-react';
import { AccountsQueue } from '@/components/dashboard/accounts-queue';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { LoansDesk } from '@/components/dashboard/loans-desk';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ErrorBanner, Toast } from '@/components/ui/feedback';
import { KpiSkeleton } from '@/components/ui/skeleton';
import { brlFromCents } from '@/lib/format';
import { useAsync } from '@/lib/use-async';
import { getMetrics } from '@/services/backoffice';

/** Dashboard operacional: KPIs + fila KYC + mesa de consignado. */
export function DashboardShell({ analystName }: { readonly analystName: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(getMetrics, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    reload();
  }, [reload]);

  const closeToast = useCallback(() => setToast(null), []);

  return (
    <div className="flex min-h-dvh">
      <Sidebar analystName={analystName} />

      <main className="flex-1 px-8 py-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[12px] text-muted">Operações · {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}</p>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-ink">Fila de aprovações</h1>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {error ? (
            <ErrorBanner message={error} onRetry={reload} />
          ) : loading || !data ? (
            <KpiSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Contas pendentes (KYC)"
                value={String(data.pendingAccounts)}
                hint={`${data.activeAccounts} contas ativas`}
                icon={Users}
              />
              <KpiCard
                label="Propostas em análise"
                value={String(data.proposalsUnderReview)}
                hint="consignado aguardando decisão"
                icon={Banknote}
              />
              <KpiCard
                label="Volume financeiro aprovado"
                value={brlFromCents(data.approvedVolumeCents)}
                hint="desde o início da operação"
                icon={Wallet}
                trend="up"
              />
            </div>
          )}

          <AccountsQueue onNotify={notify} />
          <LoansDesk onNotify={notify} />

          <p className="flex items-center gap-1.5 pb-2 text-[12px] text-muted">
            <ShieldCheck size={13} strokeWidth={1.75} aria-hidden />
            Toda decisão é registrada com analista, horário e motivo.
          </p>
        </div>
      </main>

      {toast ? <Toast message={toast} onClose={closeToast} /> : null}
    </div>
  );
}
