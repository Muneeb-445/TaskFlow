import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import ProtectedRoute from "./shared/components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./shared/components/PublicRoute/PublicRoute";
import TaskDetails from "./features/tasks/pages/TaskDetails";
import CreateEditTask from "./features/tasks/pages/CreateEditTask";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";

import Dashboard from "./features/dashboard/pages/Dashboard";
import MyTasks from "./features/tasks/pages/MyTasks";
import Categories from "./features/categories/pages/Categories";
import Profile from "./features/user/pages/Profile";
import Settings from "./features/user/pages/Settings";

function TaskDetailsRoute({
  tasks,
  categories,
  onBack,
  onEdit,
  onStart,
  onDelete,
  onComplete,
  onReopen,
}) {
  const { taskId } = useParams();

  const task = tasks.find((item) => item.id === Number(taskId));

  if (!task) {
    return <div className="task-not-found">Task not found.</div>;
  }

  return (
    <TaskDetails
      task={task}
      categories={categories}
      onBack={onBack}
      onEdit={() => onEdit(task.id)}
      onStart={() => onStart(task.id)}
      onDelete={() => onDelete(task.id)}
      onComplete={() => onComplete(task.id)}
      onReopen={() => onReopen(task.id)}
    />
  );
}

function EditTaskRoute({ tasks, categories, onSave, onBack }) {
  const { taskId } = useParams();

  const task = tasks.find((item) => item.id === Number(taskId));

  if (!task) {
    return <div className="task-not-found">Task not found.</div>;
  }

  return (
    <CreateEditTask
      task={task}
      categories={categories}
      onSave={onSave}
      onBack={onBack}
    />
  );
}

export default function AppRoutes({
  isLoggedIn,
  onLogin,
  onNav,
  categories,
  user,
  onSelectTask,
  onCreateTask,
  tasks,
  onEditTask,
  onStartTask,
  onReopenTask,
  onSaveTask,
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
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  showToast,
  onSaveUser,
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public routes */}

      <Route element={<PublicRoute isLoggedIn={isLoggedIn} />}>
        <Route
          path="/login"
          element={<Login onLogin={onLogin} onNav={onNav} />}
        />

        <Route path="/register" element={<Register onNav={onNav} />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword onNav={onNav} />}
        />
      </Route>

      {/* Protected routes */}

      <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
        <Route
          path="/dashboard"
          element={
            <Dashboard
              categories={categories}
              user={user}
              onNav={onNav}
              onSelectTask={onSelectTask}
              onCreateTask={onCreateTask}
            />
          }
        />

        <Route
          path="/tasks"
          element={
            <MyTasks
              tasks={tasks}
              categories={categories}
              onNav={onNav}
              onSelectTask={onSelectTask}
              onCreateTask={onCreateTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onCompleteTask={onCompleteTask}
              searchQuery={searchQuery}
              onSearch={onSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={onStatusFilterChange}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={onPriorityFilterChange}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={onCategoryFilterChange}
              sortField={sortField}
              onSortFieldChange={onSortFieldChange}
            />
          }
        />

        <Route
          path="/tasks/new"
          element={
            <CreateEditTask
              task={undefined}
              categories={categories}
              onSave={onSaveTask}
              onBack={() => navigate("/tasks")}
            />
          }
        />

        <Route
          path="/tasks/:taskId"
          element={
            <TaskDetailsRoute
              tasks={tasks}
              categories={categories}
              onBack={() => navigate("/tasks")}
              onEdit={onEditTask}
              onStart={onStartTask}
              onDelete={onDeleteTask}
              onComplete={onCompleteTask}
              onReopen={onReopenTask}
            />
          }
        />

        <Route
          path="/tasks/:taskId/edit"
          element={
            <EditTaskRoute
              tasks={tasks}
              categories={categories}
              onSave={onSaveTask}
              onBack={() => navigate("/tasks")}
            />
          }
        />

        <Route
          path="/categories"
          element={
            <Categories
              categories={categories}
              onCreate={onCreateCategory}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile user={user} onSave={onSaveUser} showToast={showToast} />
          }
        />

        <Route path="/settings" element={<Settings showToast={showToast} />} />
      </Route>

      {/* Fallback */}

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
