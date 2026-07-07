import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotificationPreview } from './NotificationPreview';

describe('NotificationPreview', () => {
  it('mostra título e mensagem digitados', () => {
    render(<NotificationPreview title="Promoção" message="20% off hoje" />);

    expect(screen.getByText('Promoção')).toBeInTheDocument();
    expect(screen.getByText('20% off hoje')).toBeInTheDocument();
  });

  it('mostra placeholders quando título e mensagem estão vazios', () => {
    render(<NotificationPreview title="" message="" />);

    expect(screen.getByText('Título da notificação')).toBeInTheDocument();
    expect(screen.getByText('A mensagem aparece aqui conforme você digita.')).toBeInTheDocument();
  });
});
