import { z } from 'zod';
import { isValidCpf } from '../utils/cpf';

/** Remove separadores de telefone, mantendo dígitos e o `+` inicial. */
export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s().-]/g, '');
}

/** Valida um telefone brasileiro (DDD + 8 ou 9 dígitos, com `+55` opcional). */
export function isValidBrazilianPhone(value: string): boolean {
  const normalized = normalizePhone(value).replace(/^\+/, '');
  return /^(?:55)?(?:0)?[1-9]{2}(?:9\d{8}|[2-5]\d{7}|9?\d{8})$/.test(normalized) && !/^0/.test(normalized);
}

/** Normaliza um telefone brasileiro para o formato E.164 (`+55DDNNNNNNNNN`). */
export function toE164BrazilianPhone(value: string): string {
  const digits = normalizePhone(value).replace(/\D/g, '').replace(/^0+/, '');
  const national = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  if (!/^[1-9]{2}9?\d{8}$/.test(national)) {
    throw new RangeError(`Telefone brasileiro inválido: ${value}.`);
  }
  return `+55${national}`;
}

/** Valida um e-mail. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
}

/** Valida uma chave aleatória UUID v4. */
export function isValidUuidV4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

/** Tipos de chave Pix aceitos. */
export const pixKeyTypeSchema = z.enum(['CPF', 'EMAIL', 'PHONE', 'RANDOM']);

/** Tipo de chave Pix (inferido do schema). */
export type PixKeyTypeInput = z.infer<typeof pixKeyTypeSchema>;

/** Validadores por tipo de chave Pix. */
export const pixKeyValidators: Readonly<Record<PixKeyTypeInput, (value: string) => boolean>> = {
  CPF: isValidCpf,
  EMAIL: isValidEmail,
  PHONE: isValidBrazilianPhone,
  RANDOM: isValidUuidV4,
};

/**
 * Normaliza o valor da chave Pix conforme o tipo:
 * - `CPF`: somente dígitos.
 * - `EMAIL`: minúsculas, sem espaços.
 * - `PHONE`: E.164 (`+55DDNNNNNNNNN`).
 * - `RANDOM`: UUID v4 em minúsculas.
 */
export function normalizePixKey(type: PixKeyTypeInput, value: string): string {
  switch (type) {
    case 'CPF':
      return value.replace(/\D/g, '');
    case 'EMAIL':
      return value.trim().toLowerCase();
    case 'PHONE':
      return toE164BrazilianPhone(value);
    case 'RANDOM':
      return value.trim().toLowerCase();
  }
}

/** Valida o formato de uma chave Pix de acordo com o tipo informado. */
export function validatePixKey(type: PixKeyTypeInput, value: string): boolean {
  return pixKeyValidators[type](value);
}

/** Schema discriminado de chave Pix (tipo + valor validado). */
export const pixKeySchema = z
  .discriminatedUnion('type', [
    z.object({ type: z.literal('CPF'), value: z.string().trim().min(1, 'Informe a chave Pix.') }),
    z.object({ type: z.literal('EMAIL'), value: z.string().trim().min(1, 'Informe a chave Pix.') }),
    z.object({ type: z.literal('PHONE'), value: z.string().trim().min(1, 'Informe a chave Pix.') }),
    z.object({ type: z.literal('RANDOM'), value: z.string().trim().min(1, 'Informe a chave Pix.') }),
  ])
  .superRefine((data, ctx) => {
    if (!validatePixKey(data.type, data.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: `Chave Pix inválida para o tipo ${data.type}.`,
      });
    }
  });

export type PixKeyInput = z.infer<typeof pixKeySchema>;
