export interface CategoryTranslation {
  id: number
  categoryId: number
  languageId: string
  name: string
  description: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  parentCategoryId: number | null
  name: string
  logo: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  categoryTranslations: CategoryTranslation[]
}

export interface CategoryListResponse {
  data: Category[]
  totalItems: number
}
