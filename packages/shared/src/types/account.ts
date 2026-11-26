import type { AccountStatus } from './enums';

/** Conta digital do cliente. Valores monetários sempre em reais (BRL). */
export interface Account {
  readonly id: string;
  readonly userId: string;
  readonly fullName: string;
  /** Somente dígitos, 11 caracteres. */
  readonly cpf: string;
  readonly email: string;
  /** Saldo disponível em reais. */
  readonly balance: number;
  readonly status: AccountStatus;
  /** Renda mensal declarada em reais. */
  readonly monthlyIncome: number;
  readonly employmentType: 'INSS' | 'PUBLIC_SERVANT' | 'CLT';
  /** ISO 8601 (UTC). */
  readonly createdAt: string;
  /** ISO 8601 (UTC), quando aprovada/reprovada. */
  readonly reviewedAt?: string;
  /** Identificador do analista que revisou. */
  readonly reviewedBy?: string;
  /** Motivo da reprovação/bloqueio. */
  readonly rejectionReason?: string;
}
