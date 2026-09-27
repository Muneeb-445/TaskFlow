import { Flame } from 'lucide-react'

export default function StreakBar({ streak }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="dashboard-card streak-card">
      <div className="streak-header">
        <div className="streak-info">
          <div className="streak-icon">
            <Flame size={16} />
          </div>

          <div>
            <p className="streak-title">
              {streak}-day streak
            </p>

            <p className="streak-subtitle">
              Keep it going!
            </p>
          </div>
        </div>

        <div className="streak-count">
          <p>{streak}</p>
          <span>days</span>
        </div>
      </div>

      <div className="streak-days">
        {days.map((day, index) => {
          const isActive =
            index < streak % 7 ||
            (streak >= 7 && index <= 4)

          return (
            <div
              key={index}
              className="streak-day"
            >
              <div
                className={`streak-day-box ${
                  isActive
                    ? 'streak-day-active'
                    : 'streak-day-inactive'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor:
                          'rgba(255, 184, 0, 0.13)',
                      }
                    : {}
                }
              >
                {isActive && (
                  <Flame
                    size={14}
                    className="streak-flame"
                  />
                )}
              </div>

              <span
                className={
                  isActive
                    ? 'streak-day-label streak-day-label-active'
                    : 'streak-day-label'
                }
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}