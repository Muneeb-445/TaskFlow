import './badges.css'

const priorityCfg = {
  low: {
    label: 'Low',
    cls: 'badge-priority-low',
  },
  medium: {
    label: 'Medium',
    cls: 'badge-priority-medium',
  },
  high: {
    label: 'High',
    cls: 'badge-priority-high',
  },
}

const statusCfg = {
  todo: {
    label: 'To Do',
    cls: 'badge-status-todo',
  },
  in_progress: {
    label: 'In Progress',
    cls: 'badge-status-progress',
  },
  completed: {
    label: 'Completed',
    cls: 'badge-status-completed',
  },
  overdue: {
    label: 'Overdue',
    cls: 'badge-status-overdue',
  },
}

export function PriorityBadge({ priority }) {
  const c = priorityCfg[priority]

  if (!c) return null

  return (
    <span className={`priority-badge ${c.cls}`}>
      {c.label}
    </span>
  )
}

export function StatusBadge({ status, isOverdue = false }) {
  const displayStatus =
    isOverdue && status !== 'completed'
      ? 'overdue'
      : status

  const c = statusCfg[displayStatus]

  if (!c) return null

  return (
    <span className={`status-badge ${c.cls}`}>
      {c.label}
    </span>
  )
}

export function CategoryChip({ name, color }) {
  return (
    <span
      className="category-chip"
      style={{
        backgroundColor: `${color}18`,
        color,
      }}
      title={name}
    >
      <span
        className="category-chip-dot"
        style={{ backgroundColor: color }}
      />

      <span className="category-chip-name">
        {name}
      </span>
    </span>
  )
}