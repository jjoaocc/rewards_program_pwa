import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { apiClient, type ApiClientPort } from '../lib/api-client';
import { getErrorMessage } from '../lib/api-error';

interface Stats {
  totalEarned: number;
  totalRedeemed: number;
  transactionCount: number;
  memberSince: string;
}

export const StatsApiResponseSchema = z.object({
  total_earned: z.string(),
  total_redeemed: z.string(),
  transaction_count: z.number(),
  member_since: z.string(),
});

interface UseStatsReturn {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
}

export function useStats(client: ApiClientPort = apiClient): UseStatsReturn {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const raw = await client.get<unknown>('/customers/me/stats');
      const data = StatsApiResponseSchema.parse(raw);
      setStats({
        totalEarned: parseFloat(data.total_earned),
        totalRedeemed: parseFloat(data.total_redeemed),
        transactionCount: data.transaction_count,
        memberSince: data.member_since,
      });
    } catch (err) {
      const message = getErrorMessage(err, 'Erro ao carregar estatísticas.');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error };
}
