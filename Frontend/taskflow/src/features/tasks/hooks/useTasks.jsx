import { useState } from "react";

import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
  reopenTask,
} from "../api/tasks";

export default function useTasks(showToast, onTaskChanged) {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    const taskData = await getTasks();
    setTasks(taskData.items);
  };

  const loadTask = async (taskId) => {
    const task = await getTask(taskId);

    setTasks((currentTasks) => {
      const exists = currentTasks.some(
        (currentTask) => currentTask.id === task.id,
      );

      if (exists) {
        return currentTasks.map((currentTask) =>
          currentTask.id === task.id ? task : currentTask,
        );
      }

      return [task, ...currentTasks];
    });

    return task;
  };

  const handleCreateTask = async (data) => {
    try {
      const newTask = await createTask(data);

      setTasks((currentTasks) => [newTask, ...currentTasks]);

      try {
        await onTaskChanged?.();
      } catch {
        // Task was created successfully.
      }

      showToast("Task created! 🎉");

      return newTask;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to create task.";

      showToast(message, "error");

      throw error;
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    try {
      const updatedTask = await updateTask(taskId, data);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );

      try {
        await onTaskChanged?.();
      } catch {
        // Task was updated successfully.
      }

      showToast("Task updated!");

      return updatedTask;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to update task.";

      showToast(message, "error");

      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );

      try {
        await onTaskChanged?.();
      } catch {
        // Task was deleted successfully.
      }

      showToast("Task deleted.", "info");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to delete task.";

      showToast(message, "error");

      throw error;
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      const updatedTask = await startTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );

      try {
        await onTaskChanged?.();
      } catch {
        // Task was started successfully.
      }

      showToast("Task started!");

      return updatedTask;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to start task.";

      showToast(message, "error");

      throw error;
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const updatedTask = await completeTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );

      try {
        await onTaskChanged?.();
      } catch {
        // Task was completed successfully.
      }

      showToast("Task completed! 🎉");

      return updatedTask;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to complete task.";

      showToast(message, "error");

      throw error;
    }
  };

  const handleReopenTask = async (taskId) => {
    try {
      const updatedTask = await reopenTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );

      try {
        await onTaskChanged?.();
      } catch {
        // Task was reopened successfully.
      }

      showToast("Task reopened.", "info");

      return updatedTask;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to reopen task.";

      showToast(message, "error");

      throw error;
    }
  };

  return {
    tasks,
    setTasks,
    loadTasks,
    loadTask,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleStartTask,
    handleCompleteTask,
    handleReopenTask,
  };
}