// src/hooks/useEvents.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/api-client';
import type { Campaign, Promotion } from '../types';

interface EventApiResponse {
  id: string;
  title: string;
  description: string;
  discount: string;
  start_date: string;
  end_date: string;
  image_url?: string;
  active: boolean;
  created_at: string;
}

// Paleta de cores para o carrossel (rotativa por índice)
const HIGHLIGHT_COLORS = [
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

function mapToCampaign(data: EventApiResponse, index: number): Campaign {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url ?? '',
    startDate: data.start_date,
    endDate: data.end_date,
    highlightColor: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
  };
}

function mapToPromotion(data: EventApiResponse): Promotion {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    discount: parseFloat(data.discount),
    category: 'Promoção',
    validUntil: data.end_date,
  };
}

interface UseEventsReturn {
  campaigns: Campaign[];
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
}

export function useEvents(): UseEventsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await apiClient.get<EventApiResponse[]>('/events');
      setCampaigns(data.map(mapToCampaign));
      setPromotions(data.map(mapToPromotion));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar eventos.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { campaigns, promotions, isLoading, error };
}