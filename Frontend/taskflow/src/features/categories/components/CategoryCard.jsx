import {
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
} from 'lucide-react'

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
}) {
  return (
    <div className="category-card">
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
              onClick={() => onEdit(category)}
              className="category-action-button category-edit-button"
              aria-label={`Edit ${category.name}`}
            >
              <Edit2 size={14} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(category)}
              className="category-action-button category-delete-action"
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

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
}