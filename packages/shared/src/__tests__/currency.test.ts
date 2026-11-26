import {
  formatCurrencyBRL,
  formatDecimalBRL,
  formatPercentBR,
  maskCpf,
  maskCurrencyBRL,
  maskPhone,
  parseCurrencyBRL,
} from '../utils/currency';

/** O Intl usa espaço não separável (U+00A0) entre "R$" e o valor. */
const NBSP = '\u00a0';

describe('formatCurrencyBRL', () => {
  it('formata valores no padrão pt-BR', () => {
    expect(formatCurrencyBRL(0)).toBe(`R$${NBSP}0,00`);
    expect(formatCurrencyBRL(1234.5)).toBe(`R$${NBSP}1.234,50`);
    expect(formatCurrencyBRL(1000000)).toBe(`R$${NBSP}1.000.000,00`);
    expect(formatCurrencyBRL(-45.678)).toBe(`-R$${NBSP}45,68`);
    expect(formatCurrencyBRL(511.255)).toBe(`R$${NBSP}511,26`);
  });

  it('normaliza zero negativo', () => {
    expect(formatCurrencyBRL(-0)).toBe(`R$${NBSP}0,00`);
  });

  it('rejeita valores não finitos', () => {
    expect(() => formatCurrencyBRL(Number.NaN)).toThrow(RangeError);
    expect(() => formatCurrencyBRL(Number.POSITIVE_INFINITY)).toThrow('Valor inválido para formatação monetária');
  });
});

describe('formatDecimalBRL', () => {
  it('formata sem o símbolo da moeda', () => {
    expect(formatDecimalBRL(1234.5)).toBe('1.234,50');
    expect(formatDecimalBRL(-0)).toBe('0,00');
  });

  it('rejeita valores não finitos', () => {
    expect(() => formatDecimalBRL(Number.NaN)).toThrow('Valor inválido para formatação numérica');
  });
});

describe('formatPercentBR', () => {
  it('formata frações como percentual', () => {
    expect(formatPercentBR(0.0165)).toBe(`1,65%`);
    expect(formatPercentBR(0.35, 0)).toBe('35%');
    expect(formatPercentBR(0.5, 1)).toBe('50,0%');
  });

  it('rejeita valores não finitos', () => {
    expect(() => formatPercentBR(Number.NaN)).toThrow('Valor inválido para formatação percentual');
  });
});

describe('parseCurrencyBRL', () => {
  it('converte texto monetário em número', () => {
    expect(parseCurrencyBRL(`R$${NBSP}1.234,56`)).toBe(1234.56);
    expect(parseCurrencyBRL('45,90')).toBe(45.9);
  });

  it('retorna NaN quando não há número', () => {
    expect(parseCurrencyBRL('abc')).toBeNaN();
  });
});

describe('máscaras', () => {
  it('mascara CPF parcial e completo', () => {
    expect(maskCpf('12345678901')).toBe('123.456.789-01');
    expect(maskCpf('123456')).toBe('123.456');
    expect(maskCpf('1234567')).toBe('123.456.7');
    expect(maskCpf('123')).toBe('123');
    expect(maskCpf('123456789012345')).toBe('123.456.789-01');
  });

  it('mascara telefone fixo e celular', () => {
    expect(maskPhone('1133334444')).toBe('(11) 3333-4444');
    expect(maskPhone('11999998888')).toBe('(11) 99999-8888');
    expect(maskPhone('11')).toBe('(11)');
    expect(maskPhone('1')).toBe('1');
    expect(maskPhone('119')).toBe('(11) 9');
  });

  it('mascara moeda e trata valores inválidos', () => {
    expect(maskCurrencyBRL(1234.5)).toBe(`R$${NBSP}1.234,50`);
    expect(maskCurrencyBRL(Number.NaN)).toBe(`R$${NBSP}0,00`);
  });
});
