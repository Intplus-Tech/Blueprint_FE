/**
 * Notification system for Blueprintdoc
 * Manages application-wide notifications with filtering and categorization
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'subscription' | 'document' | 'invoice' | 'cosign' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  timestamp: number
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export interface NotificationFilter {
  categories?: NotificationCategory[]
  types?: NotificationType[]
  read?: boolean
}

export class NotificationManager {
  private notifications: Notification[] = []
  private listeners: Set<(notifications: Notification[]) => void> = new Set()
  private idCounter = 0

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.notifications]))
  }

  add(
    type: NotificationType,
    category: NotificationCategory,
    title: string,
    message: string,
    action?: { label: string; onClick: () => void },
  ): Notification {
    const notification: Notification = {
      id: `notif-${++this.idCounter}-${Date.now()}`,
      type,
      category,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      action,
    }
    this.notifications.unshift(notification)
    this.notify()

    // Auto-remove non-error notifications after 5 seconds
    if (type !== 'error') {
      setTimeout(() => this.remove(notification.id), 5000)
    }

    return notification
  }

  markAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id)
    if (notif) {
      notif.read = true
      this.notify()
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
    this.notify()
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notify()
  }

  clear() {
    this.notifications = []
    this.notify()
  }

  filter(filter: NotificationFilter): Notification[] {
    return this.notifications.filter((n) => {
      if (filter.categories && !filter.categories.includes(n.category)) return false
      if (filter.types && !filter.types.includes(n.type)) return false
      if (filter.read !== undefined && n.read !== filter.read) return false
      return true
    })
  }

  getAll(): Notification[] {
    return [...this.notifications]
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }
}

// Global singleton instance
let globalManager: NotificationManager | null = null

export function getNotificationManager(): NotificationManager {
  if (!globalManager) {
    globalManager = new NotificationManager()
  }
  return globalManager
}

// Preset convenience functions
export const createNotification = {
  subscription: (title: string, message: string, action?: Notification['action']) =>
    getNotificationManager().add('info', 'subscription', title, message, action),
  document: (title: string, message: string, type: NotificationType = 'info', action?: Notification['action']) =>
    getNotificationManager().add(type, 'document', title, message, action),
  invoice: (title: string, message: string, type: NotificationType = 'info', action?: Notification['action']) =>
    getNotificationManager().add(type, 'invoice', title, message, action),
  cosign: (title: string, message: string, type: NotificationType = 'info', action?: Notification['action']) =>
    getNotificationManager().add(type, 'cosign', title, message, action),
  system: (title: string, message: string, type: NotificationType = 'error', action?: Notification['action']) =>
    getNotificationManager().add(type, 'system', title, message, action),
}
