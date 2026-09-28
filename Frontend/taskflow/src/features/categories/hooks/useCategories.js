import { useState } from 'react'

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categories'

export default function useCategories(
  initialCategories = [],
  showToast
) {
  const [categories, setCategories] =
    useState(initialCategories)

  const handleCreateCategory = async (
    name,
    color
  ) => {
    try {
      const newCategory = await createCategory(name)

      setCategories((currentCategories) => [
        ...currentCategories,
        {
          ...newCategory,
          color,
        },
      ])

      showToast(`Category "${name}" created!`)
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        'Failed to create category.'

      showToast(message, 'error')
    }
  }

  const handleEditCategory = async (
    id,
    name,
    color
  ) => {
    try {
      const updatedCategory = await updateCategory(
        id,
        name
      )

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === id
            ? {
                ...updatedCategory,
                color,
              }
            : category
        )
      )

      showToast('Category updated!')
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        'Failed to update category.'

      showToast(message, 'error')
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id)

      setCategories((currentCategories) =>
        currentCategories.filter(
          (category) => category.id !== id
        )
      )

      showToast('Category deleted.', 'info')
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        'Failed to delete category.'

      showToast(message, 'error')
    }
  }

  return {
    categories,
    setCategories,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
  }
}