import {
  ArrowLeft,
  Edit2,
  Play,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Tag,
  Flag,
  Clock,
  AlignLeft,
} from "lucide-react";

import { PriorityBadge, StatusBadge, CategoryChip } from "../components/badges";

import "./TaskDetails.css";

function MetaField({ icon, label, value, valueClass = "text-[#0F0F14]" }) {
  return (
    <div className="task-details-meta-field">
      <div className="task-details-meta-label">
        {icon}
        <span>{label}</span>
      </div>

      <p className={`task-details-meta-value ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function TaskDetails({
  task,
  categories,
  onBack,
  onEdit,
  onStart,
  onDelete,
  onComplete,
  onReopen,
}) {
  const cat = categories.find(
    (category) => category.id === task.categoryId,
  ) || {
    name: "Uncategorized",
    color: "#9CA3AF",
  };

  const isDone = task.status === "completed";
  const isOverdue = task.status === "overdue";

  const formattedDueDate = new Date(task.dueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedCreatedDate = new Date(task.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  const formattedCompletedDate = task.completedAt
    ? new Date(task.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const formattedCompletedShortDate = task.completedAt
    ? new Date(task.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : null;

  const priorityLabel =
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  const statusBarClass = isDone
    ? "task-details-status-completed"
    : isOverdue
      ? "task-details-status-overdue"
      : task.status === "in_progress"
        ? "task-details-status-progress"
        : "task-details-status-todo";

  const cardBorderClass = isDone
    ? "task-details-card-completed"
    : isOverdue
      ? "task-details-card-overdue"
      : "task-details-card-default";

  return (
    <div className="task-details-page fade-in">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="task-details-back-button"
      >
        <ArrowLeft size={15} />
        Back to tasks
      </button>

      {/* Main card */}
      <div className={`task-details-card ${cardBorderClass}`}>
        {/* Status bar */}
        <div className={`task-details-status-bar ${statusBarClass}`} />

        <div className="task-details-content">
          {/* Title */}
          <div className="task-details-title-row">
            <div
              className={`task-details-title-icon ${
                isDone
                  ? "task-details-title-icon-completed"
                  : "task-details-title-icon-default"
              }`}
            >
              {isDone ? (
                <CheckCircle2
                  size={18}
                  className="task-details-completed-icon"
                />
              ) : (
                <div className="task-details-title-dot" />
              )}
            </div>

            <div className="task-details-title-content">
              <h1
                className={
                  isDone
                    ? "task-details-title task-details-title-done"
                    : "task-details-title"
                }
              >
                {task.title}
              </h1>

              <div className="task-details-badges">
                <StatusBadge status={task.status} />

                <PriorityBadge priority={task.priority} />

                <CategoryChip name={cat.name} color={cat.color} />
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="task-details-description">
              <div className="task-details-description-heading">
                <AlignLeft size={14} className="task-details-muted-icon" />

                <span>Description</span>
              </div>

              <p
                className={
                  isDone
                    ? "task-details-description-text task-details-description-done"
                    : "task-details-description-text"
                }
              >
                {task.description}
              </p>
            </div>
          )}

          {/* Meta fields */}
          <div className="task-details-meta-grid">
            <MetaField
              icon={<Calendar size={14} className="task-details-muted-icon" />}
              label="Due Date"
              value={formattedDueDate}
              valueClass={isOverdue ? "task-details-value-overdue" : ""}
            />

            <MetaField
              icon={<Clock size={14} className="task-details-muted-icon" />}
              label="Created"
              value={formattedCreatedDate}
            />

            <MetaField
              icon={<Flag size={14} className="task-details-muted-icon" />}
              label="Priority"
              value={priorityLabel}
            />

            <MetaField
              icon={<Tag size={14} className="task-details-muted-icon" />}
              label="Category"
              value={cat.name}
            />

            {task.completedAt && (
              <MetaField
                icon={
                  <CheckCircle2
                    size={14}
                    className="task-details-completed-icon"
                  />
                }
                label="Completed On"
                value={formattedCompletedDate}
                valueClass="task-details-value-completed"
              />
            )}
          </div>

          {/* Completed banner */}
          {isDone && (
            <div className="task-details-completed-banner">
              <CheckCircle2 size={18} className="task-details-completed-icon" />

              <div>
                <p>Task completed</p>

                {formattedCompletedShortDate && (
                  <span>Completed on {formattedCompletedShortDate}</span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="task-details-actions">
            <button
              type="button"
              onClick={onEdit}
              className="task-details-edit-button"
            >
              <Edit2 size={15} />
              Edit Task
            </button>

            {(task.status === "todo" || task.status === "overdue") && (
              <button
                type="button"
                onClick={onStart}
                className="task-details-start-button"
              >
                <Play size={15} />
                Start
              </button>
            )}

            {task.status === "in_progress" && (
              <button
                type="button"
                onClick={onComplete}
                className="task-details-complete-button"
              >
                <CheckCircle2 size={15} />
                Mark Complete
              </button>
            )}

            {task.status === "completed" && (
              <button
                type="button"
                onClick={onReopen}
                className="task-details-reopen-button"
              >
                <RotateCcw size={15} />
                Reopen
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              className="task-details-delete-button"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
