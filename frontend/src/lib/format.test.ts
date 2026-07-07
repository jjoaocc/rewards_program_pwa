import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateLong, formatDateShort, formatDateShortWithYear } from './format';

describe('formatCurrency', () => {
  it('formata valores abaixo de mil no padrão brasileiro (vírgula decimal)', () => {
    expect(formatCurrency(123.4)).toBe('123,40');
  });

  it('adiciona separador de milhar no padrão brasileiro (ponto)', () => {
    expect(formatCurrency(1234.5)).toBe('1.234,50');
  });

  it('sempre mostra duas casas decimais, mesmo para valores inteiros', () => {
    expect(formatCurrency(100)).toBe('100,00');
  });

  it('arredonda para duas casas decimais em vez de mostrar mais dígitos', () => {
    expect(formatCurrency(10.005)).toBe('10,01');
  });

  it('formata zero corretamente', () => {
    expect(formatCurrency(0)).toBe('0,00');
  });
});

describe('formatDateLong', () => {
  it('formata com dia, mês por extenso e ano', () => {
    expect(formatDateLong('2026-03-05')).toBe('05 de março de 2026');
  });

  it('não desloca um dia para trás em fusos negativos (bug clássico de new Date(string))', () => {
    // "2026-01-01" interpretado ingenuamente como UTC vira 31/12/2025 em fusos como
    // America/Sao_Paulo (UTC-3). Isso testa que o dia exibido é sempre o dia calendário
    // da string, independente do fuso horário de quem está rodando o app.
    expect(formatDateLong('2026-01-01')).toBe('01 de janeiro de 2026');
    expect(formatDateLong('2026-01-01T00:00:00.000Z')).toBe('01 de janeiro de 2026');
  });
});

describe('formatDateShort', () => {
  it('formata com dia e mês abreviado, sem ano', () => {
    expect(formatDateShort('2026-03-05')).toBe('05 de mar.');
  });
});

describe('formatDateShortWithYear', () => {
  it('formata com dia, mês abreviado e ano', () => {
    expect(formatDateShortWithYear('2026-03-05')).toBe('05 de mar. de 2026');
  });
});
