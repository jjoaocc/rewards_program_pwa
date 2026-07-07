import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PromotionDetailModal } from './PromotionDetailModal';
import type { Promotion } from '../types';

const PROMOTION: Promotion = {
  id: 'p1',
  title: 'Desconto especial',
  description: '25% off em ferramentas',
  discount: 25,
  category: 'Promoção',
  validUntil: '2026-04-30',
};

describe('PromotionDetailModal', () => {
  it('não renderiza nada quando fechado', () => {
    const { container } = render(<PromotionDetailModal promotion={PROMOTION} isOpen={false} onClose={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o desconto e o preço promocional calculado', () => {
    render(<PromotionDetailModal promotion={PROMOTION} isOpen onClose={vi.fn()} />);

    expect(screen.getByText('25%')).toBeInTheDocument();
    // Base fictícia de R$ 100 com 25% off = R$ 75,00
    expect(screen.getByText('R$ 75,00')).toBeInTheDocument();
  });

  it('mostra termos e condições quando presentes', () => {
    render(
      <PromotionDetailModal
        promotion={{ ...PROMOTION, terms: 'Válido só na loja física' }}
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Válido só na loja física')).toBeInTheDocument();
  });

  it('não mostra a seção de termos quando ausentes', () => {
    render(<PromotionDetailModal promotion={PROMOTION} isOpen onClose={vi.fn()} />);

    expect(screen.queryByText('Termos e Condições')).not.toBeInTheDocument();
  });

  it('chama onClose ao clicar em Voltar', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<PromotionDetailModal promotion={PROMOTION} isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /voltar/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
