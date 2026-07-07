import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToast } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa sem toast', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeNull();
  });

  it('show() define o toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.show('success', 'Enviado!'));

    expect(result.current.toast).toEqual({ type: 'success', text: 'Enviado!' });
  });

  it('esconde o toast sozinho depois do tempo configurado', () => {
    const { result } = renderHook(() => useToast(1000));

    act(() => result.current.show('error', 'Falhou'));
    expect(result.current.toast).not.toBeNull();

    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.toast).toBeNull();
  });
});
