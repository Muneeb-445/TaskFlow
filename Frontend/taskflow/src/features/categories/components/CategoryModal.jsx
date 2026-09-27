import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'

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

export default function CategoryModal({ initial, onSave, onClose }) {
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