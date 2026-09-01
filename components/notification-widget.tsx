'use client'

import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle, AlertCircle, InfoIcon, XCircle } from 'lucide-react'
import { useNotifications } from '@/lib/use-notifications'
import type { Notification } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export interface NotificationWidgetProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxVisible?: number
}

const typeIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: InfoIcon,
}

const typeColors = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

const typeIconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

export function NotificationWidget({ position = 'top-right', maxVisible = 3 }: NotificationWidgetProps) {
  const { notifications, remove } = useNotifications()
  const visibleNotifications = notifications.slice(0, maxVisible)

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div className={cn('pointer-events-none fixed z-50 flex flex-col gap-2', positionClasses[position])}>
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => remove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onClose: () => void
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const Icon = typeIcons[notification.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-auto"
    >
      <div
        className={cn(
          'flex w-80 max-w-full gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
          typeColors[notification.type],
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', typeIconColors[notification.type])} />

        <div className="flex flex-1 flex-col gap-1">
          <p className="font-semibold text-sm leading-tight">{notification.title}</p>
          <p className="text-xs opacity-90 leading-snug">{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-1 text-xs font-medium underline opacity-75 hover:opacity-100 transition-opacity text-inherit"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/5"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
