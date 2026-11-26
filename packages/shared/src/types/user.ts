import type { EmploymentType } from './enums';

/** Usuário autenticado (cliente do app ou analista do backoffice). */
export interface User {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  /** Somente dígitos, 11 caracteres. */
  readonly cpf: string;
  readonly role: 'customer' | 'analyst' | 'admin';
  readonly createdAt: string;
}

/** Dados declarados no onboarding financeiro. */
export interface EmploymentInfo {
  readonly monthlyIncome: number;
  readonly employmentType: EmploymentType;
}
