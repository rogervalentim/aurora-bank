import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountsQueue } from '@/components/dashboard/accounts-queue';
import { approveAccount, listAccounts, rejectAccount } from '@/services/backoffice';
import type { AccountDTO, PageDTO } from '@/lib/types';

jest.mock('@/services/backoffice', () => ({
  listAccounts: jest.fn(),
  approveAccount: jest.fn(),
  rejectAccount: jest.fn(),
  listProposals: jest.fn(),
  approveProposal: jest.fn(),
  rejectProposal: jest.fn(),
  getMetrics: jest.fn(),
}));

const account = (overrides: Partial<AccountDTO> = {}): AccountDTO => ({
  id: 'acc_1',
  userId: 'usr_1',
  fullName: 'Carlos Eduardo Lima',
  cpf: '11144477735',
  email: 'carlos@email.com',
  balanceCents: 0,
  monthlyIncomeCents: 420_000,
  employmentType: 'CLT',
  status: 'PENDING_KYC',
  createdAt: '2025-02-05T17:32:00.000Z',
  reviewedAt: null,
  reviewedBy: null,
  rejectionReason: null,
  ...overrides,
});

const page = (items: readonly AccountDTO[]): PageDTO<AccountDTO> => ({ items, total: items.length });

const listAccountsMock = listAccounts as jest.MockedFunction<typeof listAccounts>;
const approveMock = approveAccount as jest.MockedFunction<typeof approveAccount>;
const rejectMock = rejectAccount as jest.MockedFunction<typeof rejectAccount>;

describe('AccountsQueue', () => {
  it('mostra skeleton e depois a fila de contas pendentes', async () => {
    listAccountsMock.mockResolvedValue(page([account()]));
    render(<AccountsQueue onNotify={jest.fn()} />);

    expect(screen.getByLabelText('Carregando registros')).toBeInTheDocument();
    expect(await screen.findByText('Carlos Eduardo Lima')).toBeInTheDocument();
    expect(screen.getByText('111.444.777-35')).toBeInTheDocument();
    expect(screen.getByText('R$ 4.200,00')).toBeInTheDocument();
    expect(listAccountsMock).toHaveBeenCalledWith('PENDING_KYC');
  });

  it('mostra empty state quando a fila está vazia', async () => {
    listAccountsMock.mockResolvedValue(page([]));
    render(<AccountsQueue onNotify={jest.fn()} />);
    expect(await screen.findByText('Nenhuma conta nesta fila')).toBeInTheDocument();
  });

  it('mostra banner de erro com retry', async () => {
    listAccountsMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(page([account()]));
    render(<AccountsQueue onNotify={jest.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Carlos Eduardo Lima')).toBeInTheDocument();
  });

  it('filtra por busca e por status', async () => {
    listAccountsMock.mockResolvedValue(page([account(), account({ id: 'acc_2', fullName: 'Ana Souza', cpf: '52998224725' })]));
    render(<AccountsQueue onNotify={jest.fn()} />);
    await screen.findByText('Carlos Eduardo Lima');

    const search = screen.getByLabelText('Buscar contas');
    fireEvent.change(search, { target: { value: 'ana' } });
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ativas' }));
    await waitFor(() => expect(listAccountsMock).toHaveBeenLastCalledWith('ACTIVE'));

    await userEvent.click(screen.getByRole('button', { name: 'Todas' }));
    await waitFor(() => expect(listAccountsMock).toHaveBeenLastCalledWith(undefined));
  });

  it('aprova a conta pelo modal de auditoria', async () => {
    listAccountsMock.mockResolvedValue(page([account()]));
    approveMock.mockResolvedValue(account({ status: 'ACTIVE' }));
    const onNotify = jest.fn();
    render(<AccountsQueue onNotify={onNotify} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Auditar' }));
    const dialog = screen.getByRole('dialog', { name: /Auditoria de Carlos Eduardo Lima/ });
    expect(within(dialog).getByText('carlos@email.com')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Aprovar conta' }));
    await waitFor(() => expect(approveMock).toHaveBeenCalledWith('acc_1'));
    await waitFor(() => expect(onNotify).toHaveBeenCalledWith('Conta de Carlos Eduardo Lima aprovada.'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exige motivo antes de reprovar e envia a recusa', async () => {
    listAccountsMock.mockResolvedValue(page([account()]));
    rejectMock.mockResolvedValue(account({ status: 'BLOCKED', rejectionReason: 'CPF divergente' }));
    const onNotify = jest.fn();
    render(<AccountsQueue onNotify={onNotify} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Auditar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reprovar' }));
    expect(onNotify).toHaveBeenCalledWith('Descreva o motivo da recusa (mínimo 5 caracteres).');
    expect(rejectMock).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/Motivo da recusa/), 'CPF divergente');
    await userEvent.click(screen.getByRole('button', { name: 'Reprovar' }));
    await waitFor(() => expect(rejectMock).toHaveBeenCalledWith('acc_1', 'CPF divergente'));
  });

  it('avisa quando a aprovação falha', async () => {
    listAccountsMock.mockResolvedValue(page([account()]));
    approveMock.mockRejectedValue(new Error('falhou'));
    const onNotify = jest.fn();
    render(<AccountsQueue onNotify={onNotify} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Auditar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aprovar conta' }));
    await waitFor(() => expect(onNotify).toHaveBeenCalledWith('Não foi possível aprovar a conta. Tente novamente.'));
  });
});
