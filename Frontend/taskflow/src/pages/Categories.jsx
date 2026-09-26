import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  X,
  Check,
} from 'lucide-react'

import './Categories.css'

const COLORS = [
  '#7C3AED',
  '#F97316',
  '#0D9488',
  '#FFB800',
  '#3B82F6',
  '#EC4899',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
]

function CategoryModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [err, setErr] = useState('')

  return createPortal(
    <div className="category-modal-overlay">
      <div
        className="category-modal-backdrop"
        onClick={onClose}
      />

      <div className="category-modal fade-in">
        <div className="category-modal-header">
          <h3 className="category-modal-title">
            {initial ? 'Edit Category' : 'New Category'}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="category-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="category-modal-fields">
          <div>
            <label className="category-form-label">
              Name
            </label>

            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (err) setErr('')
              }}
              placeholder="e.g. Marketing"
              className={`category-name-input ${
                err ? 'category-input-error' : ''
              }`}
            />

            {err && (
              <p className="category-form-error">
                {err}
              </p>
            )}
          </div>

          <div>
            <label className="category-form-label">
              Color
            </label>

            <div className="category-color-list">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className="category-color-button"
                  style={{ backgroundColor: colorOption }}
                  aria-label={`Select ${colorOption}`}
                >
                  {color === colorOption && (
                    <Check
                      size={14}
                      color="#ffffff"
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="category-preview">
            <span
              className="category-preview-dot"
              style={{ backgroundColor: color }}
            />

            <span
              className="category-preview-name"
              style={{ color }}
            >
              {name || 'Category preview'}
            </span>
          </div>
        </div>

        <div className="category-modal-actions">
          <button
            type="button"
            onClick={() => {
              if (!name.trim()) {
                setErr('Name is required.')
                return
              }

              onSave(name.trim(), color)
            }}
            className="category-save-button"
          >
            {initial ? 'Save Changes' : 'Create Category'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="category-cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function DeleteConfirm({
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
export default function Categories({
  categories,
  onCreate,
  onEdit,
  onDelete,
}) {
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  return (
    <div className="categories-page fade-in">
      <div className="categories-header">
        <div>
          <h1 className="categories-title">
            Categories
          </h1>

          <p className="categories-count">
            {categories.length} categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal('create')}
          className="categories-create-button"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="categories-empty">
          <Tag
            size={40}
            className="categories-empty-icon"
          />

          <p className="categories-empty-title">
            No categories yet
          </p>

          <p className="categories-empty-message">
            Create categories to organize your tasks.
          </p>

          <button
            type="button"
            onClick={() => setModal('create')}
            className="categories-create-button"
          >
            <Plus size={16} />
            Create Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
  {categories.map((category) => {
    return (
      <div
        key={category.id}
        className="category-card"
      >
        {/* Color accent bar */}
        <div
          className="category-accent"
          style={{
            backgroundColor: category.color,
          }}
        />

        <div className="category-card-content">
          <div className="category-card-header">
            <div className="category-card-info">
              <div
                className="category-card-icon"
                style={{
                  backgroundColor: `${category.color}20`,
                }}
              >
                <Tag
                  size={16}
                  style={{
                    color: category.color,
                  }}
                />
              </div>

              <div>
                <p className="category-card-name">
                  {category.name}
                </p>

                <p className="category-card-task-count">
                  {category.task_count} tasks
                </p>
              </div>
            </div>

            <div className="category-card-actions">
              <button
                type="button"
                onClick={() =>
                  setModal({
                    id: category.id,
                    name: category.name,
                    color: category.color,
                  })
                }
                className="category-action-button category-edit-button"
                aria-label={`Edit ${category.name}`}
              >
                <Edit2 size={14} />
              </button>

              <button
                type="button"
                onClick={() => setDeleting(category)}
                className="category-action-button category-delete-action"
                aria-label={`Delete ${category.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="category-progress">
            <div className="category-progress-header">
              <span>Progress</span>

              <span
                className="category-progress-percent"
                style={{ color: category.color }}
              >
                {category.progress_percentage}%
              </span>
            </div>

            <div className="category-progress-track">
              <div
                className="category-progress-fill"
                style={{
                  width: `${category.progress_percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>

            <div className="category-progress-footer">
              <span className="category-completed">
                <CheckCircle2 size={11} />
                {category.completed_count} completed
              </span>

              <span>
                {category.remaining_count} remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  })}
</div>
)}

{modal === 'create' && (
  <CategoryModal
    onSave={(name, color) => {
      onCreate(name, color)
      setModal(null)
    }}
    onClose={() => setModal(null)}
  />
)}

{modal && modal !== 'create' && (
  <CategoryModal
    initial={modal}
    onSave={(name, color) => {
      onEdit(modal.id, name, color)
      setModal(null)
    }}
    onClose={() => setModal(null)}
  />
)}

{deleting && (
  <DeleteConfirm
    category={deleting}
    taskCount={deleting.task_count}
    onConfirm={() => {
      onDelete(deleting.id)
      setDeleting(null)
    }}
    onClose={() => setDeleting(null)}
  />
)}
</div>
)
}