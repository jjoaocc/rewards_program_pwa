import type { Campaign, Promotion } from '../types';

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp1',
    title: 'Semana do Construtor',
    description: 'Dobro de cashback em toda linha de cimento e argamassa! Válido até 15/02.',
    imageUrl: '/campaigns/semana-construtor.jpg',
    startDate: '2026-02-08',
    endDate: '2026-02-15',
    highlightColor: '#f97316', // orange-500
  },
  {
    id: 'camp2',
    title: 'Mês da Pintura',
    description: 'Todas as tintas com 10% de desconto + 7% de cashback!',
    imageUrl: '/campaigns/mes-pintura.jpg',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    highlightColor: '#3b82f6', // blue-500
  },
  {
    id: 'camp3',
    title: 'Super Desconto Ferramentas',
    description: 'Até 25% OFF em ferramentas elétricas e manuais. Aproveite!',
    imageUrl: '/campaigns/ferramentas.jpg',
    startDate: '2026-02-10',
    endDate: '2026-02-20',
    highlightColor: '#eab308', // yellow-500
  },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo1',
    title: 'Cimento CP-II com 15% OFF',
    description: 'Saco de 50kg com desconto especial',
    discount: 15,
    category: 'Cimento e Argamassa',
    validUntil: '2026-02-15',
    terms: 'Válido para compras acima de 10 sacos',
  },
  {
    id: 'promo2',
    title: 'Tinta Acrílica Premium',
    description: 'Lata de 18L - Cores variadas',
    discount: 20,
    category: 'Tintas',
    validUntil: '2026-02-28',
    terms: 'Não acumulativo com outras promoções',
  },
  {
    id: 'promo3',
    title: 'Kit Ferramentas Completo',
    description: 'Furadeira + Parafusadeira + Maleta',
    discount: 30,
    category: 'Ferramentas',
    validUntil: '2026-02-20',
    terms: 'Unidades limitadas',
  },
  {
    id: 'promo4',
    title: 'Piso Cerâmico Premium',
    description: 'Caixa com 2m² - Diversos modelos',
    discount: 25,
    category: 'Pisos e Revestimentos',
    validUntil: '2026-02-25',
    terms: 'Mínimo de 20 caixas',
  },
  {
    id: 'promo5',
    title: 'Torneiras e Registros',
    description: 'Linha completa com acabamento cromado',
    discount: 18,
    category: 'Hidráulica',
    validUntil: '2026-02-22',
  },
];