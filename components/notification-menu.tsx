"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, RefreshCcw, X, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  isNew?: boolean
  badgeColor?: string
  type?: string
  relatedId?: string | null
  conversationUserId?: string | null
}

type NotificationMenuVariant = "admin" | "user"

type NotificationMenuProps = {
  notifications: NotificationItem[]
  align?: "start" | "center" | "end"
  userId?: string | null
  onNotificationUpdateAction?: () => void
  variant?: NotificationMenuVariant
}

export function NotificationMenu({
  notifications,
  align = "end",
  userId,
  onNotificationUpdateAction,
  variant = "user",
}: NotificationMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const newCount = useMemo(
    () => notifications.filter((notification) => notification.isNew).length,
    [notifications],
  )

  const handleMarkAllAsRead = async () => {
    if (!userId) return
    
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          markAll: true,
        }),
      })

      const data = await response.json()
      if (data.ok && onNotificationUpdateAction) {
        onNotificationUpdateAction()
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const handleDeleteAllConfirmed = async () => {
    if (!userId) return
    
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          deleteAll: true,
        }),
      })

      const data = await response.json()
      if (data.ok && onNotificationUpdateAction) {
        onNotificationUpdateAction()
      }
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Error deleting notifications:", error)
    }
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!userId) return

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          notificationIds: [notification.id],
        }),
      })

      const data = await response.json()
      if (data.ok && onNotificationUpdateAction) {
        onNotificationUpdateAction()
      }

      // After marking as read, navigate based on notification type
      if (notification.type === "message") {
        if (variant === "admin") {
          // Admin: go to chat tab for the specific user if available
          const params = new URLSearchParams()
          params.set("tab", "chat")
          if (notification.conversationUserId) {
            params.set("userId", String(notification.conversationUserId))
          }
          if (notification.relatedId) {
            params.set("messageId", String(notification.relatedId))
          }
          router.push(`/admin?${params.toString()}`)
        } else {
          // User: go to chats, optionally highlight specific message
          if (notification.relatedId) {
            router.push(`/chats?messageId=${encodeURIComponent(notification.relatedId)}`)
          } else {
            router.push("/chats")
          }
        }
      } else if (notification.type === "announcement") {
        // Announcements page is shared for admin and users
        router.push("/announcements")
      } else if (
        notification.type === "profile_approval" ||
        notification.type === "profile_rejection"
      ) {
        // User’s own profile page
        router.push("/profile")
      } else if (notification.type === "other" && notification.relatedId) {
        if (variant === "admin") {
          // Admin-specific "other" notifications, like New Profile Edit Request
          const params = new URLSearchParams()
          params.set("tab", "overview")
          params.set("requestId", String(notification.relatedId))
          router.push(`/admin?${params.toString()}`)
        } else {
          // User-side "other" notifications:
          const desc = (notification.description || "").toLowerCase()
          if (desc.includes("violation")) {
            const timestamp = Date.now()
            if (notification.relatedId) {
              router.push(
                `/records?violationId=${encodeURIComponent(
                  notification.relatedId,
                )}&t=${timestamp}`,
              )
            } else {
              router.push(`/records?t=${timestamp}`)
            }
          } else {
            router.push("/profile/edit")
          }
        }
      }

      setOpen(false)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <>
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 text-white/75 transition hover:text-white focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {newCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
              {newCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={12}
        className="max-sm:w-[280px] max-sm:max-w-[82vw] sm:w-[360px] sm:max-w-[92vw] md:w-[420px] md:max-w-[420px] overflow-hidden rounded-2xl sm:rounded-3xl border-0 bg-white p-0 text-slate-800 shadow-[0_20px_40px_rgba(4,26,68,0.18)]"
      >
        <div className="bg-[#041A44] px-3 sm:px-4 py-2.5 sm:py-3 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold">Notifications</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[40vh] sm:max-h-[50vh] md:max-h-[320px] overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                  notification.isNew ? "bg-blue-50/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className="mt-0.5 h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600"
                  style={notification.badgeColor ? { backgroundColor: notification.badgeColor, color: "#ffffff" } : undefined}
                >
                  <div className="flex h-full w-full items-center justify-center text-xs sm:text-sm font-semibold">
                    {notification.title.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <p
                      className={`text-[13px] sm:text-sm font-semibold truncate ${
                        notification.isNew ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notification.title}
                      {notification.isNew && (
                        <span className="ml-1 inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500"></span>
                      )}
                    </p>
                    <span className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">{notification.time}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] sm:text-sm leading-relaxed text-slate-600 line-clamp-2">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              if (!userId) return
              setOpen(false)
              setShowDeleteConfirm(true)
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-red-600 tracking-wide transition hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Delete All
          </button>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-[#041A44] tracking-wide transition hover:text-[#0b2c6f]"
          >
            <RefreshCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Mark all as read
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210] flex items-center justify-center px-4 py-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Delete All Notifications</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-[360px] mx-auto px-4 text-center leading-relaxed break-words whitespace-normal">
              Are you sure you want to delete all notifications? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllConfirmed}
                className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

