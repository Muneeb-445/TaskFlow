import { useCallback, useState } from 'react'

export default function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id,
        type,
        message,
      },
    ])

    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      )
    }, 3500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
  }
}