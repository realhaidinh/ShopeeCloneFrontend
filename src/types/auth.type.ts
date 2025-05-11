import { User } from '@/types/user.type'
import { ResponseApi } from '@/types/utils.type'

export type AuthResponse = ResponseApi<{
  user: Omit<User, 'password' | 'totpSecret'>
}>

export type LoginResponse = {
  message: string
  data: {
    accessToken: string
    refreshToken: string
  }
}
