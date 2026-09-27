import { ArrowRight } from 'lucide-react'

import {
  PriorityBadge,
  CategoryChip,
} from '../../../components/badges'

export default function TaskSection({
  title,
  icon,
  badgeColor,
  tasks,
  categories,
  onSelect,
  emptyMsg,
  overdueTint,
}) {
  const getCat = (id) =>
    categories.find(
      (category) => category.id === id
    ) || {
      name: 'Uncategorized',
      color: '#9CA3AF',
    }

  return (
    <div className="dashboard-task-section">
      <div className="task-section-header">
        {icon}

        <span className="task-section-title">
          {title}
        </span>

        <span
          className={`task-section-badge task-badge-${badgeColor}`}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="task-section-empty">
          {emptyMsg}
        </p>
      ) : (
        <div className="task-section-list">
          {tasks.map((task) => {
            const category = getCat(task.categoryId)

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelect(task.id)}
                className={`task-section-item ${
                  overdueTint
                    ? 'task-section-item-overdue'
                    : ''
                }`}
              >
                <div className="task-section-checkbox" />

                <div className="task-section-content">
                  <p className="task-section-task-title">
                    {task.title}
                  </p>

                  <div className="task-section-meta">
                    <CategoryChip
                      name={category.name}
                      color={category.color}
                    />

                    <PriorityBadge
                      priority={task.priority}
                    />

                    <span className="task-section-date">
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <ArrowRight
                  size={14}
                  className="task-section-arrow"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}