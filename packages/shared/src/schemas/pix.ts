import { z } from 'zod';
import { BUSINESS_RULES } from '../constants';
import { pixKeySchema } from './pix-key';

/** Valor de uma transferência Pix (mínimo R$ 0,01, máximo R$ 20.000). */
export const pixAmountSchema = z
  .number({ invalid_type_error: 'Informe o valor da transferência.' })
  .refine((value) => Number.isFinite(value), 'Valor inválido.')
  .refine((value) => value >= 0.01, 'O valor mínimo é R$ 0,01.')
  .refine(
    (value) => value <= BUSINESS_RULES.PIX_MAX_AMOUNT,
    'O valor excede o limite de R$ 20.000,00 por transferência.',
  );

/** Payload de transferência Pix. */
export const pixTransferSchema = z.object({
  key: pixKeySchema,
  amount: pixAmountSchema,
  description: z.string().trim().max(140, 'A descrição deve ter no máximo 140 caracteres.').optional(),
});

export type PixTransferInput = z.infer<typeof pixTransferSchema>;

/** Regra de tela: o valor não pode exceder o saldo disponível. */
export function isPixAmountWithinBalance(amount: number, balance: number): boolean {
  return amount > 0 && amount <= balance + 0.005;
}
