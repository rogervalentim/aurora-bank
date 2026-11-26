import { createProposal, type AccountRecord, type DbState } from './domain';

const SANDBOX_BONUS_CENTS = Number(process.env['SANDBOX_BONUS_CENTS'] ?? '50000');
const ISO = (minutesAgo: number): string => new Date(Date.now() - minutesAgo * 60_000).toISOString();

function seed(): DbState {
  const records: AccountRecord[] = [
    {
      account: {
        id: 'acc_ana',
        userId: 'usr_ana',
        fullName: 'Ana Beatriz Ferreira',
        cpf: '52998224725',
        email: 'ana.ferreira@email.com',
        balanceCents: 250_000,
        monthlyIncomeCents: 780_000,
        employmentType: 'PUBLIC_SERVANT',
        status: 'ACTIVE',
        createdAt: ISO(60 * 26),
        reviewedAt: ISO(60 * 25),
        reviewedBy: 'analista@aurorabank.com',
        rejectionReason: null,
      },
      transactions: [
        {
          id: 'txn_ana_1',
          accountId: 'acc_ana',
          direction: 'CREDIT',
          type: 'BONUS',
          amountCents: 50_000,
          description: 'Bônus de boas-vindas',
          createdAt: ISO(60 * 25),
        },
      ],
    },
    {
      account: {
        id: 'acc_carlos',
        userId: 'usr_carlos',
        fullName: 'Carlos Eduardo Lima',
        cpf: '11144477735',
        email: 'carlos.lima@email.com',
        balanceCents: 0,
        monthlyIncomeCents: 420_000,
        employmentType: 'CLT',
        status: 'PENDING_KYC',
        createdAt: ISO(95),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
      transactions: [],
    },
    {
      account: {
        id: 'acc_maria',
        userId: 'usr_maria',
        fullName: 'Maria Aparecida Souza',
        cpf: '98765432100',
        email: 'maria.souza@email.com',
        balanceCents: 0,
        monthlyIncomeCents: 210_000,
        employmentType: 'INSS',
        status: 'PENDING_KYC',
        createdAt: ISO(48),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
      transactions: [],
    },
  ];

  const carlos = records[1];
  const maria = records[2];
  if (!carlos || !maria) throw new Error('Seed de contas inválido.');

  const proposals: DbState['proposals'] = [
    createProposal({
      id: 'prop_ana',
      account: records[0]!.account,
      amountCents: 1_200_000,
      installments: 24,
      monthlyRate: 0.0165,
      now: ISO(180),
    }),
    createProposal({
      id: 'prop_carlos',
      account: carlos.account,
      amountCents: 3_500_000,
      installments: 48,
      monthlyRate: 0.0165,
      now: ISO(120),
    }),
    createProposal({
      id: 'prop_maria',
      account: maria.account,
      amountCents: 800_000,
      installments: 12,
      monthlyRate: 0.0165,
      now: ISO(30),
    }),
  ];

  proposals[0] = { ...proposals[0]!, status: 'APPROVED', reviewedAt: ISO(150), reviewedBy: 'analista@aurorabank.com' };

  return { accounts: records, proposals };
}

declare global {
  var __auroraDb: DbState | undefined;
}

/** Estado do banco sandbox (singleton por processo, sem persistência). */
export function getDb(): DbState {
  globalThis.__auroraDb ??= seed();
  return globalThis.__auroraDb;
}

/** Reinicia o banco sandbox (usado em testes). */
export function resetDb(): void {
  globalThis.__auroraDb = seed();
}

/** Bônus sandbox configurável usado na abertura de conta. */
export function sandboxBonusCents(): number {
  return Number.isFinite(SANDBOX_BONUS_CENTS) ? SANDBOX_BONUS_CENTS : 0;
}
