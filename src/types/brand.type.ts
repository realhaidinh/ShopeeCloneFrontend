export interface BrandTranslation {
  id: number
  brandId: number
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

export interface CreateBrandTranslationReqBody {
  brandId: number
  languageId: string
  name: string
  description: string
}

export interface UpdateBrandTranslationReqBody {
  brandId: number
  languageId: string
  name: string
  description: string
}

export interface Brand {
  id: number
  name: string
  logo: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  brandTranslations: BrandTranslation[]
}

export interface BrandListResponse {
  data: Brand[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateBrandReqBody {
  name: string
  logo: string
}

export interface UpdateBrandReqBody {
  name: string
  logo: string
}
