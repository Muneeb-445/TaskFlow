import { useState, useEffect } from "react";

import AppRoutes from "./AppRoutes";

import { useLocation, useNavigate } from "react-router-dom";

import Toast from "./shared/components/Toast/Toast";

import useToast from "./shared/hooks/useToast";

import Sidebar, { BottomNav } from "./shared/components/Sidebar/Sidebar";

import Header from "./shared/components/Header/Header";

import ErrorBoundary from "./shared/components/ErrorBoundry/errorBoundary";

import useAuth from "./features/auth/hooks/useAuth";

import useTasks from "./features/tasks/hooks/useTasks";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("all");
  const [taskSortField, setTaskSortField] = useState("dueDate");

  const { toasts, showToast, removeToast } = useToast();

  const {
    categories,
    setCategories,
    loadCategories,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
  } = useCategories([], showToast);

  const {
    tasks,
    loadTasks,
    handleCreateTask: createTask,
    handleUpdateTask,
    handleDeleteTask,
    handleStartTask,
    handleCompleteTask,
    handleReopenTask,
  } = useTasks(showToast, loadCategories);

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

        setUser(currentUser);
        setCategories(userCategories);

        await loadTasks();

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

      setUser(currentUser);
      setCategories(userCategories);

      await loadTasks();

      completeLogin();
      navigate("/dashboard");
    } catch {
      localStorage.removeItem("access_token");
      logout();
      navigate("/login");
    }
  };
  const handleDeleteTaskAndNavigate = async (taskId) => {
    try {
      await handleDeleteTask(taskId);

      if (location.pathname === `/tasks/${taskId}`) {
        navigate("/tasks");
      }
    } catch {
      // Error toast is already handled by useTasks.
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

 const handleSaveTask = async (data) => {
  const editMatch = location.pathname.match(/^\/tasks\/(\d+)\/edit$/);

  if (editMatch) {
    const taskId = Number(editMatch[1]);

    try {
      await handleUpdateTask(taskId, data);
      navigate(`/tasks/${taskId}`);
    } catch {
      // Error toast is already handled by useTasks.
    }

    return;
  }

  try {
    await createTask(data);
    navigate("/tasks");
  } catch {
    // Error toast is already handled by useTasks.
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
              onDeleteTask={handleDeleteTaskAndNavigate}
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
