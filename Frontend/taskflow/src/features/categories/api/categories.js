import api from '../../../api/client'
import { getCategoryColor } from '../utils/categoryColors'

export async function getCategories() {
  const response = await api.get('/categories')

  return response.data.map((category) => ({
    ...category,
    color: getCategoryColor(category.id),
  }))
}

export async function createCategory(name) {
  const response = await api.post('/categories', {
    name,
  })

  return response.data
}

export async function updateCategory(categoryId, name) {
  const response = await api.patch(
    `/categories/${categoryId}`,
    {
      name,
    }
  )

  return response.data
}

export async function deleteCategory(categoryId) {
  await api.delete(`/categories/${categoryId}`)
}