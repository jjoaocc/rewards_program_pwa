// src/hooks/useTransactions.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import { apiClient, type ApiClientPort } from '../lib/api-client';
import { getErrorMessage } from '../lib/api-error';
import type { Transaction, Product } from '../types';

const TransactionItemApiResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit_price: z.string(),
  total_price: z.string(),
});

export const TransactionApiResponseSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  type: z.enum(['credit', 'debit']),
  amount: z.string(),
  description: z.string(),
  store: z.string().nullish(),
  created_at: z.string(),
  items: z.array(TransactionItemApiResponseSchema),
});

type TransactionApiResponse = z.infer<typeof TransactionApiResponseSchema>;

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
    paymentMethod: data.store ?? undefined,
    products: products.length > 0 ? products : undefined,
  };
}

const PAGE_SIZE = 20;

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useTransactions(client: ApiClientPort = apiClient): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const nextOffset = useRef(0);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      const raw = await client.get<unknown>(`/transactions?limit=${PAGE_SIZE}&offset=${offset}`);
      const data = z.array(TransactionApiResponseSchema).parse(raw);
      const mapped = data.map(mapTransaction);
      setTransactions((prev) => (append ? [...prev, ...mapped] : mapped));
      setHasMore(data.length === PAGE_SIZE);
      nextOffset.current = offset + data.length;
    },
    [client],
  );

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchPage(0, false);
    } catch (err) {
      const message = getErrorMessage(err, 'Erro ao carregar histórico.');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      await fetchPage(nextOffset.current, true);
    } catch (err) {
      const message = getErrorMessage(err, 'Erro ao carregar mais transações.');
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, hasMore, isLoadingMore]);

  return { transactions, isLoading, isLoadingMore, error, hasMore, loadMore, refetch: fetchTransactions };
}