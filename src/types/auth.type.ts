import { User } from 'src/types/user.type'
import { ResponseApi } from 'src/types/utils.type'

export type AuthResponse = ResponseApi<{
  user: Omit<User, 'password' | 'totpSecret'>
}>

export type LoginResponse = {
  message: string
  data: {
    accessToken: string
    refreshToken: string
    user: Omit<User, 'password' | 'totpSecret'>
  }
}
