import { useMutation } from '@tanstack/react-query'
import { Button, Input, message, Spin, Steps } from 'antd'
import { useState } from 'react'
import authApi from 'src/apis/auth.api'
import { VerificationCode } from 'src/constants/auth.constant'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { emailType } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { LoadingOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPasswordReqBody } from 'src/types/auth.type'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [errCode, setErrCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errNewPassword, setErrNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [errConfirmNewPassword, setErrConfirmNewPassword] = useState('')
  const [step, setStep] = useState(0)

  const onChange = (value: number) => {
    if (value === 1 && !email) {
      message.warning('Vui lòng nhập email!')
      return
    }
    setStep(value)
  }

  const onSubmit = () => {
    console.log(email, code, newPassword, confirmNewPassword)
    forgorPasswordMutation.mutate(
      { email, code, newPassword, confirmNewPassword },
      {
        onSuccess: () => {
          message.success('Đổi mật khẩu thành công')
          navigate('/login')
        },
        onError: (error) => {
          if (isAxiosUnprocessableEntityError<ResponseUnprocessableEntityApi<any>>(error)) {
            const formError = error.response?.data.message
            if (formError) {
              formError.forEach((err) => {
                if (err.path === 'code') {
                  setErrCode(err.message)
                }
                if (err.path === 'newPassword') {
                  setErrNewPassword(err.message)
                }
                if (err.path === 'confirmNewPassword') {
                  setErrConfirmNewPassword(err.message)
                }
              })
              message.error('Đổi mật nhập thất bại. Vui lòng kiểm tra lại.')
              return
            }
          }
          message.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.')
        }
      }
    )
  }

  const forgorPasswordMutation = useMutation({
    mutationFn: (body: forgotPasswordReqBody) => authApi.forgotPassword(body)
  })

  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOTP,
    onSuccess: () => {
      message.success('Đã gửi mã OTP về email')
      setStep(1)
    },
    onError: (error) => {
      if (isAxiosUnprocessableEntityError<ResponseUnprocessableEntityApi<emailType>>(error)) {
        const formError = error.response?.data.message
        if (formError) {
          formError.forEach((err) => {
            message.error(err.message)
          })
          return
        }
      }
      message.error('Gửi OTP thất bại. Vui lòng thử lại!')
    }
  })

  const handleSendOtp = () => {
    if (!email) {
      message.warning('Vui lòng nhập email trước khi gửi OTP')
      return
    }
    sendOtpMutation.mutate({ email, type: VerificationCode.FORGOT_PASSWORD })
  }

  return (
    <div className='bg-orange'>
      <div className='container max-w-[100rem]'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <div className='rounded bg-white p-10 shadow-sm'>
              <div className='mb-5 text-2xl'>Quên mật khẩu</div>
              <Steps
                type='navigation'
                current={step}
                onChange={onChange}
                className='site-navigation-steps'
                items={[
                  {
                    title: 'Xác nhận email'
                  },
                  {
                    title: 'Nhập OTP và mật khẩu mới'
                  }
                ]}
              />
              {step === 0 && (
                <>
                  <div className='mt-5 flex items-center gap-2'>
                    <Input
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                      }}
                      name='email'
                      className='h-12'
                      placeholder='Email'
                    />
                    <Button onClick={handleSendOtp} disabled={sendOtpMutation.isLoading} className='h-12'>
                      {sendOtpMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                      <span className='ml-2'>Gửi mã OTP</span>
                    </Button>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <Input name='email' type='email' className='mt-8 bg-gray-200' placeholder='Email' value={email} />
                  <Input
                    name='newPassword'
                    type='password'
                    className='mt-2'
                    placeholder='New password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete='on'
                  />
                  {errNewPassword && <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{errNewPassword}</div>}
                  <Input
                    name='confirmNewPassword'
                    type='password'
                    className='mt-2'
                    placeholder='Confirm new password'
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete='on'
                  />
                  {errConfirmNewPassword && (
                    <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{errConfirmNewPassword}</div>
                  )}
                  <Input
                    name='code'
                    type='text'
                    className='mt-2'
                    value={code}
                    placeholder='Code'
                    onChange={(e) => setCode(e.target.value)}
                  />
                  {errCode && <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{errCode}</div>}
                  <div className='flex justify-end'>
                    <Button onClick={handleSendOtp} disabled={sendOtpMutation.isLoading} className='my-3 h-8'>
                      {sendOtpMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                      <span className='ml-2'>Gửi lại mã OTP</span>
                    </Button>
                  </div>

                  <div className='mt-2'>
                    <button
                      onClick={onSubmit}
                      className='flex w-full items-center justify-center bg-red-500 py-4 px-2 text-center text-sm uppercase text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                      disabled={forgorPasswordMutation.isLoading}
                    >
                      {forgorPasswordMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                      <span className='ml-2'>Cập nhật mật khẩu mới</span>
                    </button>
                  </div>
                </>
              )}

              <div className='mt-8 flex items-center justify-center gap-1'>
                <div className='text-gray-300'>Bạn đã có tài khoản?</div>
                <Link to='/login' className=' text-red-400'>
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
