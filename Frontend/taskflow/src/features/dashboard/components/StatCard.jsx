export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  trend,
  trendDir,
}) {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <div className={`dashboard-stat-icon ${iconBg}`}>
          <Icon size={18} />
        </div>

        <span
          className={`dashboard-stat-trend dashboard-trend-${trendDir}`}
        >
          {trend}
        </span>
      </div>

      <div>
        <p className="dashboard-stat-value">
          {value}
        </p>

        <p className="dashboard-stat-label">
          {label}
        </p>
      </div>
    </div>
  )
}