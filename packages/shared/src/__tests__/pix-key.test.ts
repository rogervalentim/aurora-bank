import {
  isValidBrazilianPhone,
  isValidEmail,
  isValidUuidV4,
  normalizePhone,
  normalizePixKey,
  pixKeySchema,
  pixKeyValidators,
  toE164BrazilianPhone,
  validatePixKey,
} from '../schemas/pix-key';

describe('validação de chave Pix', () => {
  it('valida CPF como chave', () => {
    expect(validatePixKey('CPF', '529.982.247-25')).toBe(true);
    expect(validatePixKey('CPF', '529.982.247-24')).toBe(false);
  });

  it('valida e-mail como chave', () => {
    expect(validatePixKey('EMAIL', 'cliente@aurorabank.com.br')).toBe(true);
    expect(validatePixKey('EMAIL', 'cliente@aurora')).toBe(false);
    expect(validatePixKey('EMAIL', 'sem-arroba.com')).toBe(false);
  });

  it('valida telefone como chave', () => {
    expect(validatePixKey('PHONE', '11999998888')).toBe(true);
    expect(validatePixKey('PHONE', '+55 (11) 99999-8888')).toBe(true);
    expect(validatePixKey('PHONE', '1133334444')).toBe(true);
    expect(validatePixKey('PHONE', '119999888')).toBe(false);
    expect(validatePixKey('PHONE', '11999998888x')).toBe(false);
  });

  it('valida chave aleatória UUID v4', () => {
    expect(validatePixKey('RANDOM', '3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
    expect(validatePixKey('RANDOM', '3FA85F64-5717-4562-B3FC-2C963F66AFA6')).toBe(true);
    expect(validatePixKey('RANDOM', '3fa85f64-5717-1562-b3fc-2c963f66afa6')).toBe(false);
    expect(validatePixKey('RANDOM', 'nao-e-uuid')).toBe(false);
  });

  it('expõe validadores por tipo', () => {
    expect(pixKeyValidators.EMAIL('a@b.com')).toBe(true);
    expect(pixKeyValidators.RANDOM('x')).toBe(false);
  });

  it('valida helpers individuais', () => {
    expect(isValidEmail('  A@B.COM ')).toBe(true);
    expect(isValidUuidV4(' 3fa85f64-5717-4562-b3fc-2c963f66afa6 ')).toBe(true);
    expect(isValidBrazilianPhone('(11) 99999-8888')).toBe(true);
    expect(isValidBrazilianPhone('(11) 9999-8888')).toBe(true);
    expect(isValidBrazilianPhone('99999-8888')).toBe(false);
  });
});

describe('normalizePixKey', () => {
  it('normaliza por tipo', () => {
    expect(normalizePixKey('CPF', '529.982.247-25')).toBe('52998224725');
    expect(normalizePixKey('EMAIL', '  Cliente@AuroraBank.com.BR ')).toBe('cliente@aurorabank.com.br');
    expect(normalizePixKey('PHONE', '(11) 99999-8888')).toBe('+5511999998888');
    expect(normalizePixKey('RANDOM', ' 3FA85F64-5717-4562-B3FC-2C963F66AFA6 ')).toBe(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
  });

  it('normaliza telefones com e sem código do país', () => {
    expect(normalizePhone(' +55 (11) 99999-8888 ')).toBe('+5511999998888');
    expect(toE164BrazilianPhone('5511999998888')).toBe('+5511999998888');
    expect(toE164BrazilianPhone('011999998888')).toBe('+5511999998888');
  });

  it('rejeita telefone inválido na conversão E.164', () => {
    expect(() => toE164BrazilianPhone('123')).toThrow(RangeError);
  });
});

describe('pixKeySchema', () => {
  it('aceita chave válida', () => {
    const result = pixKeySchema.safeParse({ type: 'EMAIL', value: 'cliente@aurora.com' });
    expect(result.success).toBe(true);
  });

  it('rejeita chave inválida apontando o campo value', () => {
    const result = pixKeySchema.safeParse({ type: 'CPF', value: '111.111.111-11' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['value']);
    expect(result.error?.issues[0]?.message).toBe('Chave Pix inválida para o tipo CPF.');
  });

  it('rejeita valor vazio', () => {
    const result = pixKeySchema.safeParse({ type: 'RANDOM', value: '   ' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe a chave Pix.');
  });

  it('rejeita tipo desconhecido', () => {
    expect(pixKeySchema.safeParse({ type: 'BOLETO', value: 'x' }).success).toBe(false);
  });
});
