import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function WeeklyActivity({
  weeklyData,
}) {
  return (
    <div className="dashboard-card weekly-card">
      <p className="dashboard-card-title">
        Weekly Activity
      </p>

      <p className="dashboard-card-subtitle">
        Completed vs. created this week
      </p>

      <div className="chart-legend">
        <LegendDot
          color="#7C3AED"
          label="Completed"
        />

        <LegendDot
          color="#EDE9FE"
          label="Created"
        />
      </div>

      <ResponsiveContainer
        width="100%"
        height={148}
      >
        <BarChart
          data={weeklyData}
          barSize={10}
          barGap={2}
          margin={{ left: -20 }}
        >
          <XAxis
            dataKey="day"
            tick={{
              fontSize: 11,
              fill: '#9CA3AF',
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fill: '#9CA3AF',
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #ECECEF',
              boxShadow:
                '0 4px 16px rgba(0,0,0,.08)',
            }}
            cursor={{
              fill: '#F5F3FF',
              radius: 4,
            }}
          />

          <Bar
            dataKey="completed"
            name="Completed"
            fill="#7C3AED"
            radius={[5, 5, 0, 0]}
          />

          <Bar
            dataKey="created"
            name="Created"
            fill="#EDE9FE"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="chart-legend-item">
      <span
        className="chart-legend-dot"
        style={{ backgroundColor: color }}
      />

      <span>{label}</span>
    </div>
  )
}