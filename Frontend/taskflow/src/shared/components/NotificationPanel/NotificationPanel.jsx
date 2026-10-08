import { useRef, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Play,
  Trash2,
  Tag,
  LockKeyhole,
} from "lucide-react";

import "./NotificationPanel.css";

function iconFor(type) {
  switch (type) {
    case "TASK_COMPLETED":
      return (
        <CheckCircle2
          size={15}
          className="notification-icon-completed"
        />
      );

    case "TASK_STARTED":
      return (
        <Play
          size={15}
          className="notification-icon-upcoming"
        />
      );

    case "TASK_DELETED":
      return (
        <Trash2
          size={15}
          className="notification-icon-overdue"
        />
      );

    case "TASK_DUE_TODAY":
      return (
        <Clock
          size={15}
          className="notification-icon-upcoming"
        />
      );

    case "TASK_DUE_TOMORROW":
      return (
        <Clock
          size={15}
          className="notification-icon-upcoming"
        />
      );

    case "TASK_OVERDUE":
      return (
        <AlertCircle
          size={15}
          className="notification-icon-overdue"
        />
      );

    case "CATEGORY_DELETED":
      return (
        <Tag
          size={15}
          className="notification-icon-system"
        />
      );

    case "PASSWORD_CHANGED":
      return (
        <LockKeyhole
          size={15}
          className="notification-icon-system"
        />
      );

    default:
      return (
        <Zap
          size={15}
          className="notification-icon-system"
        />
      );
  }
}

function formatNotificationTime(createdAt) {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

export default function NotificationPanel({
  notifications = [],
  unreadCount = 0,
  loading = false,
  error = "",
  onLoadNotifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  const handleNotificationClick = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await onMarkNotificationRead(notification.id);
    } catch {
      // Error is handled by the API/hook layer.
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await onMarkAllNotificationsRead();
    } catch {
      // Error is handled by the API/hook layer.
    }
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();

    try {
      await onDeleteNotification(notificationId);
    } catch {
      // Error is handled by the API/hook layer.
    }
  };

  return (
    <div
      ref={ref}
      className="notification-panel fade-in"
    >
      {/* Header */}
      <div className="notification-panel-header">
        <div className="notification-panel-title-group">
          <span className="notification-panel-title">
            Notifications
          </span>

          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="notification-close-button"
          aria-label="Close notifications"
        >
          <X size={16} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="notification-state">
          Loading notifications...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="notification-state notification-state-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => onLoadNotifications(1)}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        notifications.length === 0 && (
          <div className="notification-state">
            <Zap size={20} />

            <p>No notifications yet.</p>
          </div>
        )}

      {/* Notification list */}
      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  handleNotificationClick(notification)
                }
                className={`notification-item ${
                  !notification.is_read
                    ? "notification-item-unread"
                    : ""
                }`}
              >
                <div
                  className={`notification-type-icon ${
                    !notification.is_read
                      ? "notification-type-icon-unread"
                      : "notification-type-icon-read"
                  }`}
                >
                  {iconFor(
                    notification.notification_type
                  )}
                </div>

                <div className="notification-content">
                  <p className="notification-item-title">
                    {notification.title}
                  </p>

                  <p className="notification-item-body">
                    {notification.message}
                  </p>

                  <p className="notification-item-time">
                    {formatNotificationTime(
                      notification.created_at
                    )}
                  </p>
                </div>

                {!notification.is_read && (
                  <span className="notification-unread-dot" />
                )}

                <button
                  type="button"
                  className="notification-delete-button"
                  onClick={(event) =>
                    handleDelete(
                      event,
                      notification.id
                    )
                  }
                  aria-label="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

      {/* Footer */}
      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="notification-panel-footer">
            <button
              type="button"
              className="notification-mark-read-button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
        )}
    </div>
  );
}