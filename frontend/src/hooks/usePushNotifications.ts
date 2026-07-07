import { useState, useEffect, useCallback } from 'react'
import { apiClient, type ApiClientPort } from '../lib/api-client'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const arr = new Uint8Array(rawData.length)  // ← ArrayBuffer garantido
  for (let i = 0; i < rawData.length; i++) {
    arr[i] = rawData.charCodeAt(i)
  }
  return arr
}

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

interface UsePushNotificationsReturn {
  permissionState: PermissionState
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

export function usePushNotifications(client: ApiClientPort = apiClient): UsePushNotificationsReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
      setPermissionState('unsupported')
      setIsLoading(false)
      return
    }

    setPermissionState(Notification.permission as PermissionState)

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
        setIsLoading(false)
      })
    })
  }, [])

  const subscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setPermissionState(permission as PermissionState)
      if (permission !== 'granted') return

      const { public_key } = await client.get<{ public_key: string }>('/push/vapid-public-key')

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      })

      const json = sub.toJSON()
      await client.post('/push/subscribe', {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        user_agent: navigator.userAgent,
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('[usePushNotifications] Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }, [client])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()

      await client.delete('/push/unsubscribe')
      setIsSubscribed(false)
    } catch (err) {
      console.error('[usePushNotifications] Erro ao desativar:', err)
    } finally {
      setIsLoading(false)
    }
  }, [client])

  return { permissionState, isSubscribed, isLoading, subscribe, unsubscribe }
}