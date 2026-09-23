import { useMemo, useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
  Plus,
  Flame,
  ArrowRight,
  Calendar,
  Zap,
} from 'lucide-react'

import ProgressRing from '../components/ProgressRing'
import {
  PriorityBadge,
  CategoryChip,
} from '../components/badges'
import { DashboardSkeleton } from '../components/Skeleton'
import { weeklyData } from '../data'

import './Dashboard.css'

const TODAY = '2026-09-03'

function StatCard({
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

function StreakBar({ streak }) {
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

export default function Dashboard({
  tasks,
  categories,
  user,
  onNav,
  onSelectTask,
  onCreateTask,
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const total = tasks.length

  const completed = tasks.filter(
    (task) => task.status === 'completed'
  ).length

  const inProgress = tasks.filter(
    (task) => task.status === 'in_progress'
  ).length

  const pending = tasks.filter(
    (task) => task.status === 'todo'
  ).length

  const overdue = tasks.filter(
    (task) => task.status === 'overdue'
  ).length

  const pct =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0

  const todaysTasks = tasks.filter(
    (task) =>
      task.dueDate === TODAY &&
      task.status !== 'completed'
  )

  const overdueTasks = tasks.filter(
    (task) => task.status === 'overdue'
  )

  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.dueDate > TODAY &&
        task.status !== 'completed' &&
        task.status !== 'overdue'
    )
    .sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate)
    )
    .slice(0, 4)

  const catData = useMemo(
    () =>
      categories
        .map((category) => {
          const catTasks = tasks.filter(
            (task) => task.categoryId === category.id
          )

          return {
            name: category.name,
            value: catTasks.length,
            color: category.color,
            done: catTasks.filter(
              (task) => task.status === 'completed'
            ).length,
          }
        })
        .filter((category) => category.value > 0),
    [tasks, categories]
  )

  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening'

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dashboard-page fade-in">
      {/* Hero header */}
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-heading">
            {greeting},{' '}
            {user.name.split(' ')[0]} 👋
          </h1>

          <p className="dashboard-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}

            {overdue > 0 && (
              <span className="dashboard-overdue-summary">
                <AlertCircle size={12} />
                {overdue} overdue
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateTask}
          className="dashboard-create-button"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stat-grid">
        <StatCard
          label="Total"
          value={total}
          icon={ListTodo}
          iconBg="dashboard-icon-violet"
          trend="+3 this week"
          trendDir="up"
        />

        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          iconBg="dashboard-icon-green"
          trend="+5 this week"
          trendDir="up"
        />

        <StatCard
          label="In Progress"
          value={inProgress}
          icon={TrendingUp}
          iconBg="dashboard-icon-blue"
          trend="Active"
          trendDir="neutral"
        />

        <StatCard
          label="Pending"
          value={pending}
          icon={Clock}
          iconBg="dashboard-icon-amber"
          trend="Up next"
          trendDir="neutral"
        />

        <StatCard
          label="Overdue"
          value={overdue}
          icon={AlertCircle}
          iconBg="dashboard-icon-red"
          trend={
            overdue > 0
              ? 'Needs attention'
              : 'All clear!'
          }
          trendDir={
            overdue > 0 ? 'down' : 'up'
          }
        />
      </div>

      {/* Progress + Weekly + Streak */}
      <div className="dashboard-chart-grid">
        {/* Overall progress */}
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
              {[
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
              ].map(({ label, val, color }) => (
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

        {/* Weekly activity */}
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

        {/* Streak */}
        <div className="dashboard-streak-wrapper">
          <StreakBar streak={5} />
        </div>
      </div>

      {/* Task lists + Category donut */}
      <div className="dashboard-task-grid">
        <div className="dashboard-task-sections">
          <TaskSection
            title="Due Today"
            icon={
              <Calendar
                size={14}
                className="task-section-brand-icon"
              />
            }
            badgeColor="brand"
            tasks={todaysTasks}
            categories={categories}
            onSelect={onSelectTask}
            emptyMsg="Nothing due today — enjoy the breathing room."
          />

          {overdueTasks.length > 0 && (
            <TaskSection
              title="Overdue"
              icon={
                <AlertCircle
                  size={14}
                  className="task-section-red-icon"
                />
              }
              badgeColor="red"
              tasks={overdueTasks}
              categories={categories}
              onSelect={onSelectTask}
              overdueTint
              emptyMsg=""
            />
          )}

          <TaskSection
            title="Upcoming"
            icon={
              <Clock
                size={14}
                className="task-section-amber-icon"
              />
            }
            badgeColor="amber"
            tasks={upcomingTasks}
            categories={categories}
            onSelect={onSelectTask}
            emptyMsg="Nothing upcoming — time to plan ahead."
          />
        </div>

        {/* Category donut */}
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
                          (category.done /
                            category.value) *
                            100
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
                            backgroundColor:
                              category.color,
                          }}
                        />

                        <span className="category-breakdown-name">
                          {category.name}
                        </span>

                        <span className="category-breakdown-count">
                          {category.done}/
                          {category.value}
                        </span>
                      </div>

                      <div className="category-progress-track">
                        <div
                          className="category-progress-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              category.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  onNav('categories')
                }
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

              <p>
                No categorized tasks yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions-banner">
        <div className="quick-actions-icon">
          <Zap
            size={18}
            color="#ffffff"
            fill="white"
          />
        </div>

        <div className="quick-actions-content">
          <p className="quick-actions-title">
            Keep the momentum going
          </p>

          <p className="quick-actions-subtitle">
            {pending + inProgress} tasks in progress ·{' '}
            {overdue > 0
              ? `${overdue} overdue`
              : 'no overdue tasks 🎉'}
          </p>
        </div>

        <div className="quick-actions-buttons">
          <button
            type="button"
            onClick={() =>
              onNav('my-tasks')
            }
            className="quick-action-primary"
          >
            View All Tasks
          </button>

          <button
            type="button"
            onClick={onCreateTask}
            className="quick-action-secondary"
          >
            + New Task
          </button>
        </div>
      </div>
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

function TaskSection({
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
            const category = getCat(
              task.categoryId
            )

            return (
              <button
                key={task.id}
                type="button"
                onClick={() =>
                  onSelect(task.id)
                }
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
                      ).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
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