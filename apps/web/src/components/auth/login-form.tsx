'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Landmark, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEMO_ANALYST, signInAnalyst } from '@/services/auth';

/** Login institucional split-screen do analista (SPEC §6.3). */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInAnalyst(email, password);
      router.push('/dashboard');
    } catch {
      setError('Credenciais inválidas. Verifique o e-mail e a senha de analista.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(): void {
    setEmail(DEMO_ANALYST.email);
    setPassword(DEMO_ANALYST.password);
    setError(null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Acesso do analista">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[12px] font-medium text-ink-soft">
          E-mail corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@aurorabank.com"
          className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[14px] text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[12px] font-medium text-ink-soft">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 pr-10 text-[14px] text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-[10px] border border-danger/25 bg-danger/5 px-3 py-2 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}

      <Button type="submit" tone="accent" loading={loading} className="w-full py-2.5 text-[14px]">
        Entrar no backoffice
        <ArrowRight size={15} strokeWidth={2} aria-hidden />
      </Button>

      <button
        type="button"
        onClick={fillDemo}
        className="w-full rounded-[10px] border border-dashed border-line px-3 py-2 text-[12px] text-muted hover:border-slate-300 hover:text-ink-soft"
      >
        Usar credenciais do sandbox
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted">
        <ShieldCheck size={13} strokeWidth={1.75} aria-hidden />
        Acesso restrito à equipe de risco e operações
      </p>
    </form>
  );
}

/** Coluna esquerda institucional do login. */
export function LoginBrandPanel() {
  return (
    <aside className="relative flex flex-col justify-between overflow-hidden bg-ink px-10 py-12 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative space-y-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-white/10">
            <Landmark size={18} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold tracking-tight">Aurora Bank</p>
            <p className="text-[11px] text-white/50">Backoffice operacional</p>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-[30px] font-semibold leading-[1.15] tracking-tight">
            Aprove contas e crédito consignado com a margem de 35% sempre à vista.
          </h1>
          <p className="max-w-sm text-[14px] leading-6 text-white/60">
            Auditoria de KYC e mesa de crédito no mesmo lugar. Cada decisão registra analista, horário e motivo.
          </p>
        </div>
      </div>

      <dl className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
        {[
          { label: 'Fila KYC', value: '2' },
          { label: 'Em análise', value: '2' },
          { label: 'Margem legal', value: '35%' },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] text-white/45">{item.label}</dt>
            <dd className="numeric mt-1 text-[18px] font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
