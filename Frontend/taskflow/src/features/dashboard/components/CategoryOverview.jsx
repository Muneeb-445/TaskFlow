import {
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import {
  ArrowRight,
  Zap,
} from 'lucide-react'

export default function CategoryOverview({
  catData,
  onManageCategories,
}) {
  return (
    <div className="dashboard-card category-card">
      <p className="dashboard-card-title category-title">
        By Category
      </p>

      {catData.length > 0 ? (
        <>
          <div className="category-chart">
            <PieChart width={160} height={160}>
              <Pie
                data={catData}
                cx={80}
                cy={80}
                innerRadius={48}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {catData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>

          <div className="category-breakdown">
            {catData.map((category) => {
              const percentage =
                category.value > 0
                  ? Math.round(
                      (category.done / category.value) * 100
                    )
                  : 0

              return (
                <div
                  key={category.name}
                  className="category-breakdown-item"
                >
                  <div className="category-breakdown-header">
                    <span
                      className="category-breakdown-dot"
                      style={{
                        backgroundColor: category.color,
                      }}
                    />

                    <span className="category-breakdown-name">
                      {category.name}
                    </span>

                    <span className="category-breakdown-count">
                      {category.done}/{category.value}
                    </span>
                  </div>

                  <div className="category-progress-track">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={onManageCategories}
            className="manage-categories-button"
          >
            Manage Categories
            <ArrowRight size={13} />
          </button>
        </>
      ) : (
        <div className="category-empty">
          <Zap
            size={28}
            className="category-empty-icon"
          />

          <p>No categorized tasks yet</p>
        </div>
      )}
    </div>
  )
}