import api from './client'

export async function getCurrentUser() {
  const response = await api.get('/users/me')

  return response.data
}