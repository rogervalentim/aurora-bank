import { brlFromCents, centsFromInput, maskAmountInput, percentFromPoints, percentFromRate } from '@/lib/format';

describe('format', () => {
  it('converte centavos em BRL', () => {
    expect(brlFromCents(120000)).toBe('R$\u00a01.200,00');
    expect(brlFromCents(0)).toBe('R$\u00a00,00');
  });

  it('formata percentuais de taxa e de pontos', () => {
    expect(percentFromRate(0.0165)).toBe('1,65%');
    expect(percentFromPoints(35.27)).toBe('35,27%');
    expect(percentFromPoints(35)).toBe('35,00%');
  });

  it('converte entrada digitada em centavos', () => {
    expect(centsFromInput('1.234,56')).toBe(123456);
    expect(centsFromInput('R$ 50,00')).toBe(5000);
    expect(centsFromInput('abc')).toBe(0);
    expect(centsFromInput('-10,00')).toBe(0);
  });

  it('mascara a digitação de valores', () => {
    expect(maskAmountInput('123456')).toBe('1.234,56');
    expect(maskAmountInput('')).toBe('');
    expect(maskAmountInput('12a3')).toBe('1,23');
  });
});
