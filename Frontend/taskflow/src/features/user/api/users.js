import api from '../../../api/client'

export async function getCurrentUser() {
  const response = await api.get('/users/me')

  return response.data
}