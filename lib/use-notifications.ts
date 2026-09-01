'use client'

import { useEffect, useState } from 'react'
import { getNotificationManager, type Notification, type NotificationFilter } from '@/lib/notifications'

/**
 * React hook for consuming notifications
 * Can be used anywhere in the component tree
 */
export function useNotifications(filter?: NotificationFilter) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const manager = getNotificationManager()

  useEffect(() => {
    // Set initial state
    const initial = filter ? manager.filter(filter) : manager.getAll()
    setNotifications(initial)

    // Subscribe to updates
    const unsubscribe = manager.subscribe((all) => {
      const filtered = filter ? manager.filter(filter) : all
      setNotifications(filtered)
    })

    return unsubscribe
  }, [filter])

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead: (id: string) => manager.markAsRead(id),
    markAllAsRead: () => manager.markAllAsRead(),
    remove: (id: string) => manager.remove(id),
    clear: () => manager.clear(),
  }
}
