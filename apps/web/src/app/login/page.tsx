import { LoginBrandPanel, LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'Entrar · Aurora Backoffice' };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-1.5">
            <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">Acesso do analista</h2>
            <p className="text-[14px] leading-6 text-muted">
              Entre com sua conta corporativa para acessar as filas de aprovação.
            </p>
          </header>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
