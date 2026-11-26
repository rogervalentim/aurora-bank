import * as shared from '../index';

describe('API pública do @aurora/shared', () => {
  it('reexporta regras financeiras, schemas e utilitários', () => {
    expect(shared.calculateConsignado(10_000, 24, 0.0165, 5_000).installmentAmount).toBe(507.98);
    expect(shared.formatCurrencyBRL(1234.5)).toBe(`R$\u00a01.234,50`);
    expect(shared.isValidCpf('52998224725')).toBe(true);
    expect(shared.validatePixKey('EMAIL', 'a@b.com')).toBe(true);
    expect(shared.cpfSchema.safeParse('52998224725').success).toBe(true);
    expect(shared.BUSINESS_RULES.CONSIGNADO_MARGIN_RATE).toBe(0.35);
  });

  it('exponibiliza os enums de tipos como valores de schema', () => {
    expect(shared.pixKeyTypeSchema.options).toEqual(['CPF', 'EMAIL', 'PHONE', 'RANDOM']);
    expect(shared.employmentTypeSchema.options).toEqual(['INSS', 'PUBLIC_SERVANT', 'CLT']);
  });
});
