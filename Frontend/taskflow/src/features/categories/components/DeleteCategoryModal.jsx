import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'

export default function DeleteCategoryModal({
  category,
  taskCount,
  onConfirm,
  onClose,
}) {
  return createPortal(
    <div className="category-modal-overlay">
      <div
        className="category-modal-backdrop"
        onClick={onClose}
      />

      <div className="category-delete-modal fade-in">
        <div className="category-delete-icon">
          <Trash2 size={22} />
        </div>

        <h3 className="category-delete-title">
          Delete "{category.name}"?
        </h3>

        <p className="category-delete-message">
          {taskCount > 0
            ? `${taskCount} task${
                taskCount > 1 ? 's' : ''
              } will become "Uncategorized." They won't be deleted.`
            : 'This category has no tasks. It will be permanently removed.'}
        </p>

        <div className="category-delete-actions">
          <button
            type="button"
            onClick={onConfirm}
            className="category-delete-button"
          >
            Delete Category
          </button>

          <button
            type="button"
            onClick={onClose}
            className="category-cancel-button category-delete-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}