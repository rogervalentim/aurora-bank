import type { AccountStatus, EmploymentType } from '@aurora/shared';

/** Cor e rótulo de um status de conta, usados nos chips e na Home. */
export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  PENDING_KYC: 'Em análise',
  ACTIVE: 'Conta ativa',
  BLOCKED: 'Conta bloqueada',
};

/** Texto do passo do onboarding por status. */
export const ACCOUNT_STATUS_DESCRIPTION: Record<AccountStatus, string> = {
  PENDING_KYC: 'Nossa equipe de risco está conferindo seus dados. Você será avisado aqui mesmo.',
  ACTIVE: 'Tudo liberado: Pix, extrato e crédito consignado.',
  BLOCKED: 'Sua conta está bloqueada. Fale com o atendimento para regularizar.',
};

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  INSS: 'Aposentado/pensionista INSS',
  PUBLIC_SERVANT: 'Servidor público',
  CLT: 'CLT',
};

/** Prazos oferecidos no simulador de consignado. */
export const INSTALLMENT_OPTIONS = [12, 24, 36, 48, 60, 84] as const;

/** Teto legal da margem consignável (35%). */
export const MARGIN_RATE = 0.35;
