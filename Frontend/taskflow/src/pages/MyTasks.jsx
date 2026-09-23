import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Circle,
  ChevronDown,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { PriorityBadge, StatusBadge, CategoryChip } from "../components/badges";

import "./MyTasks.css";

const statusFilters = [
  { key: "all", label: "All" },
  { key: "todo", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

const priorityOrder = {
  high: 0,
  medium: 1,
  low: 2,
};

export default function MyTasks({
  tasks,
  categories,
  onSelectTask,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  searchQuery,
  onSearch,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("dueDate");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getCat = (id) =>
    categories.find((category) => category.id === id) || {
      name: "Uncategorized",
      color: "#9CA3AF",
    };

  const filtered = useMemo(() => {
    let list = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      list = list.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      list = list.filter((task) => task.priority === priorityFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter((task) => task.categoryId === categoryFilter);
    }

    list.sort((a, b) => {
      if (sortField === "dueDate") {
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (sortField === "priority") {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      if (sortField === "title") {
        return a.title.localeCompare(b.title);
      }

      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }, [
    tasks,
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortField,
  ]);

  const activeFilterCount =
    (priorityFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  return (
    <div className="my-tasks-page fade-in">
      {/* Header */}
      <div className="my-tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p>{tasks.length} tasks total</p>
        </div>

        <button
          type="button"
          onClick={onCreateTask}
          className="my-tasks-create-button"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Search + filter row */}
      <div className="my-tasks-toolbar">
        <div className="my-tasks-search">
          <Search size={15} />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tasks…"
          />

          {searchQuery && (
            <button
              type="button"
              className="my-tasks-search-clear"
              onClick={() => onSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          className={`my-tasks-filter-button ${
            showFilters || activeFilterCount > 0 ? "my-tasks-filter-active" : ""
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="my-tasks-filter-count">{activeFilterCount}</span>
          )}
        </button>

        <div className="my-tasks-sort">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
            <option value="createdAt">Newest</option>
          </select>

          <ChevronDown size={14} />
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="my-tasks-expanded-filters fade-in">
          <div className="my-tasks-filter-group">
            <p>Priority</p>

            <div className="my-tasks-filter-options">
              {["all", "high", "medium", "low"].map((priority) => (
                <button
                  type="button"
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`my-tasks-option ${
                    priorityFilter === priority
                      ? `my-tasks-priority-${priority}`
                      : "my-tasks-option-inactive"
                  }`}
                >
                  {priority === "all"
                    ? "All priorities"
                    : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="my-tasks-filter-group">
            <p>Category</p>

            <div className="my-tasks-filter-options">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`my-tasks-option ${
                  categoryFilter === "all"
                    ? "my-tasks-option-brand"
                    : "my-tasks-option-inactive"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className="my-tasks-option"
                  style={
                    categoryFilter === category.id
                      ? {
                          backgroundColor: category.color,
                          color: "#ffffff",
                        }
                      : {
                          backgroundColor: "#F5F5F7",
                          color: "#374151",
                        }
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="my-tasks-clear-wrapper">
              <button
                type="button"
                onClick={() => {
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}
                className="my-tasks-clear-filters"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status chips */}
      <div className="my-tasks-status-list">
        {statusFilters.map(({ key, label }) => {
          const count =
            key === "all"
              ? tasks.length
              : tasks.filter((task) => task.status === key).length;

          const active = statusFilter === key;

          return (
            <button
              type="button"
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`my-tasks-status-chip ${
                active ? "my-tasks-status-active" : ""
              }`}
            >
              {label}

              <span
                className={
                  active
                    ? "my-tasks-status-count-active"
                    : "my-tasks-status-count"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="my-tasks-empty-container">
          <EmptyTasks
            onCreateTask={onCreateTask}
            hasFilter={
              statusFilter !== "all" ||
              activeFilterCount > 0 ||
              Boolean(searchQuery)
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="my-tasks-desktop-table">
            <div className="my-tasks-table-header">
              <span className="my-tasks-checkbox-space" />
              <span>Task</span>
              <span>Category</span>
              <span>Priority</span>
              <span>Due</span>
              <span>Actions</span>
            </div>

            <div className="my-tasks-table-body">
              {filtered.map((task) => (
                <DesktopRow
                  key={task.id}
                  task={task}
                  cat={getCat(task.categoryId)}
                  onView={() => onSelectTask(task.id)}
                  onEdit={() => onEditTask(task.id)}
                  onDelete={() => setDeleteConfirm(task.id)}
                  onComplete={() => onCompleteTask(task.id)}
                />
              ))}
            </div>
          </div>

          {/* Mobile card list */}
          <div className="my-tasks-mobile-list">
            {filtered.map((task) => (
              <MobileCard
                key={task.id}
                task={task}
                cat={getCat(task.categoryId)}
                onView={() => onSelectTask(task.id)}
                onEdit={() => onEditTask(task.id)}
                onDelete={() => setDeleteConfirm(task.id)}
                onComplete={() => onCompleteTask(task.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <DeleteModal
          onConfirm={() => {
            onDeleteTask(deleteConfirm);
            setDeleteConfirm(null);
          }}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

/* =========================
   Desktop table row
   ========================= */

function DesktopRow({ task, cat, onView, onEdit, onDelete, onComplete }) {
  const isDone = task.status === "completed";
  const isOverdue = task.status === "overdue";

  return (
    <div
      className={`my-tasks-desktop-row ${
        isOverdue ? "my-tasks-row-overdue" : ""
      }`}
    >
      <button
        type="button"
        onClick={onComplete}
        className="my-tasks-complete-button"
      >
        {isDone ? (
          <CheckCircle2 size={19} className="my-tasks-completed-icon" />
        ) : (
          <Circle size={19} className="my-tasks-circle-icon" />
        )}
      </button>

      <div className="my-tasks-row-content">
        <p
          className={`my-tasks-row-title ${
            isDone ? "my-tasks-title-completed" : ""
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="my-tasks-row-description">{task.description}</p>
        )}
      </div>

      <CategoryChip name={cat.name} color={cat.color} />

      <PriorityBadge priority={task.priority} />

      <span
        className={`my-tasks-due-date ${
          isOverdue ? "my-tasks-due-overdue" : ""
        }`}
      >
        {isOverdue && <AlertCircle size={12} />}
        {new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>

      <div className="my-tasks-row-actions">
        <ActionBtn
          icon={Eye}
          title="View"
          onClick={onView}
          hoverCls="my-tasks-action-view"
        />

        <ActionBtn
          icon={Edit2}
          title="Edit"
          onClick={onEdit}
          hoverCls="my-tasks-action-edit"
        />

        <ActionBtn
          icon={Trash2}
          title="Delete"
          onClick={onDelete}
          hoverCls="my-tasks-action-delete"
        />
      </div>
    </div>
  );
}

/* =========================
   Mobile card
   ========================= */

function MobileCard({ task, cat, onView, onEdit, onDelete, onComplete }) {
  const isDone = task.status === "completed";
  const isOverdue = task.status === "overdue";

  return (
    <div
      className={`my-tasks-mobile-card ${
        isOverdue
          ? "my-tasks-mobile-overdue"
          : isDone
            ? "my-tasks-mobile-completed"
            : ""
      }`}
    >
      <div
        className="my-tasks-mobile-accent"
        style={{ backgroundColor: cat.color }}
      />

      <div className="my-tasks-mobile-content">
        <div className="my-tasks-mobile-title-row">
          <button
            type="button"
            onClick={onComplete}
            className="my-tasks-mobile-complete"
          >
            {isDone ? (
              <CheckCircle2 size={20} className="my-tasks-completed-icon" />
            ) : (
              <Circle size={20} className="my-tasks-circle-icon" />
            )}
          </button>

          <div className="my-tasks-mobile-title-content">
            <p
              className={`my-tasks-mobile-title ${
                isDone ? "my-tasks-title-completed" : ""
              }`}
            >
              {task.title}
            </p>

            {task.description && (
              <p className="my-tasks-mobile-description">{task.description}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="my-tasks-mobile-badges">
          <CategoryChip name={cat.name} color={cat.color} />

          <PriorityBadge priority={task.priority} />

          <StatusBadge status={task.status} />
        </div>

        {/* Footer */}
        <div className="my-tasks-mobile-footer">
          <span
            className={`my-tasks-mobile-date ${
              isOverdue ? "my-tasks-mobile-date-overdue" : ""
            }`}
          >
            <Calendar size={12} />

            {isOverdue ? "Overdue · " : ""}

            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          <div className="my-tasks-mobile-actions">
            <button
              type="button"
              onClick={onView}
              className="my-tasks-mobile-view"
            >
              <Eye size={13} />
              View
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="my-tasks-mobile-edit"
            >
              <Edit2 size={14} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="my-tasks-mobile-delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Action button
   ========================= */

function ActionBtn({ icon: Icon, title, onClick, hoverCls }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`my-tasks-action-button ${hoverCls}`}
    >
      <Icon size={14} />
    </button>
  );
}

/* =========================
   Empty state
   ========================= */

function EmptyTasks({ onCreateTask, hasFilter }) {
  return (
    <div className="my-tasks-empty">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        className="my-tasks-empty-illustration"
      >
        <rect
          x="14"
          y="18"
          width="58"
          height="62"
          rx="10"
          stroke="#7C3AED"
          strokeWidth="2.5"
          fill="none"
        />

        <line
          x1="26"
          y1="36"
          x2="58"
          y2="36"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />

        <line
          x1="26"
          y1="48"
          x2="50"
          y2="48"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.28"
        />

        <line
          x1="26"
          y1="60"
          x2="42"
          y2="60"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.16"
        />

        {!hasFilter && (
          <>
            <circle cx="72" cy="24" r="14" fill="#7C3AED" />

            <line
              x1="72"
              y1="17"
              x2="72"
              y2="31"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <line
              x1="65"
              y1="24"
              x2="79"
              y2="24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {hasFilter && (
          <>
            <circle
              cx="72"
              cy="24"
              r="14"
              fill="#EDE9FE"
              stroke="#7C3AED"
              strokeWidth="2"
            />

            <line
              x1="67"
              y1="19"
              x2="77"
              y2="29"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <line
              x1="77"
              y1="19"
              x2="67"
              y2="29"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <p className="my-tasks-empty-title">
        {hasFilter ? "No matching tasks" : "No tasks yet"}
      </p>

      <p className="my-tasks-empty-description">
        {hasFilter
          ? "Try adjusting your filters or search query."
          : "Create your first task to start tracking your work."}
      </p>

      {!hasFilter && (
        <button
          type="button"
          onClick={onCreateTask}
          className="my-tasks-empty-button"
        >
          <Plus size={16} />
          Create Task
        </button>
      )}
    </div>
  );
}

/* =========================
   Delete modal
   ========================= */

function DeleteModal({ onConfirm, onClose }) {
  return (
    <div className="my-tasks-modal">
      <div className="my-tasks-modal-overlay" onClick={onClose} />

      <div className="my-tasks-delete-modal slide-up">
        <div className="my-tasks-delete-icon">
          <Trash2 size={22} />
        </div>

        <h3>Delete this task?</h3>

        <p>This action cannot be undone.</p>

        <div className="my-tasks-delete-actions">
          <button
            type="button"
            onClick={onConfirm}
            className="my-tasks-delete-confirm"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            className="my-tasks-delete-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
