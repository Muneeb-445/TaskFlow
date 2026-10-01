import { useState, useEffect } from "react";
import AppRoutes from "./AppRoutes";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "./shared/components/Toast/Toast";
import useToast from "./shared/hooks/useToast";
import Sidebar, { BottomNav } from "./shared/components/Sidebar/Sidebar";
import Header from "./shared/components/Header/Header";
import ErrorBoundary from "./shared/components/ErrorBoundry/errorBoundary";

import useAuth from "./features/auth/hooks/useAuth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
  reopenTask,
} from "./features/tasks/api/tasks";

import "./App.css";
import { getCurrentUser } from "./features/user/api/users";
import { getCategories } from "./features/categories/api/categories";
import useCategories from "./features/categories/hooks/useCategories";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(
    location.pathname,
  );
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
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
  const showAuthLayout = !isLoggedIn || isAuthPage;

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
      } catch {
        localStorage.removeItem("access_token");
        logout();
        navigate("/login");
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
      navigate("/dashboard");
    } catch {
      localStorage.removeItem("access_token");
      logout();
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    logout();
    navigate("/login");
  };

  const handleNav = (nextPage) => {
    const routes = {
      login: "/login",
      register: "/register",
      "forgot-password": "/forgot-password",
      dashboard: "/dashboard",
      "my-tasks": "/tasks",
      categories: "/categories",
      profile: "/profile",
      settings: "/settings",
    };

    const route = routes[nextPage];

    if (route) {
      navigate(route);
    }

    if (nextPage !== "my-tasks") {
      setSearchQuery("");
    }
  };

  const handleSelectTask = (id) => {
    navigate(`/tasks/${id}`);
  };

  const handleCreateTask = () => {
    navigate("/tasks/new");
  };

  const handleEditTask = (id) => {
    navigate(`/tasks/${id}/edit`);
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
    const editMatch = location.pathname.match(/^\/tasks\/(\d+)\/edit$/);

    if (editMatch) {
      const taskId = Number(editMatch[1]);

      try {
        const updatedTask = await updateTask(taskId, data);

        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
        );

        showToast("Task updated!");

        navigate(`/tasks/${taskId}`);
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

      navigate("/tasks");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to create task.";

      showToast(message, "error");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));

      showToast("Task deleted.", "info");
      navigate("/tasks");
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
  return showAuthLayout ? (
    <div className="app-auth">
      <AppRoutes
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onNav={handleNav}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  ) : (
    <div className="app-layout">
      <Sidebar onNav={handleNav} onLogout={handleLogout} />

      <div className="app-content">
        <Header
          user={user}
          onNav={handleNav}
          onLogout={handleLogout}
          onCreateTask={handleCreateTask}
          searchQuery={searchQuery}
          onSearch={(query) => {
            setSearchQuery(query);

            if (query && location.pathname !== "/tasks") {
              navigate("/tasks");
            }
          }}
        />

        <main className="app-main">
          <ErrorBoundary onReset={() => navigate("/dashboard")}>
            <AppRoutes
              isLoggedIn={isLoggedIn}
              onLogin={handleLogin}
              onNav={handleNav}
              categories={categories}
              user={user}
              onSelectTask={handleSelectTask}
              onCreateTask={handleCreateTask}
              tasks={tasks}
              onEditTask={handleEditTask}
              onStartTask={handleStartTask}
              onReopenTask={handleReopenTask}
              onSaveTask={handleSaveTask}
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
              onCreateCategory={handleCreateCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              showToast={showToast}
              onSaveUser={setUser}
            />
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav onNav={handleNav} />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
