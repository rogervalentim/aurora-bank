import { z } from 'zod';
import { isValidCpf } from '../utils/cpf';

/** Schema de CPF: aceita com ou sem máscara, valida dígitos verificadores. */
export const cpfSchema = z
  .string()
  .trim()
  .min(11, 'CPF deve ter 11 dígitos.')
  .max(14, 'CPF deve ter no máximo 14 caracteres.')
  .refine((value) => isValidCpf(value), 'CPF inválido.');

export type CpfInput = z.infer<typeof cpfSchema>;
