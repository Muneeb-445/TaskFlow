export const CATEGORY_COLORS = [
  '#7C3AED',
  '#0D9488',
  '#F97316',
  '#2563EB',
  '#DB2777',
  '#16A34A',
]

export function getCategoryColor(categoryId) {
  return CATEGORY_COLORS[
    categoryId % CATEGORY_COLORS.length
  ]
}