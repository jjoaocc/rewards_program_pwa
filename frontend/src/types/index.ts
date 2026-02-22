export type ActivePage = 'inicio' | 'extrato' | 'eventos' | 'perfil' | 'ajuda' | 'termos' | 'privacidade';

export interface Customer {
  // Identificação
  id: string;
  name: string;
  documentType: 'cpf' | 'cnpj';
  document: string; // CPF ou CNPJ (não editável)
  
  // Contatos principais
  email: string;
  phone: string;
  
  // Contatos secundários (opcionais)
  secondaryEmail?: string;
  secondaryPhone?: string;
  
  // Datas
  birthDate?: string; // Para CPF (formato ISO)
  companyFoundedDate?: string; // Para CNPJ (formato ISO)
  
  // Endereço
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string; // UF
  };
  
  // Programa de fidelidade
  balance: number;
  identificationToken: string;
  lastUpdated: string;
  active: boolean;
  
  // Estatísticas (novo)
  stats: {
    totalEarned: number;      // Total acumulado desde sempre
    totalRedeemed: number;    // Total já resgatado
    totalSaved: number;       // Economia gerada
    memberSince: string;      // Data de cadastro (ISO)
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
  highlightColor: string; // hex color
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number; // Porcentagem de desconto
  category: string; // Ex: "Tintas", "Cimento", "Ferramentas"
  validUntil: string;
  terms?: string;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'promotion' | 'reward' | 'system'; // Tipos de notificação
  timestamp: string; // ISO 8601
  read: boolean;
  imageUrl?: string; // Opcional: imagem da promoção
  actionUrl?: string; // Opcional: link para ação
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  identifier: string; // E-mail ou código
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