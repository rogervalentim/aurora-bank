import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoansDesk } from '@/components/dashboard/loans-desk';
import { approveProposal, listProposals, rejectProposal } from '@/services/backoffice';
import type { PageDTO, ProposalDTO } from '@/lib/types';

jest.mock('@/services/backoffice', () => ({
  listAccounts: jest.fn(),
  approveAccount: jest.fn(),
  rejectAccount: jest.fn(),
  listProposals: jest.fn(),
  approveProposal: jest.fn(),
  rejectProposal: jest.fn(),
  getMetrics: jest.fn(),
}));

const proposal = (overrides: Partial<ProposalDTO> = {}): ProposalDTO => ({
  id: 'prop_1',
  accountId: 'acc_1',
  customerName: 'Carlos Eduardo Lima',
  cpf: '11144477735',
  employmentType: 'CLT',
  monthlyIncomeCents: 420_000,
  amountCents: 3_500_000,
  installments: 48,
  monthlyRate: 0.0165,
  installmentAmountCents: 106_134,
  totalAmountCents: 5_094_432,
  annualCetPercent: 21.7,
  committedIncomePercent: 25.27,
  marginLimitCents: 147_000,
  isWithinMargin: true,
  status: 'UNDER_REVIEW',
  createdAt: '2025-02-05T17:40:00.000Z',
  reviewedAt: null,
  reviewedBy: null,
  rejectionReason: null,
  ...overrides,
});

const page = (items: readonly ProposalDTO[]): PageDTO<ProposalDTO> => ({ items, total: items.length });

const listMock = listProposals as jest.MockedFunction<typeof listProposals>;
const approveMock = approveProposal as jest.MockedFunction<typeof approveProposal>;
const rejectMock = rejectProposal as jest.MockedFunction<typeof rejectProposal>;

describe('LoansDesk', () => {
  it('lista propostas em análise com parcela, CET e margem', async () => {
    listMock.mockResolvedValue(page([proposal()]));
    render(<LoansDesk onNotify={jest.fn()} />);

    expect(await screen.findByText('Carlos Eduardo Lima')).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledWith('UNDER_REVIEW');
    expect(screen.getByText('R$ 1.061,34')).toBeInTheDocument();
    expect(screen.getByText('Dentro da margem')).toBeInTheDocument();
    expect(screen.getByText(/CET 21,7%/)).toBeInTheDocument();
  });

  it('bloqueia a aprovação quando a parcela excede 35% da renda', async () => {
    listMock.mockResolvedValue(page([proposal({ isWithinMargin: false, committedIncomePercent: 50.8 })]));
    render(<LoansDesk onNotify={jest.fn()} />);

    const button = await screen.findByRole('button', { name: 'Aprovar crédito' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Acima da margem')).toBeInTheDocument();
  });

  it('dispara PATCH /api/loans/:id/approve ao aprovar o crédito', async () => {
    listMock.mockResolvedValue(page([proposal()]));
    approveMock.mockResolvedValue(proposal({ status: 'APPROVED' }));
    const onNotify = jest.fn();
    render(<LoansDesk onNotify={onNotify} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aprovar crédito' }));
    await waitFor(() => expect(approveMock).toHaveBeenCalledWith('prop_1'));
    await waitFor(() =>
      expect(onNotify).toHaveBeenCalledWith('Crédito de Carlos Eduardo Lima aprovado e creditado na conta.'),
    );
  });

  it('revisa e recusa com motivo', async () => {
    listMock.mockResolvedValue(page([proposal()]));
    rejectMock.mockResolvedValue(proposal({ status: 'REJECTED', rejectionReason: 'Renda não comprovada' }));
    const onNotify = jest.fn();
    render(<LoansDesk onNotify={onNotify} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Revisar' }));
    expect(screen.getByText('R$ 35.000,00')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    expect(onNotify).toHaveBeenCalledWith('Descreva o motivo da recusa (mínimo 5 caracteres).');

    await userEvent.type(screen.getByLabelText(/Motivo da recusa/), 'Renda não comprovada');
    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    await waitFor(() => expect(rejectMock).toHaveBeenCalledWith('prop_1', 'Renda não comprovada'));
  });

  it('mostra empty state quando a mesa está livre', async () => {
    listMock.mockResolvedValue(page([]));
    render(<LoansDesk onNotify={jest.fn()} />);
    expect(await screen.findByText('Mesa livre')).toBeInTheDocument();
  });
});
