export interface Permission {
  id: number
  name: string
  module: string
  path: string
  method: string
}

export interface PermissionList {
  data: Permission[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}
