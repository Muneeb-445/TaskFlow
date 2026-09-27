import { useMemo, useEffect, useState } from "react";


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

import { DashboardSkeleton } from "../../../shared/components/Skeleton/Skeleton";
import StatCard from "../components/StatCard";
import StreakBar from "../components/StreakBar";
import OverallProgress from "../components/OverallProgress";
import WeeklyActivity from "../components/WeeklyActivity";
import TaskSection from "../components/TaskSection";
import CategoryOverview from "../components/CategoryOverview";

import { weeklyData } from "../../../data";

import "./Dashboard.css";
const TODAY = "2026-09-03";

export default function Dashboard({
  tasks,
  categories,
  user,
  onNav,
  onSelectTask,
  onCreateTask,
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const total = tasks.length;

  const completed = tasks.filter((task) => task.status === "completed").length;

  const inProgress = tasks.filter(
    (task) => task.status === "in_progress",
  ).length;

  const pending = tasks.filter((task) => task.status === "todo").length;

  const overdue = tasks.filter((task) => task.status === "overdue").length;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todaysTasks = tasks.filter(
    (task) => task.dueDate === TODAY && task.status !== "completed",
  );

  const overdueTasks = tasks.filter((task) => task.status === "overdue");

  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.dueDate > TODAY &&
        task.status !== "completed" &&
        task.status !== "overdue",
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  console.log(
  "Task category IDs:",
  tasks.map((task) => ({
    title: task.title,
    categoryId: task.categoryId,
  }))
);

console.log(
  "Backend categories:",
  categories.map((category) => ({
    id: category.id,
    name: category.name,
  }))
);
  const catData = useMemo(
    () =>
      categories
        .map((category) => {
          const catTasks = tasks.filter(
            (task) => task.categoryId === category.id,
          );

          return {
            name: category.name,
            value: catTasks.length,
            color: category.color,
            done: catTasks.filter((task) => task.status === "completed").length,
          };
        })
        .filter((category) => category.value > 0),
    [tasks, categories],
  );

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
        <WeeklyActivity weeklyData={weeklyData} />

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
