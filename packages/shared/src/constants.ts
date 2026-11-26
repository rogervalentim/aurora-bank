/** Constantes de negócio do Aurora Bank. */
export const BUSINESS_RULES = {
  /** Limite legal de comprometimento da renda no consignado. */
  CONSIGNADO_MARGIN_RATE: 0.35,
  /** Valor mínimo de simulação de consignado (R$). */
  CONSIGNADO_MIN_AMOUNT: 1_000,
  /** Valor máximo de simulação de consignado (R$). */
  CONSIGNADO_MAX_AMOUNT: 50_000,
  /** Taxa mensal padrão do consignado (1,65% a.m.). */
  CONSIGNADO_MONTHLY_RATE: 0.0165,
  /** Prazos permitidos (em meses). */
  CONSIGNADO_INSTALLMENTS: [12, 24, 36, 48, 60, 84] as const,
  /** Teto mensal de transferência Pix (R$). */
  PIX_MAX_AMOUNT: 20_000,
  /** Moeda de todos os valores monetários. */
  CURRENCY: 'BRL',
  /** Locale de formatação. */
  LOCALE: 'pt-BR',
} as const;
