export const orderBy = {
  Asc: 'asc',
  Desc: 'desc'
} as const

export type OrderBy = typeof orderBy[keyof typeof orderBy]

export const sortBy = {
  Sale: 'sale',
  Price: 'price',
  CreatedAt: 'createdAt'
} as const

export type SortBy = typeof sortBy[keyof typeof sortBy]
