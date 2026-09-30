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

export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
export async function removeAvatar() {
  const response = await api.delete('/users/me/avatar')

  return response.data
}