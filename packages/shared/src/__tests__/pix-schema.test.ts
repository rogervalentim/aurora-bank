import { isPixAmountWithinBalance, pixAmountSchema, pixTransferSchema } from '../schemas/pix';

describe('pixAmountSchema', () => {
  it('aceita valores válidos', () => {
    expect(pixAmountSchema.safeParse(0.01).success).toBe(true);
    expect(pixAmountSchema.safeParse(1_234.56).success).toBe(true);
    expect(pixAmountSchema.safeParse(20_000).success).toBe(true);
  });

  it('rejeita valores fora dos limites', () => {
    expect(pixAmountSchema.safeParse(0).error?.issues[0]?.message).toBe('O valor mínimo é R$ 0,01.');
    expect(pixAmountSchema.safeParse(20_000.01).error?.issues[0]?.message).toBe(
      'O valor excede o limite de R$ 20.000,00 por transferência.',
    );
    expect(pixAmountSchema.safeParse(Number.POSITIVE_INFINITY).error?.issues[0]?.message).toBe('Valor inválido.');
    expect(pixAmountSchema.safeParse('100').error?.issues[0]?.message).toBe('Informe o valor da transferência.');
  });
});

describe('pixTransferSchema', () => {
  it('aceita transferência válida', () => {
    const result = pixTransferSchema.safeParse({
      key: { type: 'PHONE', value: '+55 11 99999-8888' },
      amount: 150,
      description: 'Aluguel',
    });
    expect(result.success).toBe(true);
  });

  it('aceita transferência sem descrição', () => {
    expect(
      pixTransferSchema.safeParse({ key: { type: 'EMAIL', value: 'a@b.com' }, amount: 10 }).success,
    ).toBe(true);
  });

  it('rejeita descrição longa e chave inválida', () => {
    expect(
      pixTransferSchema.safeParse({
        key: { type: 'EMAIL', value: 'a@b.com' },
        amount: 10,
        description: 'x'.repeat(141),
      }).error?.issues[0]?.message,
    ).toBe('A descrição deve ter no máximo 140 caracteres.');

    expect(
      pixTransferSchema.safeParse({ key: { type: 'CPF', value: '11111111111' }, amount: 10 }).success,
    ).toBe(false);
  });
});

describe('isPixAmountWithinBalance', () => {
  it('valida o saldo disponível', () => {
    expect(isPixAmountWithinBalance(100, 100)).toBe(true);
    expect(isPixAmountWithinBalance(100.01, 100)).toBe(false);
    expect(isPixAmountWithinBalance(0, 100)).toBe(false);
  });
});
