jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: { apiUrl: 'http://localhost:3000' } } } }));

import { ApiError, normalizeError } from '@/services/http';

describe('normalizeError', () => {
  it('mantém a mensagem de ApiError', () => {
    expect(normalizeError(new ApiError('Conta não encontrada.', 404))).toBe('Conta não encontrada.');
  });

  it('traduz falha de rede', () => {
    const error = { isAxiosError: true, message: 'Network Error' };
    expect(normalizeError(error)).toBe('Sem conexão com o Aurora Bank. Verifique sua internet.');
  });

  it('traduz timeout', () => {
    const error = { isAxiosError: true, code: 'ECONNABORTED' };
    expect(normalizeError(error)).toBe('A operação demorou demais. Tente novamente.');
  });

  it('usa a mensagem de erro do servidor', () => {
    const error = { isAxiosError: true, response: { status: 422, data: { error: 'Saldo insuficiente.' } } };
    expect(normalizeError(error)).toBe('Saldo insuficiente.');
  });

  it('cai no texto genérico', () => {
    expect(normalizeError(new Error(''))).toBe('Não foi possível concluir a operação.');
  });
});
