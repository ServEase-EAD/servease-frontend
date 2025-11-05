/**
 * Notification Item Component
 * Displays a single notification
 */

import type { Notification } from "../../types/notification";
import { formatDistanceToNow } from "date-fns";
import { X, Bell, Calendar, Car, Info } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const isUnread = !notification.read_at;

  const getIcon = () => {
    switch (notification.type) {
      case "APPOINTMENT":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "VEHICLE":
        return <Car className="w-5 h-5 text-green-500" />;
      case "SYSTEM":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "APPOINTMENT":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "VEHICLE":
        return "bg-green-50 dark:bg-green-900/20";
      case "SYSTEM":
        return "bg-purple-50 dark:bg-purple-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-800";
    }
  };

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`relative p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
        isUnread ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
      }`}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor()}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${
              isUnread ? "font-semibold" : "font-normal"
            } text-gray-900 dark:text-gray-100`}
          >
            {notification.message}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete notification"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
