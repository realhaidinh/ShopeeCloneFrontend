export const VerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  LOGIN: 'LOGIN',
  DISABLE_2FA: 'DISABLE_2FA'
} as const

export type TypeOfVerificationCodeType = typeof VerificationCode[keyof typeof VerificationCode]
