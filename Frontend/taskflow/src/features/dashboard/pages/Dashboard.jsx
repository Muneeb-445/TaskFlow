import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
  Plus,
  Calendar,
  Zap,
} from "lucide-react";

import { getDashboard } from "../api/dashboard";
import { mapTask } from "../../tasks/api/tasks";
import { DashboardSkeleton } from "../../../shared/components/Skeleton/Skeleton";
import StatCard from "../components/StatCard";
import StreakBar from "../components/StreakBar";
import OverallProgress from "../components/OverallProgress";
import WeeklyActivity from "../components/WeeklyActivity";
import TaskSection from "../components/TaskSection";
import CategoryOverview from "../components/CategoryOverview";

import "./Dashboard.css";

export default function Dashboard({
  categories,
  user,
  onNav,
  onSelectTask,
  onCreateTask,
}) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const total = dashboardData?.total_tasks ?? 0;
  const completed = dashboardData?.completed_tasks ?? 0;
  const inProgress = dashboardData?.in_progress_tasks ?? 0;
  const pending = dashboardData?.pending_tasks ?? 0;
  const overdue = dashboardData?.overdue_tasks ?? 0;
  const pct = dashboardData?.completion_percentage ?? 0;

  const todaysTasks = (dashboardData?.due_today ?? []).map(mapTask);
  const overdueTasks = (dashboardData?.overdue_tasks_list ?? []).map(mapTask);
  const upcomingTasks = (dashboardData?.upcoming_tasks ?? []).map(mapTask);

  const catData = (dashboardData?.category_statistics ?? []).map((stat) => {
    const category = categories.find((category) => category.id === stat.id);

    return {
      name: stat.name,
      value: stat.task_count,
      done: stat.completed_count,
      color: category?.color || "#9CA3AF",
    };
  });

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-page fade-in">
      {/* Hero header */}
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-heading">
            {greeting}, {user.fullname.split(" ")[0]} 👋
          </h1>

          <p className="dashboard-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
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
          trend={overdue > 0 ? "Needs attention" : "All clear!"}
          trendDir={overdue > 0 ? "down" : "up"}
        />
      </div>

      {/* Progress + Weekly + Streak */}
      <div className="dashboard-chart-grid">
        {/* OveraLLProgress */}
        <OverallProgress
          completed={completed}
          total={total}
          inProgress={inProgress}
          pending={pending}
          overdue={overdue}
          pct={pct}
        />

        {/* Weekly Activity */}
        <WeeklyActivity weeklyData={dashboardData?.weekly_productivity ?? []} />
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
            icon={<Calendar size={14} className="task-section-brand-icon" />}
            badgeColor="brand"
            tasks={todaysTasks}
            categories={categories}
            onSelect={onSelectTask}
            emptyMsg="Nothing due today — enjoy the breathing room."
          />

          {overdueTasks.length > 0 && (
            <TaskSection
              title="Overdue"
              icon={<AlertCircle size={14} className="task-section-red-icon" />}
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
            icon={<Clock size={14} className="task-section-amber-icon" />}
            badgeColor="amber"
            tasks={upcomingTasks}
            categories={categories}
            onSelect={onSelectTask}
            emptyMsg="Nothing upcoming — time to plan ahead."
          />
        </div>

        {/* Category donut */}
        <CategoryOverview
          catData={catData}
          onManageCategories={() => onNav("categories")}
        />
      </div>

      {/* Quick actions */}
      <div className="quick-actions-banner">
        <div className="quick-actions-icon">
          <Zap size={18} color="#ffffff" fill="white" />
        </div>

        <div className="quick-actions-content">
          <p className="quick-actions-title">Keep the momentum going</p>

          <p className="quick-actions-subtitle">
            {pending + inProgress} tasks in progress ·{" "}
            {overdue > 0 ? `${overdue} overdue` : "no overdue tasks 🎉"}
          </p>
        </div>

        <div className="quick-actions-buttons">
          <button
            type="button"
            onClick={() => onNav("my-tasks")}
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
  );
}
