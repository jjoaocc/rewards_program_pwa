import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { useCustomerSearch } from './useCustomerSearch';

const CUSTOMER = { id: '7742', name: 'João Silva', email: 'joao@example.com' };

describe('useCustomerSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('não busca nada enquanto o termo está vazio', () => {
    const client: AdminApiClientPort = { get: vi.fn(), post: vi.fn() };

    renderHook(() => useCustomerSearch('token', client));

    expect(client.get).not.toHaveBeenCalled();
  });

  it('busca com debounce depois que o usuário para de digitar', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([CUSTOMER]), post: vi.fn() };

    const { result } = renderHook(() => useCustomerSearch('token', client));

    act(() => result.current.setTerm('maria'));
    expect(client.get).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(client.get).toHaveBeenCalledWith('/push/admin/customers?search=maria', 'token');
    expect(result.current.results).toEqual([CUSTOMER]);
  });

  it('digitação rápida sucessiva dispara só uma busca (debounce de verdade)', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([CUSTOMER]), post: vi.fn() };

    const { result } = renderHook(() => useCustomerSearch('token', client));

    act(() => result.current.setTerm('m'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    act(() => result.current.setTerm('ma'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    act(() => result.current.setTerm('maria'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith('/push/admin/customers?search=maria', 'token');
  });

  it('em caso de erro, esvazia os resultados em vez de manter dado antigo', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockRejectedValue(new Error('boom')), post: vi.fn() };

    const { result } = renderHook(() => useCustomerSearch('token', client));

    act(() => result.current.setTerm('maria'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.results).toEqual([]);
  });

  it('clear() volta o termo e os resultados ao estado inicial', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([CUSTOMER]), post: vi.fn() };

    const { result } = renderHook(() => useCustomerSearch('token', client));

    act(() => result.current.setTerm('maria'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.results).toHaveLength(1);

    act(() => result.current.clear());

    expect(result.current.term).toBe('');
    expect(result.current.results).toEqual([]);
  });
});
