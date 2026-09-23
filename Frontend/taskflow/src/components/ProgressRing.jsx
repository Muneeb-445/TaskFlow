import './ProgressRing.css'
export default function ProgressRing({
  pct,
  size = 180,
  stroke = 12,
  color = '#7C3AED',
  label,
  sublabel,
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div
      className="progress-ring"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        className="progress-ring-svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ECECEF"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition:
              'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </svg>

      <div className="progress-ring-content">
        <span className="progress-ring-percentage">
          {pct}%
        </span>

        {label && (
          <span className="progress-ring-label">
            {label}
          </span>
        )}

        {sublabel && (
          <span className="progress-ring-sublabel">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}