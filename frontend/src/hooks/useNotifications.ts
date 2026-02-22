// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/api-client';
import type { Notification } from '../types';

interface NotificationApiResponse {
  id: string;
  title: string;
  message: string;
  type: 'promotion' | 'reward' | 'system';
  read: boolean;
  image_url?: string;
  action_url?: string;
  created_at: string;
}

function mapNotification(data: NotificationApiResponse): Notification {
  return {
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type,
    read: data.read,
    timestamp: data.created_at,
    imageUrl: data.image_url,
    actionUrl: data.action_url,
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: string) => void; // local-only, sem endpoint de delete
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiClient.get<NotificationApiResponse[]>('/notifications');
      setNotifications(data.map(mapNotification));
    } catch (err) {
      if (err instanceof ApiError) console.error('[useNotifications]', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Otimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await apiClient.patch('/notifications/mark-read', { notification_ids: [id] });
    } catch {
      // Reverte em caso de erro
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiClient.patch('/notifications/mark-all-read', {});
    } catch {
      // Recarrega do servidor em caso de erro
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, isLoading, markAsRead, markAllAsRead, dismiss };
}