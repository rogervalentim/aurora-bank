import {
  consignableMarginLimit,
  consignableMarginSchema,
  consignadoSimulationSchema,
  employmentTypeSchema,
  fitsConsignableMargin,
  monthlyIncomeSchema,
} from '../schemas/consignado';
import { createAccountSchema, financialDataSchema, passwordSchema, personalDataSchema } from '../schemas/account';

describe('margem consignável', () => {
  it('calcula o teto de 35% com arredondamento em centavos', () => {
    expect(consignableMarginLimit(3_000)).toBe(1_050);
    expect(consignableMarginLimit(4_321.99)).toBe(1_512.7);
  });

  it('valida enquadramento na margem', () => {
    expect(fitsConsignableMargin(3_000, 1_050)).toBe(true);
    expect(fitsConsignableMargin(3_000, 1_050.01)).toBe(false);
  });

  it('valida o schema de margem', () => {
    expect(consignableMarginSchema.safeParse({ monthlyIncome: 3_000, installmentAmount: 900 }).success).toBe(true);
    expect(consignableMarginSchema.safeParse({ monthlyIncome: 0, installmentAmount: 900 }).success).toBe(false);
    expect(consignableMarginSchema.safeParse({ monthlyIncome: 3_000, installmentAmount: -1 }).success).toBe(false);
    expect(consignableMarginSchema.safeParse({ monthlyIncome: Number.POSITIVE_INFINITY, installmentAmount: 1 }).success).toBe(
      false,
    );
    expect(consignableMarginSchema.safeParse({ monthlyIncome: 3_000, installmentAmount: Number.NaN }).success).toBe(false);
  });

  it('valida renda e vínculo', () => {
    expect(monthlyIncomeSchema.safeParse(5_000).success).toBe(true);
    expect(monthlyIncomeSchema.safeParse(Number.NaN).success).toBe(false);
    expect(monthlyIncomeSchema.safeParse('5000').error?.issues[0]?.message).toBe('Informe a renda mensal.');
    expect(monthlyIncomeSchema.safeParse(-5).error?.issues[0]?.message).toBe(
      'A renda mensal deve ser maior que zero.',
    );
    expect(employmentTypeSchema.safeParse('INSS').success).toBe(true);
    expect(employmentTypeSchema.safeParse('PJ').success).toBe(false);
  });
});

describe('consignadoSimulationSchema', () => {
  const valid = {
    amount: 10_000,
    installments: 24,
    monthlyRate: 0.0165,
    monthlyIncome: 5_000,
    employmentType: 'CLT' as const,
  };

  it('aceita simulação dentro da margem', () => {
    expect(consignadoSimulationSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita quando a parcela excede 35% da renda', () => {
    const result = consignadoSimulationSchema.safeParse({ ...valid, monthlyIncome: 1_000 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['amount']);
    expect(result.error?.issues[0]?.message).toBe(
      'A parcela excede a margem consignável de 35% da renda mensal.',
    );
  });

  it('aceita simulação com taxa zero dentro da margem', () => {
    expect(
      consignadoSimulationSchema.safeParse({ ...valid, amount: 1_000, installments: 12, monthlyRate: 0, monthlyIncome: 1_000 })
        .success,
    ).toBe(true);
  });

  it('rejeita valor fora da faixa permitida', () => {
    expect(consignadoSimulationSchema.safeParse({ ...valid, amount: 500 }).error?.issues[0]?.message).toBe(
      'O valor mínimo é R$ 1.000.',
    );
    expect(consignadoSimulationSchema.safeParse({ ...valid, amount: 60_000 }).error?.issues[0]?.message).toBe(
      'O valor máximo é R$ 50.000.',
    );
    expect(consignadoSimulationSchema.safeParse({ ...valid, amount: '10000' }).success).toBe(false);
  });

  it('rejeita prazo não permitido', () => {
    expect(consignadoSimulationSchema.safeParse({ ...valid, installments: 18 }).error?.issues[0]?.message).toBe(
      'Prazo deve ser um de: 12, 24, 36, 48, 60, 84 meses.',
    );
    expect(consignadoSimulationSchema.safeParse({ ...valid, installments: 12.5 }).error?.issues[0]?.message).toBe(
      'O prazo deve ser em meses inteiros.',
    );
    expect(consignadoSimulationSchema.safeParse({ ...valid, installments: '24' }).error?.issues[0]?.message).toBe(
      'Selecione o prazo.',
    );
  });

  it('rejeita taxa negativa', () => {
    expect(consignadoSimulationSchema.safeParse({ ...valid, monthlyRate: -1 }).error?.issues[0]?.message).toBe(
      'A taxa não pode ser negativa.',
    );
  });
});

describe('schemas de conta', () => {
  it('valida senha', () => {
    expect(passwordSchema.safeParse('aurora123').success).toBe(true);
    expect(passwordSchema.safeParse('12345678').error?.issues[0]?.message).toBe(
      'A senha deve conter ao menos uma letra.',
    );
    expect(passwordSchema.safeParse('abcdefgh').error?.issues[0]?.message).toBe(
      'A senha deve conter ao menos um número.',
    );
    expect(passwordSchema.safeParse('a1').error?.issues[0]?.message).toBe(
      'A senha deve ter no mínimo 8 caracteres.',
    );
  });

  it('valida dados pessoais', () => {
    expect(
      personalDataSchema.safeParse({
        fullName: 'Maria Silva',
        cpf: '529.982.247-25',
        email: 'maria@aurora.com',
        password: 'aurora123',
      }).success,
    ).toBe(true);

    expect(personalDataSchema.safeParse({ fullName: 'Maria', cpf: '52998224725', email: 'a@b.com', password: 'aurora123' })
      .error?.issues[0]?.message).toBe('Informe nome e sobrenome.');
    expect(personalDataSchema.safeParse({ fullName: '   ', cpf: '52998224725', email: 'a@b.com', password: 'aurora123' })
      .error?.issues[0]?.message).toBe('Informe o nome completo.');
    expect(personalDataSchema.safeParse({ fullName: 'Maria Silva', cpf: '52998224725', email: 'maria', password: 'aurora123' })
      .error?.issues[0]?.message).toBe('E-mail inválido.');
  });

  it('valida dados financeiros e payload completo de abertura de conta', () => {
    expect(financialDataSchema.safeParse({ monthlyIncome: 4_000, employmentType: 'PUBLIC_SERVANT' }).success).toBe(true);
    expect(
      createAccountSchema.safeParse({
        fullName: 'Maria Silva',
        cpf: '52998224725',
        email: 'maria@aurora.com',
        password: 'aurora123',
        monthlyIncome: 4_000,
        employmentType: 'INSS',
      }).success,
    ).toBe(true);
  });
});
