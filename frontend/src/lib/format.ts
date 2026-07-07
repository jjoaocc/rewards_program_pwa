export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Extrai só a parte de data (ano/mês/dia) de uma string ISO (com ou sem horário) e
// constrói um Date em horário local. Evita o bug clássico de `new Date('2026-01-01')`
// ser interpretado como UTC e exibir o dia anterior em fusos negativos (ex: Brasil).
function parseCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateLong(dateString: string): string {
  return parseCalendarDate(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  return parseCalendarDate(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatDateShortWithYear(dateString: string): string {
  return parseCalendarDate(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
