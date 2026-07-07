import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventsView } from './EventsView';
import { useEvents } from '../hooks/useEvents';
import type { Campaign, Promotion } from '../types';

vi.mock('../hooks/useEvents', () => ({
  useEvents: vi.fn(),
}));

const CAMPAIGN: Campaign = {
  id: 'c1',
  title: 'Aniversário da Loja',
  description: 'Promoções especiais',
  imageUrl: '',
  startDate: '2026-04-01',
  endDate: '2026-04-30',
  highlightColor: '#3b82f6',
};

const PROMOTION: Promotion = {
  id: 'p1',
  title: 'Desconto especial',
  description: '25% off em ferramentas',
  discount: 25,
  category: 'Promoção',
  validUntil: '2026-04-30',
};

describe('EventsView', () => {
  beforeEach(() => {
    vi.mocked(useEvents).mockReturnValue({
      campaigns: [],
      promotions: [],
      isLoading: false,
      error: null,
    });
  });

  it('mostra o spinner de carregamento', () => {
    vi.mocked(useEvents).mockReturnValue({ campaigns: [], promotions: [], isLoading: true, error: null });
    const { container } = render(<EventsView />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro em vez do conteúdo quando a busca falha', () => {
    vi.mocked(useEvents).mockReturnValue({
      campaigns: [],
      promotions: [],
      isLoading: false,
      error: 'Erro ao carregar eventos.',
    });
    render(<EventsView />);

    expect(screen.getByText('Erro ao carregar eventos.')).toBeInTheDocument();
  });

  it('mostra a campanha em destaque e as promoções ativas', () => {
    vi.mocked(useEvents).mockReturnValue({
      campaigns: [CAMPAIGN],
      promotions: [PROMOTION],
      isLoading: false,
      error: null,
    });
    render(<EventsView />);

    expect(screen.getByText('Aniversário da Loja')).toBeInTheDocument();
    expect(screen.getByText('Desconto especial')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há promoções ativas', () => {
    render(<EventsView />);

    expect(screen.getByText('Nenhuma promoção ativa no momento.')).toBeInTheDocument();
  });

  it('abre o modal de detalhes ao clicar numa promoção', async () => {
    vi.mocked(useEvents).mockReturnValue({
      campaigns: [],
      promotions: [PROMOTION],
      isLoading: false,
      error: null,
    });
    const user = userEvent.setup();
    render(<EventsView />);

    await user.click(screen.getByText('Desconto especial'));

    expect(screen.getByRole('button', { name: /ver lojas/i })).toBeInTheDocument();
  });
});
