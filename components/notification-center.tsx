'use client'

import { useId, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, AlertCircle, InfoIcon, XCircle, X, Filter, Trash2, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/lib/use-notifications'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { NotificationCategory, NotificationType } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export interface NotificationCenterProps {
  isOpen?: boolean
  onClose?: () => void
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

const categoryLabels: Record<NotificationCategory, string> = {
  subscription: '💳 Subscription',
  document: '📄 Documents',
  invoice: '📋 Invoices',
  cosign: '✍️ Co-signing',
  system: '⚙️ System',
}

/**
 * Full notification center panel with filtering and management
 */
export function NotificationCenter({ isOpen = true, onClose }: NotificationCenterProps) {
  const filterId = useId()
  const { notifications, unreadCount, markAsRead, markAllAsRead, remove, clear } = useNotifications()
  const [selectedCategories, setSelectedCategories] = useState<NotificationCategory[]>([])
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(n.category)) return false
    if (showUnreadOnly && n.read) return false
    return true
  })

  const handleCategoryToggle = (category: NotificationCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      }
      return [...prev, category]
    })
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-auto fixed right-0 top-0 bottom-0 z-40 w-96 max-w-[100vw] border-l border-border bg-card flex flex-col shadow-lg"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-card-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{unreadCount} unread</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="shrink-0 border-b border-border p-4 space-y-3">
        {/* Actions */}
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              onClick={clear}
              size="sm"
              variant="ghost"
              className="text-xs text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filter by category
          </div>
          <div className="space-y-2">
            {(Object.keys(categoryLabels) as NotificationCategory[]).map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`${filterId}-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label htmlFor={`${filterId}-${category}`} className="text-sm cursor-pointer">
                  {categoryLabels[category]}
                </Label>
              </div>
            ))}
          </div>

          {/* Unread only toggle */}
          <div className="pt-2 flex items-center gap-2">
            <Checkbox
              id={`${filterId}-unread-only`}
              checked={showUnreadOnly}
              onCheckedChange={(v) => setShowUnreadOnly(v === true)}
            />
            <Label htmlFor={`${filterId}-unread-only`} className="text-sm cursor-pointer">
              Unread only
            </Label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
            <InfoIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {notifications.length === 0
                ? 'No notifications yet'
                : 'No notifications matching your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => (
                <NotificationItemFull
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onRemove={() => remove(notification.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface NotificationItemFullProps {
  notification: ReturnType<typeof useNotifications>['notifications'][0]
  onMarkAsRead: () => void
  onRemove: () => void
}

function NotificationItemFull({ notification, onMarkAsRead, onRemove }: NotificationItemFullProps) {
  const Icon = typeIcons[notification.type]
  const timeAgo = getTimeAgo(notification.timestamp)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'p-4 transition-colors cursor-pointer',
        !notification.read && 'bg-muted/50 hover:bg-muted',
        notification.read && 'hover:bg-muted/25',
      )}
      onClick={onMarkAsRead}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', typeColors[notification.type].split(' ')[0])} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm line-clamp-2">{notification.title}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
          {notification.action && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                notification.action?.onClick()
              }}
              className="mt-2 text-xs font-medium text-brand underline hover:opacity-75 transition-opacity"
            >
              {notification.action.label}
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
        </div>

        {!notification.read && (
          <div className="shrink-0 w-2 h-2 bg-brand rounded-full mt-1.5" />
        )}
      </div>
    </motion.div>
  )
}

/**
 * Format timestamp as relative time
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
