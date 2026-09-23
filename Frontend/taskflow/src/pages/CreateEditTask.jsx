import { useState } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'

import './CreateEditTask.css'

function Field({ label, error, children }) {
  return (
    <div className="task-field">
      <label className="task-field-label">
        {label}
      </label>

      {children}

      {error && (
        <p className="task-field-error">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (err) =>
  `task-input ${err ? 'task-input-error' : ''}`

export default function CreateEditTask({
  task,
  categories,
  onSave,
  onBack,
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(
    task?.description ?? ''
  )
  const [categoryId, setCategoryId] = useState(
    task?.categoryId ?? (categories[0]?.id ?? '')
  )
  const [priority, setPriority] = useState(
    task?.priority ?? 'medium'
  )
  const [status, setStatus] = useState(
    task?.status ?? 'todo'
  )
  const [dueDate, setDueDate] = useState(
    task?.dueDate ?? ''
  )
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const validate = () => {
    const validationErrors = {}

    if (!title.trim()) {
      validationErrors.title = 'Task title is required.'
    }

    if (!dueDate) {
      validationErrors.dueDate = 'Due date is required.'
    }

    return validationErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSaved(true)

    setTimeout(() => {
      onSave({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        status,
        dueDate,
      })
    }, 500)
  }

  const priorityOpts = [
    {
      val: 'low',
      label: 'Low',
      color: '#3B82F6',
    },
    {
      val: 'medium',
      label: 'Medium',
      color: '#F59E0B',
    },
    {
      val: 'high',
      label: 'High',
      color: '#EF4444',
    },
  ]

  const statusOpts = [
    {
      val: 'todo',
      label: 'To Do',
    },
    {
      val: 'in_progress',
      label: 'In Progress',
    },
    {
      val: 'completed',
      label: 'Completed',
    },
    {
      val: 'overdue',
      label: 'Overdue',
    },
  ]

  return (
    <div className="create-edit-task-page fade-in">
      <button
        type="button"
        onClick={onBack}
        className="create-edit-back-button"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="create-edit-header">
        <h1 className="create-edit-title">
          {task ? 'Edit Task' : 'Create Task'}
        </h1>

        <p className="create-edit-subtitle">
          {task
            ? 'Update the details below.'
            : 'Fill in the details to create a new task.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="create-edit-form"
      >
        <Field
          label="Task Title"
          error={errors.title}
        >
          <input
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)

              if (errors.title) {
                setErrors((current) => ({
                  ...current,
                  title: '',
                }))
              }
            }}
            placeholder="What needs to be done?"
            className={inputCls(errors.title)}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Add more context or notes..."
            rows={3}
            className={`${inputCls()} task-description-input`}
          />
        </Field>

        <div className="task-two-column-grid">
          <Field label="Category">
            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className={`${inputCls()} task-select`}
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className={`${inputCls()} task-select`}
            >
              {statusOpts.map((option) => (
                <option
                  key={option.val}
                  value={option.val}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Priority">
          <div className="priority-options">
            {priorityOpts.map(
              ({ val, label, color }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPriority(val)}
                  className={`priority-option ${
                    priority === val
                      ? 'priority-option-active'
                      : ''
                  }`}
                  style={
                    priority === val
                      ? {
                          backgroundColor: color,
                          borderColor: color,
                        }
                      : {}
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
        </Field>

        <Field
          label="Due Date"
          error={errors.dueDate}
        >
          <input
            type="date"
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value)

              if (errors.dueDate) {
                setErrors((current) => ({
                  ...current,
                  dueDate: '',
                }))
              }
            }}
            className={inputCls(errors.dueDate)}
          />
        </Field>

        <div className="create-edit-actions">
          <button
            type="submit"
            disabled={saved}
            className="create-edit-submit"
          >
            {saved ? (
              <>
                <CheckCircle size={16} />
                {task ? 'Updated!' : 'Created!'}
              </>
            ) : (
              task ? 'Save Changes' : 'Create Task'
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="create-edit-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}