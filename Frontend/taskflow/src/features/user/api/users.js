import api from '../../../shared/api/client'

export async function getCurrentUser() {
  const response = await api.get('/users/me')

  return response.data
}

export async function updateCurrentUser(userData) {
  const response = await api.patch('/users/me', userData)
  return response.data
}

export async function changePassword(passwordData) {
  const response = await api.patch('/users/me/password', passwordData)
  return response.data
}