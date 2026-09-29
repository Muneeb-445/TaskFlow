import {
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Eye,
  Calendar,
} from 'lucide-react'

import {
  PriorityBadge,
  StatusBadge,
  CategoryChip,
} from '../../../shared/components/badges/badges'

function formatDateOnly(dateString) {
  if (!dateString) return 'No due date'

  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  )
} 
export default function MobileTaskCard({
  task,
  cat,
  onView,
  onEdit,
  onDelete,
  onComplete,
}) {
  const isDone = task.status === 'completed'
const isOverdue = task.isOverdue

  return (
    <div
      className={`my-tasks-mobile-card ${
        isOverdue
          ? 'my-tasks-mobile-overdue'
          : isDone
            ? 'my-tasks-mobile-completed'
            : ''
      }`}
    >
      <div
        className="my-tasks-mobile-accent"
        style={{ backgroundColor: cat.color }}
      />

      <div className="my-tasks-mobile-content">
        <div className="my-tasks-mobile-title-row">
          <button
            type="button"
            onClick={onComplete}
            className="my-tasks-mobile-complete"
          >
            {isDone ? (
              <CheckCircle2
                size={20}
                className="my-tasks-completed-icon"
              />
            ) : (
              <Circle
                size={20}
                className="my-tasks-circle-icon"
              />
            )}
          </button>

          <div className="my-tasks-mobile-title-content">
            <p
              className={`my-tasks-mobile-title ${
                isDone
                  ? 'my-tasks-title-completed'
                  : ''
              }`}
            >
              {task.title}
            </p>

            {task.description && (
              <p className="my-tasks-mobile-description">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="my-tasks-mobile-badges">
          <CategoryChip
            name={cat.name}
            color={cat.color}
          />

          <PriorityBadge priority={task.priority} />

          <StatusBadge status={task.status} />
        </div>

        <div className="my-tasks-mobile-footer">
          <span
            className={`my-tasks-mobile-date ${
              isOverdue
                ? 'my-tasks-mobile-date-overdue'
                : ''
            }`}
          >
            <Calendar size={12} />

            {isOverdue ? 'Overdue · ' : ''}

            {formatDateOnly(task.dueDate)}
          </span>

          <div className="my-tasks-mobile-actions">
            <button
              type="button"
              onClick={onView}
              className="my-tasks-mobile-view"
            >
              <Eye size={13} />
              View
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="my-tasks-mobile-edit"
            >
              <Edit2 size={14} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="my-tasks-mobile-delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}