import api from '../../../shared/api/client'

function mapTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    categoryId: task.category_id,
    categoryName: task.category_name,
    priority: task.priority.toLowerCase(),
    status: task.status.toLowerCase(),
    dueDate: task.due_date,
    createdAt: task.created_at,
    completedAt: task.completed_at,
    isOverdue: task.is_overdue,
  }
}

function mapTaskPayload(task) {
  return {
    title: task.title,
    description: task.description || null,
    category_id: task.categoryId || null,
    priority: task.priority.toUpperCase(),
    due_date: task.dueDate || null
  }
}

export async function getTasks(params = {}) {
  const response = await api.get('/tasks', {
    params,
  })

  return {
    ...response.data,
    items: response.data.items.map(mapTask),
  }
}

export async function getTask(taskId) {
  const response = await api.get(`/tasks/${taskId}`)

  return mapTask(response.data)
}

export async function createTask(task) {
  const response = await api.post(
    '/tasks',
    mapTaskPayload(task)
  )

  return mapTask(response.data)
}

export async function updateTask(taskId, task) {
  const response = await api.patch(
    `/tasks/${taskId}`,
    mapTaskPayload(task)
  )

  return mapTask(response.data)
}

export async function deleteTask(taskId) {
  await api.delete(`/tasks/${taskId}`)
}

export async function startTask(taskId) {
  const response = await api.post(
    `/tasks/${taskId}/start`
  )

  return mapTask(response.data)
}

export async function completeTask(taskId) {
  const response = await api.post(
    `/tasks/${taskId}/complete`
  )

  return mapTask(response.data)
}

export async function reopenTask(taskId) {
  const response = await api.post(
    `/tasks/${taskId}/reopen`
  )

  return mapTask(response.data)
}