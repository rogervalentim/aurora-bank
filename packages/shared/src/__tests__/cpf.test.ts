import { computeCpfCheckDigits, formatCpf, isValidCpf, maskCpfForDisplay, onlyDigits } from '../utils/cpf';
import { cpfSchema } from '../schemas/cpf';

describe('isValidCpf', () => {
  it('aceita CPFs com dígitos verificadores corretos', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('rejeita CPFs com dígitos verificadores errados', () => {
    expect(isValidCpf('52998224724')).toBe(false);
    expect(isValidCpf('11144477736')).toBe(false);
  });

  it('rejeita sequências repetidas e tamanhos inválidos', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('1234567890')).toBe(false);
    expect(isValidCpf('123456789012')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });

  it('rejeita CPF cujo primeiro dígito confere mas o segundo não', () => {
    expect(isValidCpf('52998224705')).toBe(false);
  });
});

describe('computeCpfCheckDigits', () => {
  it('calcula os dígitos verificadores de uma base de 9 dígitos', () => {
    expect(computeCpfCheckDigits('529982247')).toBe('25');
    expect(computeCpfCheckDigits('111.444.777')).toBe('35');
  });

  it('produz dígito zero quando o resto é menor que 2', () => {
    // 123456010 -> resto 0 no primeiro DV; a base com o 0 também dá resto 0 no segundo.
    expect(computeCpfCheckDigits('123456010')).toBe('00');
  });

  it('exige exatamente 9 dígitos', () => {
    expect(() => computeCpfCheckDigits('123')).toThrow(RangeError);
  });
});

describe('formatCpf / maskCpfForDisplay / onlyDigits', () => {
  it('formata CPF', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    expect(formatCpf('529.982.247-25')).toBe('529.982.247-25');
  });

  it('mascara CPF para exibição pública', () => {
    expect(maskCpfForDisplay('52998224725')).toBe('***.982.247-**');
    expect(maskCpfForDisplay('123')).toBe('***.***.***-**');
  });

  it('extrai somente dígitos', () => {
    expect(onlyDigits('529.982.247-25')).toBe('52998224725');
    expect(onlyDigits('abc')).toBe('');
  });
});

describe('cpfSchema', () => {
  it('aceita CPF válido com e sem máscara', () => {
    expect(cpfSchema.safeParse('529.982.247-25').success).toBe(true);
    expect(cpfSchema.safeParse('52998224725').success).toBe(true);
  });

  it('rejeita CPF inválido com mensagem de erro', () => {
    const result = cpfSchema.safeParse('529.982.247-24');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('CPF inválido.');
  });

  it('rejeita CPF com tamanho fora do intervalo', () => {
    expect(cpfSchema.safeParse('123').error?.issues[0]?.message).toBe('CPF deve ter 11 dígitos.');
    expect(cpfSchema.safeParse('529.982.247-255').error?.issues[0]?.message).toBe(
      'CPF deve ter no máximo 14 caracteres.',
    );
  });
});
