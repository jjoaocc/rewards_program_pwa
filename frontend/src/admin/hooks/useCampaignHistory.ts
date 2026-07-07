import { useCallback, useState } from 'react';
import { z } from 'zod';
import { adminApiClient, type AdminApiClientPort } from '../lib/admin-api-client';

export const PushCampaignSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  url: z.string().nullish(),
  target_type: z.enum(['individual', 'selected', 'broadcast']),
  customers_targeted: z.number(),
  sent: z.number(),
  failed: z.number(),
  removed: z.number(),
  created_at: z.string(),
});

export type PushCampaign = z.infer<typeof PushCampaignSchema>;

interface UseCampaignHistoryReturn {
  campaigns: PushCampaign[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useCampaignHistory(
  token: string | null,
  client: AdminApiClientPort = adminApiClient,
): UseCampaignHistoryReturn {
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const raw = await client.get<unknown>('/push/admin/campaigns?limit=20', token);
      setCampaigns(z.array(PushCampaignSchema).parse(raw));
    } catch {
      // mantém a lista anterior em vez de esvaziar a tela por uma falha pontual
    } finally {
      setIsLoading(false);
    }
  }, [token, client]);

  return { campaigns, isLoading, refetch };
}
