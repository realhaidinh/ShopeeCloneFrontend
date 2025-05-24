import { useMutation } from "@tanstack/react-query"
import { Form, Input, Button, Spin, message } from "antd"
import { useState } from "react"
import authApi from "src/apis/auth.api"
import profileApi from "src/apis/profile.api"
import { VerificationCode } from "src/constants/auth.constant"
import { QRCodeCanvas } from 'qrcode.react'
import {LoadingOutlined} from '@ant-design/icons'

export default function Toggle2FA({ user, queryClient }) {
  const [showSecret, setShowSecret] = useState(false)
  const [auth, setAuth] = useState({ enable: !!user.totpSecret, type: 'otp', code: '', secret: '', uri: '' })

  const twoWayAuthMutation = useMutation({
    mutationFn: () => auth.enable ? profileApi.disable2fa(auth.code) : profileApi.setup2fa(),
    onSuccess: () => {
      message.success('Cập nhật thông tin thành công')
      queryClient.invalidateQueries({ queryKey: ['profile'] })

    }
  })
  const toggle2FA = async (e) => {
    e.preventDefault()
    const response = await twoWayAuthMutation.mutateAsync()
    const { secret, uri } = response.data
    if (secret && uri) {
      setAuth({ ...auth, enable: true, secret: secret, uri: uri })
      setShowSecret(true)
    } else {
      setAuth({ ...auth, enable: !auth.enable })
    }
  }

  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOTP,
    onSuccess: () => {
      message.success('Đã gửi mã OTP về email')
    },
    onError: () => {
      message.error('Gửi OTP thất bại. Vui lòng thử lại!')
    }
  })

  const handleSendOtp = () => {
    const email = user.email
    sendOtpMutation.mutate({ email, type: VerificationCode.DISABLE_2FA })
  }
  return (
    <>
      <Form>
        {showSecret && (
          <div className='mt-5 mb-5'>
            <Form.Item label='2FA Secret'>
              <Input value={auth.secret} readOnly />
            </Form.Item>
            <Form.Item label='QR Code'>
              <QRCodeCanvas value={auth.uri} size={200} />
            </Form.Item>
          </div>
        )}
        {auth.enable && (
          <div className='mt-5 flex items-center gap-2 mb-5'>
            <Input className='w-1/5' placeholder='Nhập OTP' value={auth.code} onChange={(e) => setAuth({ ...auth, code: e.target.value })} />
            <Button onClick={handleSendOtp} disabled={sendOtpMutation.isLoading}>
              {sendOtpMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
              <span className='ml-2'>Gửi mã OTP</span>
            </Button>
          </div>

        )}
        <Button onClick={toggle2FA} disabled={auth.enable && !auth.code.trim()}>
          {auth.enable ? 'Tắt' : 'Bật'} xác thực 2 lớp
        </Button>
      </Form>
    </>
  )
}