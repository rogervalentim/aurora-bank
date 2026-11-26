import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { signInAnalyst } from '@/services/auth';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/services/auth', () => ({
  DEMO_ANALYST: { email: 'analista@aurorabank.com', password: 'aurora2025' },
  signInAnalyst: jest.fn(),
}));

const signInMock = signInAnalyst as jest.MockedFunction<typeof signInAnalyst>;

describe('LoginForm', () => {
  it('autentica o analista e navega para o dashboard', async () => {
    signInMock.mockResolvedValue({ uid: 'a', email: 'a@b.com', displayName: 'A', role: 'analyst' });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('E-mail corporativo'), 'analista@aurorabank.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'aurora2025');
    await userEvent.click(screen.getByRole('button', { name: /Entrar no backoffice/ }));

    expect(signInMock).toHaveBeenCalledWith('analista@aurorabank.com', 'aurora2025');
    expect(push).toHaveBeenCalledWith('/dashboard');
  });

  it('mostra erro para credenciais inválidas', async () => {
    signInMock.mockRejectedValue(new Error('Credenciais inválidas.'));
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('E-mail corporativo'), 'errado@aurora.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-errada');
    await userEvent.click(screen.getByRole('button', { name: /Entrar no backoffice/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas.');
    expect(push).not.toHaveBeenCalled();
  });

  it('preenche as credenciais do sandbox e alterna a visibilidade da senha', async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Usar credenciais do sandbox' }));
    expect(screen.getByLabelText('E-mail corporativo')).toHaveValue('analista@aurorabank.com');
    expect(screen.getByLabelText('Senha')).toHaveValue('aurora2025');

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });
});
