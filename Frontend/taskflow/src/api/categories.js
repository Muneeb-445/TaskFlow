import api from './client'

const CATEGORY_COLORS = [
  '#7C3AED',
  '#0D9488',
  '#F97316',
  '#2563EB',
  '#DB2777',
  '#16A34A',
]

function getCategoryColor(categoryId) {
  return CATEGORY_COLORS[
    categoryId % CATEGORY_COLORS.length
  ]
}

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