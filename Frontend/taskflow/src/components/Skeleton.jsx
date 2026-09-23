import './Skeleton.css'

function Bone({ className }) {
  return <div className={`shimmer skeleton-bone ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      {/* Hero */}
      <div className="skeleton-hero">
        <div className="skeleton-stack skeleton-hero-content">
          <Bone className="skeleton-h8 skeleton-w64" />
          <Bone className="skeleton-h4 skeleton-w40" />
        </div>

        <Bone className="skeleton-h10 skeleton-w32 skeleton-radius-10" />
      </div>

      {/* Stat cards */}
      <div className="skeleton-stat-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card skeleton-stat-card">
            <div className="skeleton-row-between">
              <Bone className="skeleton-w10 skeleton-h10 skeleton-radius-12" />
              <Bone className="skeleton-w16 skeleton-h5 skeleton-pill" />
            </div>

            <Bone className="skeleton-h9 skeleton-w12" />
            <Bone className="skeleton-h3 skeleton-w24" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="skeleton-chart-grid">
        <div className="skeleton-card skeleton-chart-card">
          <Bone className="skeleton-h5 skeleton-w36" />

          <div className="skeleton-chart-content">
            <Bone className="skeleton-circle skeleton-size40" />

            <div className="skeleton-stack skeleton-chart-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <Bone className="skeleton-dot" />
                  <Bone className="skeleton-flex skeleton-h3" />
                  <Bone className="skeleton-w6 skeleton-h4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="skeleton-card skeleton-chart-card">
          <Bone className="skeleton-h5 skeleton-w36" />
          <Bone className="skeleton-h40 skeleton-full-width" />
        </div>
      </div>

      {/* Task lists */}
      <div className="skeleton-task-grid">
        <div className="skeleton-task-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card skeleton-task-card">
              <Bone className="skeleton-w4 skeleton-h4 skeleton-radius-4" />

              <div className="skeleton-stack skeleton-flex skeleton-task-content">
                <Bone className="skeleton-h4 skeleton-w75" />

                <div className="skeleton-row skeleton-gap2">
                  <Bone className="skeleton-h5 skeleton-w16 skeleton-pill" />
                  <Bone className="skeleton-h5 skeleton-w14 skeleton-pill" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="skeleton-card skeleton-category-card">
          <Bone className="skeleton-h5 skeleton-w28" />

          <Bone className="skeleton-circle skeleton-size36 skeleton-centered" />

          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-row">
              <Bone className="skeleton-dot" />
              <Bone className="skeleton-flex skeleton-h3" />
              <Bone className="skeleton-w8 skeleton-h3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="task-list-skeleton">
      <div className="skeleton-page-header">
        <div className="skeleton-stack">
          <Bone className="skeleton-h8 skeleton-w32" />
          <Bone className="skeleton-h4 skeleton-w24" />
        </div>

        <Bone className="skeleton-h10 skeleton-w32 skeleton-radius-10" />
      </div>

      <div className="skeleton-filter-row">
        <Bone className="skeleton-flex skeleton-h10 skeleton-radius-10" />
        <Bone className="skeleton-w24 skeleton-h10 skeleton-radius-10" />
        <Bone className="skeleton-w32 skeleton-h10 skeleton-radius-10" />
      </div>

      <div className="skeleton-tabs">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone
            key={i}
            className="skeleton-w20 skeleton-h8 skeleton-pill"
          />
        ))}
      </div>

      <div className="skeleton-card skeleton-task-table">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-table-row">
            <Bone className="skeleton-w5 skeleton-h5 skeleton-circle-small" />

            <div className="skeleton-stack skeleton-flex skeleton-table-content">
              <Bone className="skeleton-h4 skeleton-w66" />
              <Bone className="skeleton-h3 skeleton-w50" />
            </div>

            <Bone className="skeleton-w16 skeleton-h5 skeleton-pill" />
            <Bone className="skeleton-w14 skeleton-h5 skeleton-pill" />
            <Bone className="skeleton-w16 skeleton-h4" />
          </div>
        ))}
      </div>
    </div>
  )
}