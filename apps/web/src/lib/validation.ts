import { z } from 'zod';
import { createAccountSchema, pixKeySchema } from '@aurora/shared';

/** Corpo de `POST /api/accounts` (CPF com máscara aceito). */
export const createAccountBodySchema = createAccountSchema.extend({
  initialBalanceCents: z.number().int().nonnegative().optional(),
});

/** Corpo de `PATCH /api/accounts/:id/reject` e `PATCH /api/loans/:id/reject`. */
export const rejectionBodySchema = z.object({
  reason: z.string().trim().min(5, 'Descreva o motivo da recusa (mínimo 5 caracteres).').max(280),
});

/** Query de `GET /api/accounts`. */
export const accountQuerySchema = z.object({
  status: z.enum(['PENDING_KYC', 'ACTIVE', 'BLOCKED']).optional(),
});

/** Query de `GET /api/loans/consignado`. */
export const loanQuerySchema = z.object({
  status: z.enum(['SIMULATED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']).optional(),
});

/** Corpo de `POST /api/pix/keys`. */
export const createPixKeyBodySchema = z.object({
  accountId: z.string().trim().min(1, 'Informe a conta.'),
  key: pixKeySchema,
});

/** Corpo de `POST /api/pix/transfers`. */
export const transferBodySchema = z.object({
  senderAccountId: z.string().trim().min(1, 'Informe a conta de origem.'),
  receiverKey: z.string().trim().min(1, 'Informe a chave de destino.'),
  amountCents: z.number().int('Informe o valor em centavos.').min(1, 'O valor deve ser maior que zero.'),
  description: z.string().trim().max(140).optional(),
});

/** Corpo de `POST /api/loans/consignado`. */
export const createLoanBodySchema = z.object({
  accountId: z.string().trim().min(1, 'Informe a conta.'),
  amountCents: z.number().int().min(100_000, 'O valor mínimo é R$ 1.000,00.').max(5_000_000, 'O valor máximo é R$ 50.000,00.'),
  installments: z
    .number()
    .int()
    .refine((value) => [12, 24, 36, 48, 60, 84].includes(value), 'Prazo inválido.'),
  monthlyRate: z.number().nonnegative().default(0.0165),
});

export type CreateAccountBody = z.infer<typeof createAccountBodySchema>;
export type RejectionBody = z.infer<typeof rejectionBodySchema>;
export type TransferBody = z.infer<typeof transferBodySchema>;
export type CreateLoanBody = z.infer<typeof createLoanBodySchema>;
