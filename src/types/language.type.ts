export interface Language {
  id: string
  name: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LanguageList {
  data: Language[]
  totalItems: number
}

export interface CreateLanguageReqBody {
  id: string
  name: string
}

export interface UpdateLanguageReqBody {
  name: string
}
