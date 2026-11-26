import { z } from 'zod';
import { BUSINESS_RULES } from '../constants';

/** Renda mensal declarada em reais. */
export const monthlyIncomeSchema = z
  .number({ invalid_type_error: 'Informe a renda mensal.' })
  .finite('Renda mensal inválida.')
  .positive('A renda mensal deve ser maior que zero.');

/** Vínculo empregatício. */
export const employmentTypeSchema = z.enum(['INSS', 'PUBLIC_SERVANT', 'CLT']);

/** Schema de margem consignável: renda + parcela informada. */
export const consignableMarginSchema = z.object({
  monthlyIncome: monthlyIncomeSchema,
  installmentAmount: z
    .number({ invalid_type_error: 'Informe o valor da parcela.' })
    .finite('Valor da parcela inválido.')
    .nonnegative('O valor da parcela não pode ser negativo.'),
});

export type ConsignableMarginInput = z.infer<typeof consignableMarginSchema>;

/** Teto da margem consignável (35% da renda). */
export function consignableMarginLimit(monthlyIncome: number): number {
  return Math.round(monthlyIncome * BUSINESS_RULES.CONSIGNADO_MARGIN_RATE * 100) / 100;
}

/** Indica se a parcela cabe na margem consignável de 35%. */
export function fitsConsignableMargin(monthlyIncome: number, installmentAmount: number): boolean {
  return installmentAmount <= consignableMarginLimit(monthlyIncome) + 0.005;
}

/** Schema completo da simulação/contratação de consignado. */
export const consignadoSimulationSchema = z
  .object({
    amount: z
      .number({ invalid_type_error: 'Informe o valor do empréstimo.' })
      .finite('Valor do empréstimo inválido.')
      .min(BUSINESS_RULES.CONSIGNADO_MIN_AMOUNT, `O valor mínimo é R$ ${BUSINESS_RULES.CONSIGNADO_MIN_AMOUNT.toLocaleString('pt-BR')}.`)
      .max(BUSINESS_RULES.CONSIGNADO_MAX_AMOUNT, `O valor máximo é R$ ${BUSINESS_RULES.CONSIGNADO_MAX_AMOUNT.toLocaleString('pt-BR')}.`),
    installments: z
      .number({ invalid_type_error: 'Selecione o prazo.' })
      .int('O prazo deve ser em meses inteiros.')
      .refine(
        (value) => (BUSINESS_RULES.CONSIGNADO_INSTALLMENTS as readonly number[]).includes(value),
        `Prazo deve ser um de: ${BUSINESS_RULES.CONSIGNADO_INSTALLMENTS.join(', ')} meses.`,
      ),
    monthlyRate: z.number().finite('Taxa inválida.').nonnegative('A taxa não pode ser negativa.'),
    monthlyIncome: monthlyIncomeSchema,
    employmentType: employmentTypeSchema,
  })
  .superRefine((data, ctx) => {
    const installmentAmount =
      data.monthlyRate === 0
        ? data.amount / data.installments
        : (() => {
            const factor = (1 + data.monthlyRate) ** data.installments;
            return (data.amount * (data.monthlyRate * factor)) / (factor - 1);
          })();

    if (!fitsConsignableMargin(data.monthlyIncome, installmentAmount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amount'],
        message: 'A parcela excede a margem consignável de 35% da renda mensal.',
      });
    }
  });

export type ConsignadoSimulationInput = z.infer<typeof consignadoSimulationSchema>;
