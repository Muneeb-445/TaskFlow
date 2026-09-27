import { Plus } from 'lucide-react'

export default function EmptyTasks({
  onCreateTask,
  hasFilter,
}) {
  return (
    <div className="my-tasks-empty">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        className="my-tasks-empty-illustration"
      >
        <rect
          x="14"
          y="18"
          width="58"
          height="62"
          rx="10"
          stroke="#7C3AED"
          strokeWidth="2.5"
          fill="none"
        />

        <line
          x1="26"
          y1="36"
          x2="58"
          y2="36"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />

        <line
          x1="26"
          y1="48"
          x2="50"
          y2="48"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.28"
        />

        <line
          x1="26"
          y1="60"
          x2="42"
          y2="60"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.16"
        />

        {!hasFilter && (
          <>
            <circle
              cx="72"
              cy="24"
              r="14"
              fill="#7C3AED"
            />

            <line
              x1="72"
              y1="17"
              x2="72"
              y2="31"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <line
              x1="65"
              y1="24"
              x2="79"
              y2="24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {hasFilter && (
          <>
            <circle
              cx="72"
              cy="24"
              r="14"
              fill="#EDE9FE"
              stroke="#7C3AED"
              strokeWidth="2"
            />

            <line
              x1="67"
              y1="19"
              x2="77"
              y2="29"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <line
              x1="77"
              y1="19"
              x2="67"
              y2="29"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <p className="my-tasks-empty-title">
        {hasFilter
          ? 'No matching tasks'
          : 'No tasks yet'}
      </p>

      <p className="my-tasks-empty-description">
        {hasFilter
          ? 'Try adjusting your filters or search query.'
          : 'Create your first task to start tracking your work.'}
      </p>

      {!hasFilter && (
        <button
          type="button"
          onClick={onCreateTask}
          className="my-tasks-empty-button"
        >
          <Plus size={16} />
          Create Task
        </button>
      )}
    </div>
  )
}