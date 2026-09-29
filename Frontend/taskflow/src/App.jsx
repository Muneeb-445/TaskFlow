import { useState, useEffect } from "react";

import Toast from "./shared/components/Toast/Toast";
import useToast from "./shared/hooks/useToast";
import Sidebar, { BottomNav } from "./shared/components/Sidebar/Sidebar";
import Header from "./shared/components/Header/Header";
import ErrorBoundary from "./shared/components/ErrorBoundry/errorBoundary";

import useAuth from "./features/auth/hooks/useAuth";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Dashboard from "./features/dashboard/pages/Dashboard";
import MyTasks from "./features/tasks/pages/MyTasks";
import TaskDetails from "./features/tasks/pages/TaskDetails";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
  reopenTask,
} from "./features/tasks/api/tasks";
import CreateEditTask from "./features/tasks/pages/CreateEditTask";
import Categories from "./features/categories/pages/Categories";
import Profile from "./features/user/pages/Profile";
import Settings from "./features/user/pages/Settings";

import "./App.css";
import { getCurrentUser } from "./features/user/api/users";
import { getCategories } from "./features/categories/api/categories";
import useCategories from "./features/categories/hooks/useCategories";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("all");
  const [taskSortField, setTaskSortField] = useState("dueDate");

  const { toasts, showToast, removeToast } = useToast();

  const {
    categories,
    setCategories,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
  } = useCategories([], showToast);

  const { isLoggedIn, authLoading, setAuthLoading, completeLogin, logout } =
    useAuth();

  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        const userCategories = await getCategories();
        const taskData = await getTasks();

        setUser(currentUser);
        setCategories(userCategories);
        setTasks(taskData.items);

        completeLogin();
        setPage("dashboard");
      } catch {
        localStorage.removeItem("access_token");
        logout();
        setPage("login");
      } finally {
        setAuthLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userCategories = await getCategories();
      const taskData = await getTasks();

      setUser(currentUser);
      setCategories(userCategories);
      setTasks(taskData.items);

      completeLogin();
      setPage("dashboard");
    } catch {
      localStorage.removeItem("access_token");
      logout();
      setPage("login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    logout();
    setPage("login");
  };

  const handleNav = (nextPage) => {
    setPage(nextPage);

    if (nextPage !== "my-tasks") {
      setSearchQuery("");
    }
  };

  const handleSelectTask = (id) => {
    setSelectedTaskId(id);
    setPage("task-details");
  };

  const handleCreateTask = () => {
    setEditingTaskId(null);
    setPage("create-task");
  };

  const handleEditTask = (id) => {
    setEditingTaskId(id);
    setPage("edit-task");
  };
  const handleStartTask = async (taskId) => {
    try {
      const updatedTask = await startTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      showToast("Task started!");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to start task.";

      showToast(message, "error");
    }
  };
  const handleSaveTask = async (data) => {
    if (editingTaskId) {
      try {
        const updatedTask = await updateTask(editingTaskId, data);

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTaskId ? updatedTask : task,
          ),
        );

        showToast("Task updated!");

        setPage(selectedTaskId === editingTaskId ? "task-details" : "my-tasks");
      } catch (error) {
        const message =
          error.response?.data?.detail || "Failed to update task.";

        showToast(message, "error");
      }

      return;
    }

    try {
      const newTask = await createTask(data);

      setTasks((currentTasks) => [newTask, ...currentTasks]);

      showToast("Task created! 🎉");
      setPage("my-tasks");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to create task.";

      showToast(message, "error");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));

      if (page === "task-details") {
        setPage("my-tasks");
      }

      showToast("Task deleted.", "info");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to delete task.";

      showToast(message, "error");
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const updatedTask = await completeTask(id);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updatedTask : task)),
      );

      showToast("Task completed! 🎉");
    } catch (error) {
      const message =
        error.response?.data?.detail || "Failed to complete task.";

      showToast(message, "error");
    }
  };

  const handleReopenTask = async (id) => {
    try {
      const updatedTask = await reopenTask(id);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updatedTask : task)),
      );

      showToast("Task reopened.", "info");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to reopen task.";

      showToast(message, "error");
    }
  };

  if (authLoading) {
    return null;
  }
  /*
   * Authentication screens
   */
  if (!isLoggedIn) {
    return (
      <div className="app-auth">
        <Toast toasts={toasts} onRemove={removeToast} />

        {page === "login" && <Login onLogin={handleLogin} onNav={handleNav} />}

        {page === "register" && <Register onNav={handleNav} />}

        {page === "forgot-password" && <ForgotPassword onNav={handleNav} />}
      </div>
    );
  }

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  const editingTask = editingTaskId
    ? tasks.find((task) => task.id === editingTaskId)
    : undefined;

  return (
    <div className="app-layout">
      <Sidebar current={page} onNav={handleNav} onLogout={handleLogout} />

      <div className="app-content">
        <Header
          user={user}
          onNav={handleNav}
          onLogout={handleLogout}
          onCreateTask={handleCreateTask}
          searchQuery={searchQuery}
          onSearch={(query) => {
            setSearchQuery(query);

            if (query && page !== "my-tasks") {
              setPage("my-tasks");
            }
          }}
        />

        <main className="app-main">
          <ErrorBoundary onReset={() => setPage("dashboard")}>
            {page === "dashboard" && (
              <Dashboard
                categories={categories}
                user={user}
                onNav={handleNav}
                onSelectTask={handleSelectTask}
                onCreateTask={handleCreateTask}
              />
            )}

            {page === "my-tasks" && (
              <MyTasks
                tasks={tasks}
                categories={categories}
                onNav={handleNav}
                onSelectTask={handleSelectTask}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                statusFilter={taskStatusFilter}
                onStatusFilterChange={setTaskStatusFilter}
                priorityFilter={taskPriorityFilter}
                onPriorityFilterChange={setTaskPriorityFilter}
                categoryFilter={taskCategoryFilter}
                onCategoryFilterChange={setTaskCategoryFilter}
                sortField={taskSortField}
                onSortFieldChange={setTaskSortField}
              />
            )}

            {page === "task-details" && selectedTask && (
              <TaskDetails
                task={selectedTask}
                categories={categories}
                onBack={() => setPage("my-tasks")}
                onEdit={() => handleEditTask(selectedTask.id)}
                onStart={() => handleStartTask(selectedTask.id)}
                onDelete={() => handleDeleteTask(selectedTask.id)}
                onComplete={() => handleCompleteTask(selectedTask.id)}
                onReopen={() => handleReopenTask(selectedTask.id)}
              />
            )}

            {page === "task-details" && !selectedTask && (
              <div className="task-not-found">Task not found.</div>
            )}

            {(page === "create-task" || page === "edit-task") && (
              <CreateEditTask
                task={editingTask}
                categories={categories}
                onSave={handleSaveTask}
                onBack={() =>
                  setPage(editingTaskId ? "task-details" : "my-tasks")
                }
              />
            )}

            {page === "categories" && (
              <Categories
                categories={categories}
                onCreate={handleCreateCategory}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            )}

            {page === "profile" && (
              <Profile
                user={user}
                onSave={(updatedUser) => {
                  setUser(updatedUser);
                  showToast("Profile saved!");
                }}
                showToast={showToast}
              />
            )}

            {page === "settings" && <Settings showToast={showToast} />}
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav current={page} onNav={handleNav} />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
