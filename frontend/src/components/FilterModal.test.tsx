import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterModal } from './FilterModal';
import type { TransactionFilters } from '../types';

const BASE_FILTERS: TransactionFilters = {
  startDate: '',
  endDate: '',
  store: '',
  minValue: '',
  maxValue: '',
  operationType: 'all',
};

describe('FilterModal', () => {
  it('não renderiza nada quando fechado', () => {
    const { container } = render(
      <FilterModal
        isOpen={false}
        onClose={vi.fn()}
        filters={BASE_FILTERS}
        onFiltersChange={vi.fn()}
        onClearFilters={vi.fn()}
        availableStores={[]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('lista as lojas disponíveis no select', () => {
    render(
      <FilterModal
        isOpen
        onClose={vi.fn()}
        filters={BASE_FILTERS}
        onFiltersChange={vi.fn()}
        onClearFilters={vi.fn()}
        availableStores={['Loja A', 'Loja B']}
      />,
    );

    expect(screen.getByRole('option', { name: 'Loja A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Loja B' })).toBeInTheDocument();
  });

  it('muda o tipo de operação ao clicar em Ganhos', async () => {
    const onFiltersChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterModal
        isOpen
        onClose={vi.fn()}
        filters={BASE_FILTERS}
        onFiltersChange={onFiltersChange}
        onClearFilters={vi.fn()}
        availableStores={[]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Ganhos' }));

    expect(onFiltersChange).toHaveBeenCalledWith({ ...BASE_FILTERS, operationType: 'credit' });
  });

  it('não mostra "Limpar Tudo" sem filtros ativos, mas mostra quando há filtro ativo', () => {
    const { rerender } = render(
      <FilterModal
        isOpen
        onClose={vi.fn()}
        filters={BASE_FILTERS}
        onFiltersChange={vi.fn()}
        onClearFilters={vi.fn()}
        availableStores={[]}
      />,
    );
    expect(screen.queryByText('Limpar Tudo')).not.toBeInTheDocument();

    rerender(
      <FilterModal
        isOpen
        onClose={vi.fn()}
        filters={{ ...BASE_FILTERS, store: 'Loja A' }}
        onFiltersChange={vi.fn()}
        onClearFilters={vi.fn()}
        availableStores={['Loja A']}
      />,
    );
    expect(screen.getByText('Limpar Tudo')).toBeInTheDocument();
  });

  it('chama onClearFilters ao clicar em Limpar Tudo', async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterModal
        isOpen
        onClose={vi.fn()}
        filters={{ ...BASE_FILTERS, store: 'Loja A' }}
        onFiltersChange={vi.fn()}
        onClearFilters={onClearFilters}
        availableStores={['Loja A']}
      />,
    );

    await user.click(screen.getByText('Limpar Tudo'));

    expect(onClearFilters).toHaveBeenCalled();
  });

  it('chama onClose ao clicar em Aplicar Filtros', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterModal
        isOpen
        onClose={onClose}
        filters={BASE_FILTERS}
        onFiltersChange={vi.fn()}
        onClearFilters={vi.fn()}
        availableStores={[]}
      />,
    );

    await user.click(screen.getByText('Aplicar Filtros'));

    expect(onClose).toHaveBeenCalled();
  });
});
