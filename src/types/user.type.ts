export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export interface User {
  id: number
  email: string
  name: string
  password: string
  phoneNumber: string
  avatar: string | null
  totpSecret: string | null
  status: typeof UserStatus[keyof typeof UserStatus]
  roleId: number
  createdById: number | null
  updatedById: number | null
  deletedById: number | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
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
