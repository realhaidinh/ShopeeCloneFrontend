import { TypeOfVerificationCodeType } from 'src/constants/auth.constant'
import { AuthResponse, LoginResponse } from 'src/types/auth.type'
import http from 'src/utils/http'

export const sendOTPRegister = (body: { email: string; type: TypeOfVerificationCodeType }) =>
  http.post('/auth/otp', body)

export const registerAccount = (body: { email: string; password: string }) =>
  http.post<AuthResponse>('/auth/register', body)

export const login = (body: { email: string; password: string }) => http.post<LoginResponse>('/auth/login', body)

export const logout = (body: { refreshToken: string }) => http.post('/auth/logout', body)
