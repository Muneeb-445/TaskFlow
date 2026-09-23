import { useState, useCallback } from 'react'
import { initialTasks, initialCategories, initialUser } from './data'

import Toast from './components/Toast'
import Sidebar, { BottomNav } from './components/Sidebar'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import MyTasks from './pages/MyTasks'
import TaskDetails from './pages/TaskDetails'
import CreateEditTask from './pages/CreateEditTask'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

import './App.css'

let taskIdCounter = 100
let catIdCounter = 100

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(initialUser)
  const [tasks, setTasks] = useState(initialTasks)
  const [categories, setCategories] = useState(initialCategories)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)

    setToasts((toasts) => [
      ...toasts,
      {
        id,
        type,
        message,
      },
    ])

    setTimeout(() => {
      setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  const removeToast = (id) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPage('login')
  }

  const handleNav = (nextPage) => {
    setPage(nextPage)

    if (nextPage !== 'my-tasks') {
      setSearchQuery('')
    }
  }

  const handleSelectTask = (id) => {
    setSelectedTaskId(id)
    setPage('task-details')
  }

  const handleCreateTask = () => {
    setEditingTaskId(null)
    setPage('create-task')
  }

  const handleEditTask = (id) => {
    setEditingTaskId(id)
    setPage('edit-task')
  }

  const handleSaveTask = (data) => {
    if (editingTaskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...data,
                completedAt:
                  data.status === 'completed'
                    ? task.completedAt ?? today
                    : undefined,
              }
            : task
        )
      )

      showToast('Task updated!')

      setPage(
        selectedTaskId === editingTaskId
          ? 'task-details'
          : 'my-tasks'
      )
    } else {
      const newTask = {
        id: `t${++taskIdCounter}`,
        ...data,
        createdAt: today,
        completedAt:
          data.status === 'completed' ? today : undefined,
      }

      setTasks((currentTasks) => [newTask, ...currentTasks])

      showToast('Task created! 🎉')
      setPage('my-tasks')
    }
  }

  const handleDeleteTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    )

    if (page === 'task-details') {
      setPage('my-tasks')
    }

    showToast('Task deleted.', 'info')
  }

  const handleCompleteTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== id) {
          return task
        }

        const completing = task.status !== 'completed'

        return {
          ...task,
          status: completing ? 'completed' : 'todo',
          completedAt: completing ? today : undefined,
        }
      })
    )

    const task = tasks.find((task) => task.id === id)

    if (task?.status !== 'completed') {
      showToast('Task completed! 🎉')
    }
  }

  const handleReopenTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: 'todo',
              completedAt: undefined,
            }
          : task
      )
    )

    showToast('Task reopened.', 'info')
  }

  const handleCreateCategory = (name, color) => {
    setCategories((currentCategories) => [
      ...currentCategories,
      {
        id: `c${++catIdCounter}`,
        name,
        color,
      },
    ])

    showToast(`Category "${name}" created!`)
  }

  const handleEditCategory = (id, name, color) => {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === id
          ? {
              ...category,
              name,
              color,
            }
          : category
      )
    )

    showToast('Category updated!')
  }

  const handleDeleteCategory = (id) => {
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== id)
    )

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.categoryId === id
          ? {
              ...task,
              categoryId: '',
            }
          : task
      )
    )

    showToast(
      'Category deleted. Tasks moved to Uncategorized.',
      'info'
    )
  }

  /*
   * Authentication screens
   */
  if (!isLoggedIn) {
    return (
      <div className="app-auth">
        <Toast
          toasts={toasts}
          onRemove={removeToast}
        />

        {page === 'login' && (
          <Login
            onLogin={handleLogin}
            onNav={handleNav}
          />
        )}

        {page === 'register' && (
          <Register
            onRegister={handleLogin}
            onNav={handleNav}
          />
        )}

        {page === 'forgot-password' && (
          <ForgotPassword
            onNav={handleNav}
          />
        )}
      </div>
    )
  }

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null

  const editingTask = editingTaskId
    ? tasks.find((task) => task.id === editingTaskId)
    : undefined

  return (
    <div className="app-layout">
      <Sidebar
        current={page}
        onNav={handleNav}
        onLogout={handleLogout}
      />

      <div className="app-content">
        <Header
          user={user}
          onNav={handleNav}
          onLogout={handleLogout}
          onCreateTask={handleCreateTask}
          searchQuery={searchQuery}
          onSearch={(query) => {
            setSearchQuery(query)

            if (query && page !== 'my-tasks') {
              setPage('my-tasks')
            }
          }}
        />

        <main className="app-main">
          <ErrorBoundary
            onReset={() => setPage('dashboard')}
          >
            {page === 'dashboard' && (
              <Dashboard
                tasks={tasks}
                categories={categories}
                user={user}
                onNav={handleNav}
                onSelectTask={handleSelectTask}
                onCreateTask={handleCreateTask}
              />
            )}

            {page === 'my-tasks' && (
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
              />
            )}

            {page === 'task-details' && selectedTask && (
              <TaskDetails
                task={selectedTask}
                categories={categories}
                onBack={() => setPage('my-tasks')}
                onEdit={() =>
                  handleEditTask(selectedTask.id)
                }
                onDelete={() =>
                  handleDeleteTask(selectedTask.id)
                }
                onComplete={() =>
                  handleCompleteTask(selectedTask.id)
                }
                onReopen={() =>
                  handleReopenTask(selectedTask.id)
                }
              />
            )}

            {page === 'task-details' && !selectedTask && (
              <div className="task-not-found">
                Task not found.
              </div>
            )}

            {(page === 'create-task' ||
              page === 'edit-task') && (
              <CreateEditTask
                task={editingTask}
                categories={categories}
                onSave={handleSaveTask}
                onBack={() =>
                  setPage(
                    editingTaskId
                      ? 'task-details'
                      : 'my-tasks'
                  )
                }
              />
            )}

            {page === 'categories' && (
              <Categories
                categories={categories}
                tasks={tasks}
                onCreate={handleCreateCategory}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            )}

            {page === 'profile' && (
              <Profile
                user={user}
                onSave={(updatedUser) => {
                  setUser(updatedUser)
                  showToast('Profile saved!')
                }}
                showToast={showToast}
              />
            )}

            {page === 'settings' && (
              <Settings
                showToast={showToast}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav
        current={page}
        onNav={handleNav}
      />

      <Toast
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  )
}
