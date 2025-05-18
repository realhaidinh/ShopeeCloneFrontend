import { Permission } from 'src/types/permission.type'

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export interface Role {
  id: number
  name: string
  permissions?: Permission[]
}

export interface User {
  id: number
  email: string
  name: string
  password?: string
  phoneNumber: string
  avatar: string | null
  totpSecret?: string | null
  status: typeof UserStatus[keyof typeof UserStatus]
  roleId: number
  role?: Role
  createdById: number | null
  updatedById: number | null
  deletedById: number | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserList {
  data: User[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateProfileReqBody {
  name: string
  phoneNumber: string
  avatar: string
}

export interface ChangePasswordReqBody {
  password: string
  newPassword: string
  confirmNewPassword: string
}

//Response User type
export interface CreateUserReqBody {
  status: typeof UserStatus[keyof typeof UserStatus]
  email: string
  password: string
  name: string
  phoneNumber: string
  roleId: number
  avatar: string
}

//Response User type

export interface UpdateUserReqBody {
  status: typeof UserStatus[keyof typeof UserStatus]
  name: string
  phoneNumber: string
  roleId: number
  avatar: string
}

//Delete response message
