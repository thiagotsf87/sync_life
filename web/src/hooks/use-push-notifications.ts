'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  loading: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

function getVapidPublicKey(): string | null {
  return typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null)
    : null
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)
    if (supported) {
      setPermission(Notification.permission)
      // Check if already subscribed
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub)
        })
      })
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!isSupported) return
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const vapidKey = getVapidPublicKey()
      if (!vapidKey) {
        console.warn('[Push] VAPID public key not configured')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const subJSON = subscription.toJSON()
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: subJSON.endpoint,
            keys: {
              p256dh: subJSON.keys?.p256dh ?? '',
              auth: subJSON.keys?.auth ?? '',
            },
          },
        }),
      })

      if (res.ok) {
        setIsSubscribed(true)
      }
    } catch (err) {
      console.error('[Push] Subscribe error:', err)
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err)
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  return { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe }
}
