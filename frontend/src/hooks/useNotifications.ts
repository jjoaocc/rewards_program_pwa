// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { apiClient, type ApiClientPort } from '../lib/api-client';
import { getErrorMessage } from '../lib/api-error';
import type { Notification } from '../types';

export const NotificationApiResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['promotion', 'reward', 'system']),
  read: z.boolean(),
  image_url: z.string().nullish(),
  action_url: z.string().nullish(),
  created_at: z.string(),
});

type NotificationApiResponse = z.infer<typeof NotificationApiResponseSchema>;

function mapNotification(data: NotificationApiResponse): Notification {
  return {
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type,
    read: data.read,
    timestamp: data.created_at,
    imageUrl: data.image_url ?? undefined,
    actionUrl: data.action_url ?? undefined,
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

export function useNotifications(client: ApiClientPort = apiClient): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setError(null);
    try {
      const raw = await client.get<unknown>('/notifications');
      const data = z.array(NotificationApiResponseSchema).parse(raw);
      setNotifications(data.map(mapNotification));
    } catch (err) {
      // Antes só logava erros ApiError — um erro de validação do zod (schema
      // divergente da API) ficava completamente silencioso, sem log e sem estado
      // de erro visível, ao contrário dos demais hooks de dados.
      const message = getErrorMessage(err, 'Erro ao carregar notificações.');
      setError(message);
      console.error('[useNotifications]', err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Otimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await client.patch('/notifications/mark-read', { notification_ids: [id] });
    } catch {
      // Reverte em caso de erro
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  }, [client]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await client.patch('/notifications/mark-all-read', {});
    } catch {
      // Recarrega do servidor em caso de erro
      fetchNotifications();
    }
  }, [client, fetchNotifications]);

  const dismiss = useCallback(async (id: string) => {
    // Otimistic update — remove da tela antes da resposta do backend
    const removed = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await client.delete(`/notifications/${id}`);
    } catch {
      // Restaura em caso de erro (ex: já tinha sido removida em outra sessão)
      if (removed) {
        setNotifications(prev => [...prev, removed].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)));
      }
    }
  }, [client, notifications]);

  return { notifications, isLoading, error, markAsRead, markAllAsRead, dismiss };
}