import { useRef, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react'

import './NotificationPanel.css'

const SAMPLE = [
  {
    id: 'n1',
    type: 'completed',
    read: false,
    title: 'Task completed',
    body: '"Morning run — 5km" was marked as done.',
    time: '2 min ago',
  },
  {
    id: 'n2',
    type: 'overdue',
    read: false,
    title: 'Task overdue',
    body: '"Fix auth bug in API gateway" is 2 days overdue.',
    time: '1 hr ago',
  },
  {
    id: 'n3',
    type: 'upcoming',
    read: true,
    title: 'Due tomorrow',
    body: '"Write Q3 performance review" is due Sep 4.',
    time: '3 hr ago',
  },
  {
    id: 'n4',
    type: 'system',
    read: true,
    title: 'Weekly summary ready',
    body: 'You completed 28 tasks this week. Great work! 🎉',
    time: 'Yesterday',
  },
]

function iconFor(type) {
  if (type === 'completed') {
    return <CheckCircle2 size={15} className="notification-icon-completed" />
  }

  if (type === 'overdue') {
    return <AlertCircle size={15} className="notification-icon-overdue" />
  }

  if (type === 'upcoming') {
    return <Clock size={15} className="notification-icon-upcoming" />
  }

  return <Zap size={15} className="notification-icon-system" />
}

export default function NotificationPanel({ onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handler)

    return () => {
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  const unread = SAMPLE.filter((notification) => !notification.read).length

  return (
    <div ref={ref} className="notification-panel fade-in">
      {/* Header */}
      <div className="notification-panel-header">
        <div className="notification-panel-title-group">
          <span className="notification-panel-title">
            Notifications
          </span>

          {unread > 0 && (
            <span className="notification-count">
              {unread}
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

      {/* List */}
      <div className="notification-list">
        {SAMPLE.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${
              !notification.read ? 'notification-item-unread' : ''
            }`}
          >
            <div
              className={`notification-type-icon ${
                !notification.read
                  ? 'notification-type-icon-unread'
                  : 'notification-type-icon-read'
              }`}
            >
              {iconFor(notification.type)}
            </div>

            <div className="notification-content">
              <p className="notification-item-title">
                {notification.title}
              </p>

              <p className="notification-item-body">
                {notification.body}
              </p>

              <p className="notification-item-time">
                {notification.time}
              </p>
            </div>

            {!notification.read && (
              <span className="notification-unread-dot" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="notification-panel-footer">
        <button
          type="button"
          className="notification-mark-read-button"
        >
          Mark all as read
        </button>
      </div>
    </div>
  )
}