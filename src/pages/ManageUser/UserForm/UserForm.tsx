'use client'

import { Modal, Form, Input, Select, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { type User, UserStatus, type CreateUserReqBody, type UpdateUserReqBody } from 'src/types/user.type'
import userApi from 'src/apis/user.api'
import roleApi from 'src/apis/role.api' // Assuming you have a role API
import http from 'src/utils/http'
import type { UploadImageResponse } from 'src/types/media.type'

interface UserFormProps {
  visible: boolean
  user: User | null
  isEditing: boolean
  onClose: () => void
  onSuccess: () => void
}

// Function to upload avatar
const uploadAvatar = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file) // key 'files' matches backend requirement
  })
  return http.post<UploadImageResponse>(`/media/images/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

const UserForm = ({ visible, user, isEditing, onClose, onSuccess }: UserFormProps) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Fetch roles for the select dropdown
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => {
      // Assuming you have a role API that returns a list of roles
      return roleApi.getList({ page: 1, limit: 100 })
    },
    // Only fetch roles when the modal is visible
    enabled: visible
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserReqBody) => userApi.create(data),
    onSuccess: () => {
      message.success('User created successfully')
      queryClient.invalidateQueries(['users'])
      form.resetFields()
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to create user')
      console.error(error)
    }
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: UpdateUserReqBody }) => userApi.update(userId, body),
    onSuccess: () => {
      message.success('User updated successfully')
      queryClient.invalidateQueries(['users'])
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to update user')
      console.error(error)
    }
  })

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (visible) {
      if (isEditing && user) {
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          status: user.status,
          roleId: user.roleId
        })
        setAvatarUrl(user.avatar)
      } else {
        form.resetFields()
        setAvatarUrl(null)
      }
    }
  }, [visible, user, isEditing, form])

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = {
        ...values,
        avatar: avatarUrl || ''
      }

      if (isEditing && user) {
        // Update existing user
        updateUserMutation.mutate({
          userId: user.id,
          body: formData as UpdateUserReqBody
        })
      } else {
        // Create new user
        createUserMutation.mutate(formData as CreateUserReqBody)
      }
    })
  }

  // Handle avatar upload
  const handleAvatarChange = async (info: any) => {
    if (info.file.status === 'uploading') {
      return
    }

    if (info.file.originFileObj) {
      try {
        // Create a FormData and append the file
        const files = [info.file.originFileObj]
        const response = await uploadAvatar(files)

        // Assuming the response contains the URL of the uploaded image
        if (response.data && response.data.data.length > 0) {
          const imageUrl = response.data.data[0].url
          setAvatarUrl(imageUrl)
          message.success('Avatar uploaded successfully')
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        message.error('Failed to upload avatar')
      }
    }
  }

  // Custom upload button
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  return (
    <Modal
      title={isEditing ? 'Edit User' : 'Create User'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          onClick={handleSubmit}
          loading={createUserMutation.isLoading || updateUserMutation.isLoading}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          status: UserStatus.ACTIVE
        }}
      >
        <Form.Item name='avatar' label='Avatar'>
          <Upload
            name='avatar'
            listType='picture-card'
            className='avatar-uploader'
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              // This is just to satisfy antd's Upload component
              // The actual upload happens in handleAvatarChange
              setTimeout(() => {
                onSuccess && onSuccess('ok')
              }, 0)
            }}
            onChange={handleAvatarChange}
          >
            {avatarUrl ? (
              <img src={avatarUrl || '/placeholder.svg'} alt='avatar' style={{ width: '100%' }} />
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>

        <Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter user name' }]}>
          <Input placeholder='Enter user name' />
        </Form.Item>

        {!isEditing && (
          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder='Enter email' disabled={isEditing} />
          </Form.Item>
        )}

        {!isEditing && (
          <Form.Item
            name='password'
            label='Password'
            rules={[{ required: !isEditing, message: 'Please enter password' }]}
          >
            <Input.Password placeholder='Enter password' />
          </Form.Item>
        )}

        <Form.Item
          name='phoneNumber'
          label='Phone Number'
          rules={[{ required: true, message: 'Please enter phone number' }]}
        >
          <Input placeholder='Enter phone number' />
        </Form.Item>

        <Form.Item name='status' label='Status' rules={[{ required: true, message: 'Please select status' }]}>
          <Select placeholder='Select status'>
            <Select.Option value={UserStatus.ACTIVE}>Active</Select.Option>
            <Select.Option value={UserStatus.INACTIVE}>Inactive</Select.Option>
            <Select.Option value={UserStatus.BLOCKED}>Blocked</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name='roleId' label='Role' rules={[{ required: true, message: 'Please select role' }]}>
          <Select placeholder='Select role'>
            {rolesData?.data.data.map((role: any) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserForm
