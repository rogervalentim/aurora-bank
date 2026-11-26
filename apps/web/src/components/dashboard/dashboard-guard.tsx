'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { KpiSkeleton } from '@/components/ui/skeleton';
import { getSession } from '@/services/auth';

/** Garante sessão de analista antes de renderizar o dashboard. */
export function DashboardGuard() {
  const router = useRouter();
  const [analystName, setAnalystName] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setAnalystName(session.displayName);
  }, [router]);

  if (!analystName) {
    return (
      <div className="p-10">
        <KpiSkeleton />
      </div>
    );
  }

  return <DashboardShell analystName={analystName} />;
}
