import {
  calculateAnnualCet,
  calculateConsignado,
  calculateMarginCommitment,
  calculateMarginLimit,
  calculatePriceInstallment,
  isWithinConsignableMargin,
} from '../utils/finance';
import { assertPositiveFinite, roundMoney, roundTo } from '../utils/number';

describe('roundTo / roundMoney / assertPositiveFinite', () => {
  it('arredonda para o número de casas pedido', () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(1.23556, 3)).toBe(1.236);
    expect(roundTo(-1.005, 2)).toBe(-1);
    expect(roundTo(-1.015, 2)).toBe(-1.01);
    expect(roundMoney(10.555)).toBe(10.56);
    expect(roundMoney(10.554)).toBe(10.55);
  });

  it('rejeita valores não finitos ou não positivos', () => {
    expect(() => assertPositiveFinite(0, 'valor')).toThrow(RangeError);
    expect(() => assertPositiveFinite(-1, 'valor')).toThrow('valor deve ser um número finito e maior que zero');
    expect(() => assertPositiveFinite(Number.NaN, 'valor')).toThrow(RangeError);
    expect(() => assertPositiveFinite(Number.POSITIVE_INFINITY, 'valor')).toThrow(RangeError);
    expect(() => assertPositiveFinite(10, 'valor')).not.toThrow();
  });
});

describe('Tabela Price', () => {
  it('calcula a parcela fixa para R$ 10.000 em 24x a 1,65% a.m.', () => {
    // PMT = 10000 * (0.0165 * 1.0165^24) / (1.0165^24 - 1) = 507.9815...
    expect(calculatePriceInstallment(10_000, 24, 0.0165)).toBe(507.98);
  });

  it('calcula a parcela fixa para R$ 5.000 em 12x a 1,65% a.m.', () => {
    // PMT = 5000 * (0.0165 * 1.0165^12) / (1.0165^12 - 1) = 462.6940...
    expect(calculatePriceInstallment(5_000, 12, 0.0165)).toBe(462.69);
  });

  it('degrada para amortização simples quando a taxa é zero', () => {
    expect(calculatePriceInstallment(1_200, 12, 0)).toBe(100);
  });

  it('valida os argumentos', () => {
    expect(() => calculatePriceInstallment(0, 12, 0.01)).toThrow(RangeError);
    expect(() => calculatePriceInstallment(1_000, 0, 0.01)).toThrow(RangeError);
    expect(() => calculatePriceInstallment(1_000, 12.5, 0.01)).toThrow('installments deve ser um inteiro');
    expect(() => calculatePriceInstallment(1_000, 12, -0.01)).toThrow('monthlyRate deve ser um número finito');
    expect(() => calculatePriceInstallment(1_000, 12, Number.NaN)).toThrow(RangeError);
  });
});

describe('CET anual', () => {
  it('capitaliza a taxa mensal em 12 meses', () => {
    expect(calculateAnnualCet(0.0165)).toBe(0.216994);
    expect(calculateAnnualCet(0)).toBe(0);
  });

  it('rejeita taxa inválida', () => {
    expect(() => calculateAnnualCet(-0.01)).toThrow(RangeError);
    expect(() => calculateAnnualCet(Number.NaN)).toThrow(RangeError);
  });
});

describe('margem consignável', () => {
  it('calcula o teto de 35% da renda', () => {
    expect(calculateMarginLimit(3_000)).toBe(1_050);
    expect(calculateMarginLimit(4_321.99)).toBe(1_512.7);
  });

  it('calcula o percentual da renda comprometido', () => {
    expect(calculateMarginCommitment(507.98, 3_000)).toBe(16.93);
  });

  it('bloqueia quando a parcela excede 35% da renda', () => {
    expect(isWithinConsignableMargin(1_050, 3_000)).toBe(true);
    expect(isWithinConsignableMargin(1_050.01, 3_000)).toBe(false);
  });

  it('valida os argumentos', () => {
    expect(() => calculateMarginLimit(0)).toThrow(RangeError);
    expect(() => calculateMarginCommitment(100, -1)).toThrow(RangeError);
    expect(() => isWithinConsignableMargin(0, 3_000)).toThrow(RangeError);
  });
});

describe('calculateConsignado', () => {
  it('retorna o pacote completo de uma simulação dentro da margem', () => {
    const result = calculateConsignado(10_000, 24, 0.0165, 5_000);

    expect(result).toEqual({
      amount: 10_000,
      installments: 24,
      monthlyRate: 0.0165,
      installmentAmount: 507.98,
      totalAmount: 12_191.52,
      totalInterest: 2_191.52,
      annualCet: 0.216994,
      annualCetPercent: 21.7,
      marginLimit: 1_750,
      maxInstallment: 1_750,
      committedIncomePercent: 10.16,
      isWithinMargin: true,
    });
  });

  it('bloqueia a proposta quando a parcela ultrapassa 35% da renda', () => {
    const result = calculateConsignado(10_000, 24, 0.0165, 1_000);

    expect(result.installmentAmount).toBe(507.98);
    expect(result.marginLimit).toBe(350);
    expect(result.isWithinMargin).toBe(false);
    expect(result.committedIncomePercent).toBe(50.8);
  });

  it('aceita exatamente o teto da margem', () => {
    const result = calculateConsignado(1_200, 12, 0, 285.71);
    expect(result.installmentAmount).toBe(100);
    expect(result.marginLimit).toBe(100);
    expect(result.isWithinMargin).toBe(true);
    expect(result.totalInterest).toBe(0);
    expect(result.annualCetPercent).toBe(0);
  });

  it('valida a renda informada', () => {
    expect(() => calculateConsignado(10_000, 24, 0.0165, 0)).toThrow(RangeError);
  });
});
