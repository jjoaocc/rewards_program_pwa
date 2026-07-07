import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HistoryView } from './HistoryView';
import { initialTransactionFilters, type Transaction, type TransactionFilters } from '../types';

const TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-01-10', description: 'Compra na loja A', value: 100, pointsEarned: 100, paymentMethod: 'Loja A' },
  { id: '2', date: '2026-01-05', description: 'Resgate de pontos', value: 30, pointsEarned: -30, paymentMethod: 'Loja B' },
];

// Wrapper controlado — simula o estado sendo mantido pelo componente pai (App.tsx),
// já que HistoryView agora recebe filters/onFiltersChange como props controladas.
function ControlledHistoryView(
  props: Omit<React.ComponentProps<typeof HistoryView>, 'filters' | 'onFiltersChange'>,
) {
  const [filters, setFilters] = useState<TransactionFilters>(initialTransactionFilters);
  return <HistoryView {...props} filters={filters} onFiltersChange={setFilters} />;
}

describe('HistoryView', () => {
  it('lista todas as transações por padrão', () => {
    render(<ControlledHistoryView transactions={TRANSACTIONS} />);

    expect(screen.getByText('Compra na loja A')).toBeInTheDocument();
    expect(screen.getByText('Resgate de pontos')).toBeInTheDocument();
  });

  it('filtra por tipo de operação (somente créditos)', async () => {
    const user = userEvent.setup();
    render(<ControlledHistoryView transactions={TRANSACTIONS} />);

    await user.click(screen.getByRole('button', { name: /filtrar/i }));
    await user.click(screen.getByRole('button', { name: /ganhos/i }));
    await user.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    expect(screen.getByText('Compra na loja A')).toBeInTheDocument();
    expect(screen.queryByText('Resgate de pontos')).not.toBeInTheDocument();
  });

  it('mostra estado vazio quando não há transações', () => {
    render(<ControlledHistoryView transactions={[]} />);

    expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
  });

  it('mostra uma mensagem de erro em vez do estado vazio quando a busca falhou', () => {
    render(<ControlledHistoryView transactions={[]} transactionsError="Erro ao carregar histórico." />);

    expect(screen.getByText('Erro ao carregar histórico.')).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma transação encontrada')).not.toBeInTheDocument();
  });

  it('mostra o botão "Carregar mais" quando hasMore é true e chama onLoadMore ao clicar', async () => {
    const onLoadMore = vi.fn();
    const user = userEvent.setup();
    render(<ControlledHistoryView transactions={TRANSACTIONS} hasMore onLoadMore={onLoadMore} />);

    await user.click(screen.getByRole('button', { name: /carregar mais/i }));

    expect(onLoadMore).toHaveBeenCalled();
  });

  it('não mostra "Carregar mais" quando hasMore é false', () => {
    render(<ControlledHistoryView transactions={TRANSACTIONS} hasMore={false} onLoadMore={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /carregar mais/i })).not.toBeInTheDocument();
  });

  it('mostra estado de carregando no botão quando isLoadingMore', () => {
    render(<ControlledHistoryView transactions={TRANSACTIONS} hasMore isLoadingMore onLoadMore={vi.fn()} />);

    expect(screen.getByRole('button', { name: /carregando/i })).toBeDisabled();
  });

  it('mantém o filtro quando os mesmos filters/onFiltersChange são reaproveitados (persistência entre trocas de aba)', () => {
    const filters: TransactionFilters = { ...initialTransactionFilters, operationType: 'credit' };
    const onFiltersChange = vi.fn();

    render(
      <HistoryView transactions={TRANSACTIONS} filters={filters} onFiltersChange={onFiltersChange} />,
    );

    // Só a transação de crédito aparece, porque o filtro já veio aplicado via prop —
    // prova que o estado do filtro vive fora do HistoryView (no pai), não é resetado
    // ao remontar o componente (equivalente a trocar de aba e voltar).
    expect(screen.getByText('Compra na loja A')).toBeInTheDocument();
    expect(screen.queryByText('Resgate de pontos')).not.toBeInTheDocument();
  });
});
