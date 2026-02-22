/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Workbox injeta o manifesto de precache aqui — equivalente ao generateSW anterior
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Handler de push ────────────────────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  let payload: { title: string; body: string; icon?: string; data?: { url?: string } }

  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Rewards', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: payload.data ?? {},
    })
  )
})

// ── Clique na notificação ──────────────────────────────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string })?.url ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      })
  )
})  