import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react'

export default function TaskFilters({
  searchQuery,
  onSearch,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  categories,
  sortField,
  onSortChange,
  onClearFilters,
}) {
  return (
    <>
      {/* Search + filter row */}
      <div className="my-tasks-toolbar">
        <div className="my-tasks-search">
          <Search size={15} />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tasks…"
          />

          {searchQuery && (
            <button
              type="button"
              className="my-tasks-search-clear"
              onClick={() => onSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleFilters}
          className={`my-tasks-filter-button ${
            showFilters || activeFilterCount > 0
              ? 'my-tasks-filter-active'
              : ''
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters

          {activeFilterCount > 0 && (
            <span className="my-tasks-filter-count">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="my-tasks-sort">
          <select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
            <option value="createdAt">Newest</option>
          </select>

          <ChevronDown size={14} />
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="my-tasks-expanded-filters fade-in">
          <div className="my-tasks-filter-group">
            <p>Priority</p>

            <div className="my-tasks-filter-options">
              {['all', 'high', 'medium', 'low'].map(
                (priority) => (
                  <button
                    type="button"
                    key={priority}
                    onClick={() =>
                      onPriorityChange(priority)
                    }
                    className={`my-tasks-option ${
                      priorityFilter === priority
                        ? `my-tasks-priority-${priority}`
                        : 'my-tasks-option-inactive'
                    }`}
                  >
                    {priority === 'all'
                      ? 'All priorities'
                      : priority.charAt(0).toUpperCase() +
                        priority.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="my-tasks-filter-group">
            <p>Category</p>

            <div className="my-tasks-filter-options">
              <button
                type="button"
                onClick={() => onCategoryChange('all')}
                className={`my-tasks-option ${
                  categoryFilter === 'all'
                    ? 'my-tasks-option-brand'
                    : 'my-tasks-option-inactive'
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() =>
                    onCategoryChange(category.id)
                  }
                  className="my-tasks-option"
                  style={
                    categoryFilter === category.id
                      ? {
                          backgroundColor: category.color,
                          color: '#ffffff',
                        }
                      : {
                          backgroundColor: '#F5F5F7',
                          color: '#374151',
                        }
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="my-tasks-clear-wrapper">
              <button
                type="button"
                onClick={onClearFilters}
                className="my-tasks-clear-filters"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}