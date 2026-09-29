import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import DeleteTaskModal from "../components/DeleteTaskModal";
import EmptyTasks from "../components/EmptyTasks";
import DesktopTaskRow from "../components/DesktopTaskRow";
import MobileTaskCard from "../components/MobileTaskCard";
import TaskFilters from "../components/TaskFilters";
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
function matchesStatusFilter(task, filter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "overdue") {
    return task.isOverdue && task.status !== "completed";
  }

  return task.status === filter;
}

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
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortField,
  onSortFieldChange,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getCat = (id) =>
    categories.find((category) => category.id === id) || {
      name: "Uncategorized",
      color: "#9CA3AF",
    };

  const filtered = useMemo(() => {
    let list = [...tasks];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      list = list.filter((task) => {
        const title = task.title?.toLowerCase() || "";
        const description = task.description?.toLowerCase() || "";

        return title.includes(query) || description.includes(query);
      });
    }

    if (statusFilter !== "all") {
      list = list.filter((task) => matchesStatusFilter(task, statusFilter));
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

      <TaskFilters
        searchQuery={searchQuery}
        onSearch={onSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((current) => !current)}
        activeFilterCount={activeFilterCount}
        priorityFilter={priorityFilter}
        onPriorityChange={onPriorityFilterChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryFilterChange}
        categories={categories}
        sortField={sortField}
        onSortChange={onSortFieldChange}
        onClearFilters={() => {
          onPriorityFilterChange("all");
          onCategoryFilterChange("all");
        }}
      />

      {/* Status chips */}
      <div className="my-tasks-status-list">
        {statusFilters.map(({ key, label }) => {
          const count = tasks.filter((task) =>
            matchesStatusFilter(task, key),
          ).length;

          const active = statusFilter === key;

          return (
            <button
              type="button"
              key={key}
              onClick={() => onStatusFilterChange(key)}
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
              <span>Status</span>
              <span>Due</span>
              <span>Actions</span>
            </div>

            <div className="my-tasks-table-body">
              {filtered.map((task) => (
                <DesktopTaskRow
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
              <MobileTaskCard
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
        <DeleteTaskModal
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
