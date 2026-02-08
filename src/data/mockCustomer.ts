import type { Customer, Transaction } from '../types';

export const MOCK_CUSTOMER: Customer = {
  // Identificação
  id: '7742',
  name: 'João Carlos Costa',
  documentType: 'cpf',
  document: '123.456.789-00',
  
  // Contatos principais
  email: 'joao.costa@email.com',
  phone: '(47) 99999-9999',
  
  // Contatos secundários
  secondaryEmail: 'jcarlos@gmail.com',
  secondaryPhone: '(47) 98888-8888',
  
  // Datas
  birthDate: '1990-05-15',
  
  // Endereço
  address: {
    cep: '89201-400',
    street: 'Rua XV de Novembro',
    number: '1500',
    complement: 'Apto 302',
    neighborhood: 'Centro',
    city: 'Joinville',
    state: 'SC',
  },
  
  // Programa
  balance: 154.50,
  identificationToken: 'TOKEN-ABC-123',
  lastUpdated: new Date().toISOString(),
  active: true,
  
  // Estatísticas
  stats: {
    totalEarned: 286.19,
    totalRedeemed: 131.69,
    totalSaved: 286.19,
    memberSince: '2024-06-10',
  },
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2026-02-05',
    time: '14:32',
    description: 'Compra Loja Centro',
    value: 847.80,
    pointsEarned: 42.39,
    paymentMethod: 'Cartão de Crédito',
    invoiceNumber: 'NF-2026-001234',
    products: [
      { id: 'p1', name: 'Cimento CP-II 50kg', quantity: 10, unitPrice: 32.90, total: 329.00 },
      { id: 'p2', name: 'Areia Média (m³)', quantity: 2, unitPrice: 85.00, total: 170.00 },
      { id: 'p3', name: 'Tijolo Cerâmico 8 furos', quantity: 500, unitPrice: 0.65, total: 325.00 },
      { id: 'p4', name: 'Ferragem CA-50 8mm (barra 12m)', quantity: 3, unitPrice: 7.60, total: 22.80 },
      { id: 'p5', name: 'Brita 1 (m³)', quantity: 1, unitPrice: 1.00, total: 1.00 },
    ]
  },
  {
    id: '2',
    date: '2026-02-01',
    time: '10:15',
    description: 'Compra Loja Sul',
    value: 324.50,
    pointsEarned: 16.23,
    paymentMethod: 'PIX',
    invoiceNumber: 'NF-2026-001189',
    products: [
      { id: 'p6', name: 'Tinta Acrílica Premium 18L Branca', quantity: 2, unitPrice: 145.00, total: 290.00 },
      { id: 'p7', name: 'Rolo de Lã 23cm', quantity: 3, unitPrice: 8.50, total: 25.50 },
      { id: 'p8', name: 'Fita Crepe 18mm', quantity: 2, unitPrice: 4.50, total: 9.00 },
    ]
  },
  {
    id: '3',
    date: '2026-01-28',
    time: '16:48',
    description: 'Resgate de Cupom',
    value: 0,
    pointsEarned: -10.00,
    paymentMethod: 'Créditos do Programa',
    invoiceNumber: 'CUPOM-5437',
  },
  {
    id: '4',
    date: '2026-01-25',
    time: '09:22',
    description: 'Compra Loja Norte',
    value: 156.90,
    pointsEarned: 7.85,
    paymentMethod: 'Débito',
    invoiceNumber: 'NF-2026-001087',
    products: [
      { id: 'p9', name: 'Torneira de Jardim 1/2"', quantity: 2, unitPrice: 18.90, total: 37.80 },
      { id: 'p10', name: 'Mangueira Flex 30m', quantity: 1, unitPrice: 89.90, total: 89.90 },
      { id: 'p11', name: 'Conexão PVC 20mm (pacote c/10)', quantity: 1, unitPrice: 12.20, total: 12.20 },
      { id: 'p12', name: 'Abraçadeira Inox 1/2"', quantity: 5, unitPrice: 3.40, total: 17.00 },
    ]
  },
  {
    id: '5',
    date: '2026-01-20',
    time: '13:55',
    description: 'Compra Loja Centro',
    value: 1245.00,
    pointsEarned: 62.25,
    paymentMethod: 'Cartão de Crédito',
    invoiceNumber: 'NF-2026-000923',
    products: [
      { id: 'p13', name: 'Porta de Madeira 80x210cm', quantity: 3, unitPrice: 385.00, total: 1155.00 },
      { id: 'p14', name: 'Fechadura Interna Cromada', quantity: 3, unitPrice: 28.00, total: 84.00 },
      { id: 'p15', name: 'Dobradiça 3" Cromada (par)', quantity: 3, unitPrice: 2.00, total: 6.00 },
    ]
  },
  {
    id: '6',
    date: '2026-01-15',
    time: '11:10',
    description: 'Compra Loja Araquari',
    value: 89.40,
    pointsEarned: 4.47,
    paymentMethod: 'Dinheiro',
    invoiceNumber: 'NF-2026-000801',
    products: [
      { id: 'p16', name: 'Lâmpada LED 9W Branca (pacote c/4)', quantity: 2, unitPrice: 22.90, total: 45.80 },
      { id: 'p17', name: 'Interruptor Simples', quantity: 5, unitPrice: 6.20, total: 31.00 },
      { id: 'p18', name: 'Tomada 2P+T 10A', quantity: 4, unitPrice: 3.15, total: 12.60 },
    ]
  },
];