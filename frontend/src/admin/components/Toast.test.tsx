import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  it('não renderiza nada quando não há toast', () => {
    const { container } = render(<Toast toast={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o texto do toast de sucesso', () => {
    render(<Toast toast={{ type: 'success', text: 'Enviado com sucesso' }} />);
    expect(screen.getByText('Enviado com sucesso')).toBeInTheDocument();
  });

  it('mostra o texto do toast de erro', () => {
    render(<Toast toast={{ type: 'error', text: 'Deu ruim' }} />);
    expect(screen.getByText('Deu ruim')).toBeInTheDocument();
  });
});
