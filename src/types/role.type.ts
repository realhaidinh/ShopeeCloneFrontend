import { Permission } from 'src/types/permission.type'

export interface Role {
  id: number
  name: string
  description: string
  isActive: boolean
  permissions?: Permission[]
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RoleList {
  data: Role[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}
