// src/hooks/useStats.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/api-client';

interface Stats {
  totalEarned: number;
  totalRedeemed: number;
  totalSaved: number;  // adiciona este campo
  transactionCount: number;
  memberSince: string;
}

interface StatsApiResponse {
  total_earned: string;
  total_redeemed: string;
  transaction_count: number;
  member_since: string;
}

interface UseStatsReturn {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiClient.get<StatsApiResponse>('/customers/me/stats');
      setStats({
        totalEarned: parseFloat(data.total_earned),
        totalRedeemed: parseFloat(data.total_redeemed),
        totalSaved: parseFloat(data.total_earned), // mesmo valor que totalEarned
        transactionCount: data.transaction_count,
        memberSince: data.member_since,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar estatísticas.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error };
}