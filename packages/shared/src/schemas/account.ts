import { z } from 'zod';
import { cpfSchema } from './cpf';
import { employmentTypeSchema, monthlyIncomeSchema } from './consignado';
import { isValidEmail } from './pix-key';

/** Senha de acesso: mínimo 8 caracteres, com letra e número. */
export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .regex(/[A-Za-z]/, 'A senha deve conter ao menos uma letra.')
  .regex(/\d/, 'A senha deve conter ao menos um número.');

/** Etapa 1 do onboarding: dados pessoais. */
export const personalDataSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(5, 'Informe o nome completo.')
    .refine((value) => value.split(/\s+/).length >= 2, 'Informe nome e sobrenome.'),
  cpf: cpfSchema,
  email: z.string().trim().refine((value) => isValidEmail(value), 'E-mail inválido.'),
  password: passwordSchema,
});

/** Etapa 2 do onboarding: dados financeiros. */
export const financialDataSchema = z.object({
  monthlyIncome: monthlyIncomeSchema,
  employmentType: employmentTypeSchema,
});

/** Payload completo de abertura de conta (`POST /api/accounts`). */
export const createAccountSchema = personalDataSchema.merge(financialDataSchema);

export type PersonalDataInput = z.infer<typeof personalDataSchema>;
export type FinancialDataInput = z.infer<typeof financialDataSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
