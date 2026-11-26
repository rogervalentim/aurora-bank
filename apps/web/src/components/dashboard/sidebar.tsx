'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Landmark, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { signOutAnalyst } from '@/services/auth';

const NAV = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/dashboard#contas', label: 'Aprovação de contas', icon: ShieldCheck },
] as const;

/** Sidebar fixa do dashboard (SPEC §6.3). */
export function Sidebar({ analystName }: { readonly analystName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onSignOut(): Promise<void> {
    await signOutAnalyst();
    router.push('/login');
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col justify-between bg-ink px-4 py-6 text-white">
      <div className="space-y-8">
        <div className="flex items-center gap-2.5 px-2">
          <span className="grid size-8 place-items-center rounded-[9px] bg-white/10">
            <Landmark size={16} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="font-display text-[14px] font-semibold tracking-tight">Aurora Bank</p>
            <p className="text-[11px] text-white/45">Backoffice</p>
          </div>
        </div>

        <nav aria-label="Navegação principal" className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href.split('#')[0];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] transition-colors',
                  active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}
              >
                <item.icon size={15} strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="px-2">
          <p className="text-[13px] font-medium text-white">{analystName}</p>
          <p className="text-[11px] text-white/45">Perfil analyst</p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-[13px] text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={15} strokeWidth={1.75} aria-hidden />
          Sair
        </button>
      </div>
    </aside>
  );
}
