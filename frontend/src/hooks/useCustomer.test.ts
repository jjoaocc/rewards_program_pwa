import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { CustomerApiResponseSchema, mapCustomer, useCustomer } from './useCustomer';

describe('mapCustomer', () => {
  it('maps the API snake_case response into the Customer domain shape', () => {
    const customer = mapCustomer({
      id: '7742',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '47999990000',
      mobile: '47988880000',
      document: '12345678900',
      document_type: 'cpf',
      birth_date: '1990-01-01',
      balance: '123.45',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      address: {
        cep: '89200-000',
        street: 'Rua das Flores',
        number: '100',
        neighborhood: 'Centro',
        city: 'Joinville',
        state: 'SC',
      },
    });

    expect(customer).toEqual({
      id: '7742',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '47999990000',
      secondaryPhone: '47988880000',
      document: '12345678900',
      documentType: 'cpf',
      birthDate: '1990-01-01',
      balance: 123.45,
      active: true,
      lastUpdated: '2026-01-01T00:00:00Z',
      address: {
        cep: '89200-000',
        street: 'Rua das Flores',
        number: '100',
        neighborhood: 'Centro',
        city: 'Joinville',
        state: 'SC',
      },
      stats: {
        totalEarned: 0,
        totalRedeemed: 0,
        memberSince: '2026-01-01T00:00:00Z',
      },
    });
  });

  it('fills in an empty address when the API omits it', () => {
    const customer = mapCustomer({
      id: '7742',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '47999990000',
      document: '12345678900',
      document_type: 'cpf',
      balance: '0',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    });

    expect(customer.address).toEqual({
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  });

  it('mapeia secondary_email quando presente', () => {
    const customer = mapCustomer({
      id: '7742',
      name: 'João Silva',
      email: 'joao@example.com',
      secondary_email: 'secundario@example.com',
      document: '12345678900',
      document_type: 'cpf',
      balance: '0',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    });

    expect(customer.secondaryEmail).toBe('secundario@example.com');
  });

  it('trata phone/mobile/birth_date/address nulos (não só ausentes) sem quebrar', () => {
    // O backend manda `null` explícito pra campos Optional sem valor, não omite a chave.
    const customer = mapCustomer({
      id: '7742',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: null,
      mobile: null,
      document: '12345678900',
      document_type: 'cpf',
      birth_date: null,
      balance: '0',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      address: null,
    });

    expect(customer.phone).toBe('');
    expect(customer.secondaryPhone).toBeUndefined();
    expect(customer.birthDate).toBeUndefined();
    expect(customer.address).toEqual({
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  });
});

describe('CustomerApiResponseSchema', () => {
  const validResponse = {
    id: '7742',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '47999990000',
    document: '12345678900',
    document_type: 'cpf',
    balance: '123.45',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  };

  it('aceita uma resposta válida da API (sem updated_at, que o backend nunca envia)', () => {
    expect(() => CustomerApiResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('aceita a resposta real de produção como veio da API', () => {
    // Payload capturado de /customers/me em produção — trava contra regressão de schema.
    const realProductionPayload = {
      id: '7742',
      name: 'João Constantino Caetano',
      email: 'joao.silva@email.com',
      document: '123.456.789-00',
      document_type: 'cpf',
      birth_date: '2006-09-21',
      phone: '(47) 3333-4444',
      mobile: '(47) 99999-8888',
      balance: '1234.56',
      is_active: true,
      created_at: '2026-02-22T03:16:22.855502',
      address: {
        cep: '89200-000',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 201',
        neighborhood: 'Centro',
        city: 'Joinville',
        state: 'SC',
      },
    };

    expect(() => CustomerApiResponseSchema.parse(realProductionPayload)).not.toThrow();
  });

  it('rejeita quando falta um campo obrigatório em vez de deixar passar dado incompleto', () => {
    // Sem essa validação, `mapCustomer` chamaria parseFloat(undefined) e geraria
    // `balance: NaN` silenciosamente, sem nenhum erro visível pro desenvolvedor.
    const missingBalance: Record<string, unknown> = { ...validResponse };
    delete missingBalance.balance;

    expect(() => CustomerApiResponseSchema.parse(missingBalance)).toThrow();
  });

  it('rejeita document_type fora do enum esperado', () => {
    expect(() => CustomerApiResponseSchema.parse({ ...validResponse, document_type: 'invalido' })).toThrow();
  });

  it('aceita null explícito em campos opcionais (phone, mobile, birth_date, address)', () => {
    expect(() =>
      CustomerApiResponseSchema.parse({
        ...validResponse,
        phone: null,
        mobile: null,
        birth_date: null,
        address: null,
      }),
    ).not.toThrow();
  });
});

describe('useCustomer (porta injetável)', () => {
  it('usa o client injetado em vez do apiClient real, sem precisar de vi.mock no módulo', async () => {
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue({
        id: '7742',
        name: 'João Silva',
        email: 'joao@example.com',
        document: '12345678900',
        document_type: 'cpf',
        balance: '10.00',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useCustomer(fakeClient));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fakeClient.get).toHaveBeenCalledWith('/customers/me');
    expect(result.current.customer?.name).toBe('João Silva');
  });
});
