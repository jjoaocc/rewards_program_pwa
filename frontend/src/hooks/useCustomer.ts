import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { apiClient, type ApiClientPort } from '../lib/api-client';
import { getErrorMessage } from '../lib/api-error';
import type { Customer } from '../types';

// Campos opcionais do backend (Optional[X] = None em Pydantic) chegam como `null`
// explícito no JSON, não omitidos — por isso `.nullish()` (aceita null e undefined),
// nunca só `.optional()` (que rejeitaria um `null` de verdade).
export const CustomerApiResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  secondary_email: z.string().nullish(),
  phone: z.string().nullish(),
  mobile: z.string().nullish(),
  document: z.string(),
  document_type: z.enum(['cpf', 'cnpj']),
  birth_date: z.string().nullish(),
  balance: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  address: z
    .object({
      cep: z.string(),
      street: z.string(),
      number: z.string(),
      complement: z.string().nullish(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
    })
    .nullish(),
});

type CustomerApiResponse = z.infer<typeof CustomerApiResponseSchema>;

export function mapCustomer(data: CustomerApiResponse): Customer {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    secondaryEmail: data.secondary_email ?? undefined,
    phone: data.phone ?? '',
    secondaryPhone: data.mobile ?? undefined,
    document: data.document,
    documentType: data.document_type,
    birthDate: data.birth_date ?? undefined,
    balance: parseFloat(data.balance),
    active: data.is_active,
    // O backend não tem conceito de "atualizado em" pro cliente — usa a data de
    // criação como fallback (campo não é exibido em nenhuma tela hoje).
    lastUpdated: data.created_at,
    address: data.address
      ? { ...data.address, complement: data.address.complement ?? undefined }
      : {
          cep: '',
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
        },
    stats: {
      totalEarned: 0,
      totalRedeemed: 0,
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

export function useCustomer(client: ApiClientPort = apiClient): UseCustomerReturn {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await client.get<unknown>('/customers/me');
      const data = CustomerApiResponseSchema.parse(raw);
      setCustomer(mapCustomer(data));
    } catch (err) {
      const message = getErrorMessage(err, 'Erro ao carregar dados do perfil.');
      setError(message);
      console.error('[useCustomer]', err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { customer, isLoading, error, refetch: fetchCustomer };
}