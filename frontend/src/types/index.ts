export type ActivePage = 'inicio' | 'extrato' | 'eventos' | 'perfil' | 'ajuda' | 'termos' | 'privacidade';

export interface Customer {
  // Identificação
  id: string;
  name: string;
  documentType: 'cpf' | 'cnpj';
  document: string;

  // Contatos principais
  email: string;
  phone: string;

  // Contatos secundários (opcionais — não persistidos no backend atual)
  secondaryEmail?: string;
  secondaryPhone?: string;

  // Datas
  birthDate?: string;         // Para CPF (ISO)
  companyFoundedDate?: string; // Para CNPJ (ISO)

  // Endereço
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };

  // Programa de fidelidade
  balance: number;
  lastUpdated: string;
  active: boolean;

  // Estatísticas
  stats: {
    totalEarned: number;   // Total acumulado desde sempre
    totalRedeemed: number; // Total já resgatado
    memberSince: string;   // Data de cadastro (ISO)
  };
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  value: number;
  pointsEarned: number;
  time?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  products?: Product[];
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  highlightColor: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  category: string;
  validUntil: string;
  terms?: string;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'promotion' | 'reward' | 'system';
  timestamp: string;
  read: boolean;
  imageUrl?: string;
  actionUrl?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export type OperationType = 'all' | 'credit' | 'debit';

export interface TransactionFilters {
  startDate: string;
  endDate: string;
  store: string;
  minValue: string;
  maxValue: string;
  operationType: OperationType;
}

export const initialTransactionFilters: TransactionFilters = {
  startDate: '',
  endDate: '',
  store: '',
  minValue: '',
  maxValue: '',
  operationType: 'all',
};