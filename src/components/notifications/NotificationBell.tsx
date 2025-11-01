/**
 * Notification Bell Component
 * Displays notification icon with unread count badge
 */

import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export function NotificationBell({
  onClick,
  className = "",
}: NotificationBellProps) {
  const { unreadCount, isConnected } = useNotifications();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label="Notifications"
      title={
        isConnected
          ? "Notifications (Connected)"
          : "Notifications (Disconnected)"
      }
    >
      <Bell
        className={`w-6 h-6 ${
          isConnected ? "text-gray-700 dark:text-gray-300" : "text-gray-400"
        }`}
      />

      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {!isConnected && (
        <span
          className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"
          title="Disconnected"
        />
      )}
    </button>
  );
}
