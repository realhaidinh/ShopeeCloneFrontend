import { useMutation } from '@tanstack/react-query'
import { Button, Input, message, Spin } from 'antd'
import authApi from 'src/apis/auth.api'
import { VerificationCode } from 'src/constants/auth.constant'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { emailType } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { LoadingOutlined } from '@ant-design/icons'

interface Props {
  email: string
  setEmail: React.Dispatch<React.SetStateAction<string>>
  setCurrent: React.Dispatch<React.SetStateAction<number>>
  setValue: any
}

export default function EmailOtp({ email, setEmail, setCurrent, setValue }: Props) {
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOTPRegister,
    onSuccess: () => {
      message.success('Đã gửi mã OTP về email')
      setCurrent(1)
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
    sendOtpMutation.mutate({ email, type: VerificationCode.REGISTER })
  }
  return (
    <div className='flex mt-5 items-center gap-2'>
      <Input
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setValue('email', e.target.value)
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
  )
}
