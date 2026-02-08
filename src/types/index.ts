export type ActivePage = 'inicio' | 'extrato' | 'perfil';

export interface Customer {
  id: string;          // Código do cliente (ex: "CLI001")
  name: string;
  email: string;
  phone: string;
  balance: number;     // Pontuação (Saldo em R$)
  identificationToken: string; // Token para gerar o QR Code
  lastUpdated: string; // Data da última atualização (ISO string)
  active: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  value: number;       // Valor da compra
  pointsEarned: number; // Recompensa gerada em R$
}