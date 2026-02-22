// src/hooks/useCustomer.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/api-client';
import type { Customer } from '../types';

// Formato que o backend retorna em GET /customers/me
interface CustomerApiResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  secondary_email?: string;
  secondary_phone?: string;
  document: string;
  document_type: 'cpf' | 'cnpj';
  birth_date?: string;
  company_founded_date?: string;
  balance: string;
  identification_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  stats?: {
    total_earned: number;
    total_redeemed: number;
    total_saved: number;
    member_since: string;
  };
}

// Converte snake_case do backend para camelCase do frontend
function mapCustomer(data: CustomerApiResponse): Customer {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    secondaryEmail: data.secondary_email,
    secondaryPhone: data.secondary_phone,
    document: data.document,
    documentType: data.document_type,
    birthDate: data.birth_date,
    companyFoundedDate: data.company_founded_date,
    balance: parseFloat(data.balance), 
    identificationToken: data.id,
    active: data.is_active,
    lastUpdated: data.updated_at,
    address: data.address ?? {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
    },
    stats: data.stats
      ? {
          totalEarned: data.stats.total_earned,
          totalRedeemed: data.stats.total_redeemed,
          totalSaved: data.stats.total_saved,
          memberSince: data.stats.member_since,
        }
      : {
          totalEarned: 0,
          totalRedeemed: 0,
          totalSaved: 0,
          memberSince: data.created_at,
        },
  };
}

interface UseCustomerReturn {
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCustomer(): UseCustomerReturn {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<CustomerApiResponse>('/customers/me');
      setCustomer(mapCustomer(data));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar dados do perfil.';
      setError(message);
      console.error('[useCustomer]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { customer, isLoading, error, refetch: fetchCustomer };
}