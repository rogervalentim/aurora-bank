import { cn } from '@/lib/cn';

/** Bloco de carregamento com pulso suave. */
export function Skeleton({ className }: { readonly className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/70', className)} aria-hidden />;
}

/** Skeleton de tabela: `rows` linhas com `columns` células. */
export function TableSkeleton({ rows = 4, columns = 4 }: { readonly rows?: number; readonly columns?: number }) {
  return (
    <div className="divide-y divide-line" aria-busy aria-label="Carregando registros">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 px-5 py-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton de cards de KPI. */
export function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[14px] border border-line bg-card p-5 shadow-card">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-32" />
        </div>
      ))}
    </div>
  );
}
