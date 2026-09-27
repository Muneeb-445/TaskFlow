import ProgressRing from '../../../components/ProgressRing'

export default function OverallProgress({
  completed,
  total,
  inProgress,
  pending,
  overdue,
  pct,
}) {
  const breakdown = [
    {
      label: 'Completed',
      val: completed,
      color: '#16A34A',
    },
    {
      label: 'In Progress',
      val: inProgress,
      color: '#7C3AED',
    },
    {
      label: 'Pending',
      val: pending,
      color: '#F59E0B',
    },
    {
      label: 'Overdue',
      val: overdue,
      color: '#EF4444',
    },
  ]

  return (
    <div className="dashboard-card progress-card">
      <p className="dashboard-card-title">
        Overall Progress
      </p>

      <p className="dashboard-card-subtitle">
        {completed} of {total} tasks complete
      </p>

      <div className="progress-card-content">
        <ProgressRing
          pct={pct}
          size={156}
          stroke={13}
          label="Done"
          sublabel={`${completed}/${total}`}
        />

        <div className="progress-breakdown">
          {breakdown.map(({ label, val, color }) => (
            <div
              key={label}
              className="progress-breakdown-row"
            >
              <span
                className="progress-breakdown-dot"
                style={{
                  backgroundColor: color,
                }}
              />

              <span className="progress-breakdown-label">
                {label}
              </span>

              <span className="progress-breakdown-value">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}