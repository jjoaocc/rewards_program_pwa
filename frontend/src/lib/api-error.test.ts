import { describe, expect, it } from 'vitest';
import { ApiError } from './api-client';
import { getErrorMessage } from './api-error';

describe('getErrorMessage', () => {
  it('usa a mensagem do ApiError quando o erro é um ApiError', () => {
    const err = new ApiError(404, 'Cliente não encontrado');

    expect(getErrorMessage(err, 'fallback')).toBe('Cliente não encontrado');
  });

  it('usa o fallback para qualquer outro tipo de erro (ex: ZodError de schema inválido)', () => {
    const err = new Error('Unexpected field');

    expect(getErrorMessage(err, 'Erro ao carregar dados.')).toBe('Erro ao carregar dados.');
  });

  it('usa o fallback quando o valor lançado nem é um Error (ex: throw de string)', () => {
    expect(getErrorMessage('algo deu errado', 'fallback')).toBe('fallback');
  });
});
