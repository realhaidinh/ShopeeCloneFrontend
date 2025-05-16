import { Form, Input, Button, Card, Typography, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import type { ChangePasswordReqBody } from 'src/types/user.type'
import profileApi from 'src/apis/profile.api'

interface ChangePasswordProps {
  onSuccess: () => void
}

export default function ChangePassword({ onSuccess }: ChangePasswordProps) {
  const [form] = Form.useForm()

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordReqBody) => profileApi.changePassword(data),
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công')
      form.resetFields()
      onSuccess()
    },
    onError: (error) => {
      message.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.')
      console.error('Error changing password:', error)
    }
  })

  // Handle form submission
  const handleSubmit = (values: any) => {
    const data: ChangePasswordReqBody = {
      password: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword
    }

    changePasswordMutation.mutate(data)
  }

  return (
    <div>
      <Typography.Title level={4} className='mb-4'>
        Đổi mật khẩu
      </Typography.Title>

      <Card>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            name='currentPassword'
            label='Mật khẩu hiện tại'
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Nhập mật khẩu hiện tại' />
          </Form.Item>

          <Form.Item
            name='newPassword'
            label='Mật khẩu mới'
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Nhập mật khẩu mới' />
          </Form.Item>

          <Form.Item
            name='confirmNewPassword'
            label='Xác nhận mật khẩu mới'
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Xác nhận mật khẩu mới' />
          </Form.Item>

          <div className='flex justify-end gap-2'>
            <Button onClick={onSuccess}>Hủy</Button>
            <Button htmlType='submit' loading={changePasswordMutation.isLoading}>
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
