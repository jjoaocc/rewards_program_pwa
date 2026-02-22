import type { Notification } from '../types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    title: '🎉 Super Oferta de Semana!',
    message: 'Cimento 50kg com 25% OFF! Válido até domingo. Venha conferir!',
    type: 'promotion',
    timestamp: '2026-02-07T14:30:00-03:00',
    read: false,
    imageUrl: '/promo-cimento.jpg' // Opcional
  },
  {
    id: 'notif-002',
    title: '💰 Você acumulou R$ 45,00!',
    message: 'Parabéns! Sua última compra rendeu R$ 45,00 em créditos.',
    type: 'reward',
    timestamp: '2026-02-06T09:15:00-03:00',
    read: false
  },
  {
    id: 'notif-003',
    title: '🛠️ Ferramentas em Promoção',
    message: 'Furadeira Bosch, Parafusadeira e mais! Até 40% de desconto.',
    type: 'promotion',
    timestamp: '2026-02-05T16:45:00-03:00',
    read: true
  },
  {
    id: 'notif-004',
    title: '📦 Novo Estoque Disponível',
    message: 'Telhas coloniais e tijolos cerâmicos chegaram! Estoque limitado.',
    type: 'promotion',
    timestamp: '2026-02-04T11:20:00-03:00',
    read: true
  },
  {
    id: 'notif-005',
    title: '⚡ Flash Sale - Tintas',
    message: 'Tintas Suvinil com 30% OFF por 24h! Corre que acaba!',
    type: 'promotion',
    timestamp: '2026-02-03T08:00:00-03:00',
    read: true
  }
];