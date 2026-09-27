import {
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react'

import {
  PriorityBadge,
  CategoryChip,
} from '../../../components/badges'

export default function DesktopTaskRow({
  task,
  cat,
  onView,
  onEdit,
  onDelete,
  onComplete,
}) {
  const isDone = task.status === 'completed'
  const isOverdue = task.status === 'overdue'

  return (
    <div
      className={`my-tasks-desktop-row ${
        isOverdue ? 'my-tasks-row-overdue' : ''
      }`}
    >
      <button
        type="button"
        onClick={onComplete}
        className="my-tasks-complete-button"
      >
        {isDone ? (
          <CheckCircle2
            size={19}
            className="my-tasks-completed-icon"
          />
        ) : (
          <Circle
            size={19}
            className="my-tasks-circle-icon"
          />
        )}
      </button>

      <div className="my-tasks-row-content">
        <p
          className={`my-tasks-row-title ${
            isDone ? 'my-tasks-title-completed' : ''
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="my-tasks-row-description">
            {task.description}
          </p>
        )}
      </div>

      <CategoryChip
        name={cat.name}
        color={cat.color}
      />

      <PriorityBadge priority={task.priority} />

      <span
        className={`my-tasks-due-date ${
          isOverdue ? 'my-tasks-due-overdue' : ''
        }`}
      >
        {isOverdue && <AlertCircle size={12} />}

        {new Date(task.dueDate).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
          },
        )}
      </span>

      <div className="my-tasks-row-actions">
        <ActionBtn
          icon={Eye}
          title="View"
          onClick={onView}
          hoverCls="my-tasks-action-view"
        />

        <ActionBtn
          icon={Edit2}
          title="Edit"
          onClick={onEdit}
          hoverCls="my-tasks-action-edit"
        />

        <ActionBtn
          icon={Trash2}
          title="Delete"
          onClick={onDelete}
          hoverCls="my-tasks-action-delete"
        />
      </div>
    </div>
  )
}

function ActionBtn({
  icon: Icon,
  title,
  onClick,
  hoverCls,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`my-tasks-action-button ${hoverCls}`}
    >
      <Icon size={14} />
    </button>
  )
}