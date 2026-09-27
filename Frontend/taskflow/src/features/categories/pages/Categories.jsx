import { useState } from 'react'
import {
  Plus,
  Tag,
} from 'lucide-react'

import './Categories.css'
import DeleteCategoryModal from '../components/DeleteCategoryModal'
import CategoryModal from '../components/CategoryModal'
import CategoryCard from '../components/CategoryCard'

export default function Categories({
  categories,
  onCreate,
  onEdit,
  onDelete,
}) {
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  return (
    <div className="categories-page fade-in">
      <div className="categories-header">
        <div>
          <h1 className="categories-title">
            Categories
          </h1>

          <p className="categories-count">
            {categories.length} categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal('create')}
          className="categories-create-button"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="categories-empty">
          <Tag
            size={40}
            className="categories-empty-icon"
          />

          <p className="categories-empty-title">
            No categories yet
          </p>

          <p className="categories-empty-message">
            Create categories to organize your tasks.
          </p>

          <button
            type="button"
            onClick={() => setModal('create')}
            className="categories-create-button"
          >
            <Plus size={16} />
            Create Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setModal}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {modal === 'create' && (
        <CategoryModal
          onSave={(name, color) => {
            onCreate(name, color)
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal && modal !== 'create' && (
        <CategoryModal
          initial={modal}
          onSave={(name, color) => {
            onEdit(modal.id, name, color)
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}

      {deleting && (
        <DeleteCategoryModal
          category={deleting}
          taskCount={deleting.task_count}
          onConfirm={() => {
            onDelete(deleting.id)
            setDeleting(null)
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}