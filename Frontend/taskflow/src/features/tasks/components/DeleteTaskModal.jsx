import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'

export default function DeleteTaskModal({
  onConfirm,
  onClose,
}) {
  return createPortal(
    <div className="my-tasks-modal">
      <div
        className="my-tasks-modal-overlay"
        onClick={onClose}
      />

      <div className="my-tasks-delete-modal">
        <div className="my-tasks-delete-icon">
          <Trash2 size={22} />
        </div>

        <h3>Delete this task?</h3>

        <p>This action cannot be undone.</p>

        <div className="my-tasks-delete-actions">
          <button
            type="button"
            onClick={onConfirm}
            className="my-tasks-delete-confirm"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            className="my-tasks-delete-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}