export const initialUser = {
  name: 'Muneeb Hassan',
  email: 'muneeb@taskflow.io',
  bio: 'Product designer and developer building delightful productivity tools.',
}

export const initialCategories = [
  { id: 'c1', name: 'Work', color: '#7C3AED' },
  { id: 'c2', name: 'Personal', color: '#F97316' },
  { id: 'c3', name: 'Health', color: '#0D9488' },
  { id: 'c4', name: 'Finance', color: '#FFB800' },
  { id: 'c5', name: 'Learning', color: '#3B82F6' },
]

export const initialTasks = [
  {
    id: 't1',
    title: 'Design new onboarding flow',
    description:
      'Create wireframes and high-fidelity designs for the updated onboarding experience targeting new B2B customers. Include mobile and desktop variants.',
    categoryId: 'c1',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-09-05',
    createdAt: '2026-08-20',
  },
  {
    id: 't2',
    title: 'Write Q3 performance review',
    description:
      'Document team achievements, challenges, and goals for the upcoming Q3 performance review cycle.',
    categoryId: 'c1',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-09-04',
    createdAt: '2026-08-25',
  },
  {
    id: 't3',
    title: 'Review marketing budget proposal',
    description:
      'Go through the 2026 Q4 marketing budget and provide feedback to the finance team by EOD Friday.',
    categoryId: 'c4',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-09-06',
    createdAt: '2026-08-28',
  },
  {
    id: 't4',
    title: 'Morning run — 5km',
    description:
      'Keep the streak alive. Run at least 5km before 8am at the park.',
    categoryId: 'c3',
    priority: 'medium',
    status: 'completed',
    dueDate: '2026-09-03',
    createdAt: '2026-09-01',
    completedAt: '2026-09-03',
  },
  {
    id: 't5',
    title: 'Finish React advanced patterns course',
    description:
      'Complete modules 8–12 on the advanced React patterns course on Frontend Masters.',
    categoryId: 'c5',
    priority: 'low',
    status: 'in_progress',
    dueDate: '2026-09-10',
    createdAt: '2026-08-15',
  },
  {
    id: 't6',
    title: 'Fix auth bug in API gateway',
    description:
      'The JWT token refresh logic is failing for some enterprise users — investigate and deploy a fix to production.',
    categoryId: 'c1',
    priority: 'high',
    status: 'overdue',
    dueDate: '2026-09-01',
    createdAt: '2026-08-30',
  },
  {
    id: 't7',
    title: 'Rebalance investment portfolio',
    description:
      'Review and rebalance the investment portfolio. Target 60/30/10 split across equities, bonds, and alternatives.',
    categoryId: 'c4',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-09-15',
    createdAt: '2026-09-01',
  },
  {
    id: 't8',
    title: 'Grocery shopping for the week',
    description:
      'Pick up vegetables, proteins, and pantry staples.',
    categoryId: 'c2',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-09-02',
    createdAt: '2026-09-01',
    completedAt: '2026-09-02',
  },
  {
    id: 't9',
    title: 'Prepare demo for investors',
    description:
      'Build the product demo deck and rehearse the Series A pitch for Wednesday.',
    categoryId: 'c1',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-09-07',
    createdAt: '2026-08-29',
  },
  {
    id: 't10',
    title: 'Read "The Almanack of Naval Ravikant"',
    description:
      'Finish the remaining 100 pages and take structured notes for the book club.',
    categoryId: 'c5',
    priority: 'low',
    status: 'in_progress',
    dueDate: '2026-09-20',
    createdAt: '2026-08-10',
  },
  {
    id: 't11',
    title: 'Schedule annual health checkup',
    description:
      'Book appointments for blood work, eye exam, and dental cleaning.',
    categoryId: 'c3',
    priority: 'medium',
    status: 'overdue',
    dueDate: '2026-08-31',
    createdAt: '2026-08-01',
  },
  {
    id: 't12',
    title: 'Write blog post on design systems',
    description:
      'Share learnings from building the internal design system. Target 1500 words on the Substack.',
    categoryId: 'c1',
    priority: 'low',
    status: 'todo',
    dueDate: '2026-09-12',
    createdAt: '2026-09-01',
  },
  {
    id: 't13',
    title: 'Set up home office ergonomics',
    description:
      'Order monitor stand, mechanical keyboard, and mousepad. Adjust chair height.',
    categoryId: 'c2',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-09-01',
    createdAt: '2026-08-25',
    completedAt: '2026-08-31',
  },
  {
    id: 't14',
    title: 'Complete TypeScript handbook chapters',
    description:
      'Work through chapters 5–10 on advanced types, generics, and utility types.',
    categoryId: 'c5',
    priority: 'medium',
    status: 'completed',
    dueDate: '2026-08-30',
    createdAt: '2026-08-15',
    completedAt: '2026-08-28',
  },
]

export const weeklyData = [
  { day: 'Mon', completed: 4, created: 6 },
  { day: 'Tue', completed: 6, created: 5 },
  { day: 'Wed', completed: 3, created: 7 },
  { day: 'Thu', completed: 7, created: 4 },
  { day: 'Fri', completed: 5, created: 8 },
  { day: 'Sat', completed: 2, created: 3 },
  { day: 'Sun', completed: 1, created: 2 },
]