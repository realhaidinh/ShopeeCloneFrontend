import { AuthResponse, LoginResponse } from '@/types/auth.type'
import http from '@/utils/http'

export const registerAccount = (body: { email: string; password: string }) =>
  http.post<AuthResponse>('/auth/register', body)

export const login = (body: { email: string; password: string }) => http.post<LoginResponse>('/auth/login', body)
