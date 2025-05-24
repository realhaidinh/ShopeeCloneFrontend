import { useState } from 'react'
import { Form, Input, Button, Upload, message, Card, Typography, Avatar, Spin } from 'antd'
import { UploadOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { RcFile, UploadProps } from 'antd/es/upload/interface'
import type { User, UpdateProfileReqBody } from 'src/types/user.type'
import profileApi from 'src/apis/profile.api'
import Toggle2FA from 'src/components/Toggle2FA'

interface ProfileEditProps {
  user: User
  onSuccess: () => void
}

export default function ProfileEdit({ user, onSuccess }: ProfileEditProps) {
  const [form] = Form.useForm()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileReqBody) => profileApi.updateProfile(data),
    onSuccess: () => {
      message.success('Cập nhật thông tin thành công')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      onSuccess()
    },
    onError: (error) => {
      message.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.')
      console.error('Error updating profile:', error)
    }
  })

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar([file]),
    onSuccess: (response) => {
      const avatarUrl = response.data.data[0]?.url
      if (avatarUrl) {
        return avatarUrl
      }
      throw new Error('Không nhận được URL ảnh từ server')
    },
    onError: (error) => {
      message.error('Tải ảnh lên thất bại. Vui lòng thử lại sau.')
      console.error('Error uploading avatar:', error)
      setIsUploading(false)
    }
  })

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setIsUploading(true)

      // If there's a new avatar file, upload it first
      let finalAvatarUrl = avatarUrl

      if (avatarFile) {
        const res = await uploadAvatarMutation.mutateAsync(avatarFile)
        finalAvatarUrl = res.data.data[0].url
      }

      // Then update the profile with the new avatar URL
      const updateData: UpdateProfileReqBody = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        avatar: finalAvatarUrl || ''
      }

      await updateProfileMutation.mutateAsync(updateData)
      setIsUploading(false)
    } catch (error) {
      setIsUploading(false)
      console.error('Error in form submission:', error)
    }
  }

  // Handle avatar upload
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file hình ảnh!')
      return false
    }

    const isLt2M = file.size / 1024 / 1024 < 10
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 10MB!')
      return false
    }

    // Store the file for later upload
    setAvatarFile(file)

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Prevent automatic upload
    return false
  }

  const uploadProps: UploadProps = {
    name: 'avatar',
    multiple: false,
    showUploadList: false,
    beforeUpload,
    accept: 'image/*',
    maxCount: 1
  }

  return (
    <div>
      <Typography.Title level={4} className='mb-4'>
        Chỉnh sửa thông tin cá nhân
      </Typography.Title>

      <Card>
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || ''
          }}
          onFinish={handleSubmit}
        >
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <Avatar size={100} src={avatarUrl || undefined} icon={!avatarUrl && <UserOutlined />} />
              {isUploading && (
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-30'>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} />
                </div>
              )}
            </div>

            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} disabled={isUploading}>
                Thay đổi ảnh đại diện
              </Button>
            </Upload>
            <Typography.Text type='secondary' className='mt-2'>
              Hỗ trợ định dạng JPG, PNG. Kích thước tối đa 2MB.
            </Typography.Text>
          </div>

          <Form.Item name='name' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
            <Input placeholder='Nhập họ và tên' />
          </Form.Item>

          <Form.Item name='email' label='Email'>
            <Input disabled />
          </Form.Item>

          <Form.Item
            name='phoneNumber'
            label='Số điện thoại'
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder='Nhập số điện thoại' />
          </Form.Item>

          <div className='flex justify-end gap-2'>
            <Button onClick={onSuccess}>Hủy</Button>
            <Button htmlType='submit' loading={isUploading || updateProfileMutation.isLoading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
        <Toggle2FA queryClient={queryClient} user={user}/>
      </Card>
    </div>
  )
}
