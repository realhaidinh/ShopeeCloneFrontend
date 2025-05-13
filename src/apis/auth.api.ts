import { TypeOfVerificationCodeType } from 'src/constants/auth.constant'
import { AuthResponse, LoginResponse } from 'src/types/auth.type'
import http from 'src/utils/http'

const authApi = {
  sendOTPRegister(body: { email: string; type: TypeOfVerificationCodeType }) {
    return http.post('/auth/otp', body)
  },

  registerAccount(body: { email: string; password: string }) {
    return http.post<AuthResponse>('/auth/register', body)
  },

  login(body: { email: string; password: string }) {
    return http.post<LoginResponse>('/auth/login', body)
  },

  logout(body: { refreshToken: string }) {
    return http.post('/auth/logout', body)
  }
}

export default authApi
