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

//Response CategoryTranslation type
export interface CreateCategoryTranslationReqBody {
  categoryId: number
  languageId: string
  name: string
  description: string
}

//Response CategoryTranslation type
export interface UpdateCategoryTranslationReqBody {
  categoryId: number
  languageId: string
  name: string
  description: string
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

//Response Category type
export interface CreateCategoryReqBody {
  parentCategoryId: number | null
  name: string
  logo: string
}

//Response Category type
export interface UpdateCategoryReqBody {
  parentCategoryId: number | null
  name: string
  logo: string
}

//Delete response message
