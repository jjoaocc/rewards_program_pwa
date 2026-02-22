// src/hooks/useTransactions.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/api-client';
import type { Transaction, Product } from '../types';

interface TransactionItemApiResponse {
  id: string;
  name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface TransactionApiResponse {
  id: string;
  customer_id: string;
  type: 'credit' | 'debit';
  amount: string;
  description: string;
  store?: string;
  created_at: string;
  items: TransactionItemApiResponse[];
}

function mapTransaction(data: TransactionApiResponse): Transaction {
  const date = new Date(data.created_at);

  const localDate = date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [day, month, year] = localDate.split('/');

  const localTime = date.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });

  const amount = parseFloat(data.amount);
  const pointsEarned = data.type === 'debit' ? -amount : amount;

  const products: Product[] = data.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price),
    total: parseFloat(item.total_price),
  }));

  return {
    id: data.id,
    date: `${year}-${month}-${day}`,
    time: localTime,
    description: data.description,
    value: amount,
    pointsEarned,
    paymentMethod: data.store,
    products: products.length > 0 ? products : undefined,
  };
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<TransactionApiResponse[]>('/transactions');
      setTransactions(data.map(mapTransaction));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar histórico.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refetch: fetchTransactions };
}