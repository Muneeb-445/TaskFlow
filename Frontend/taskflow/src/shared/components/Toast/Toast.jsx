import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react'

import './Toast.css'

const config = {
  success: {
    icon: CheckCircle,
    bar: 'toast-bar-success',
    text: 'toast-icon-success',
  },
  error: {
    icon: XCircle,
    bar: 'toast-bar-error',
    text: 'toast-icon-error',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'toast-bar-warning',
    text: 'toast-icon-warning',
  },
  info: {
    icon: Info,
    bar: 'toast-bar-info',
    text: 'toast-icon-info',
  },
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const c = config[toast.type]

        if (!c) return null

        const Icon = c.icon

        return (
          <div key={toast.id} className="toast slide-up">
            <div className={`toast-bar ${c.bar}`} />

            <Icon
              size={16}
              className={`toast-icon ${c.text}`}
            />

            <span className="toast-message">
              {toast.message}
            </span>

            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="toast-close"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}