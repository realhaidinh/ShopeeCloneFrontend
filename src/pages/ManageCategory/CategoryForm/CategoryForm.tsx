'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Upload, message, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Category, CreateCategoryReqBody, UpdateCategoryReqBody } from 'src/types/category.type'
import categoryApi from 'src/apis/manageCategory.api'
import type { UploadImageResponse } from 'src/types/media.type'
import http from 'src/utils/http'

interface CategoryFormProps {
  visible: boolean
  category: Category | null
  isEditing: boolean
  onClose: () => void
  onSuccess: () => void
  parentCategories: Category[]
}

// Function to upload logo
const uploadLogo = async (files: File[]) => {
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

export default function CategoryForm({
  visible,
  category,
  isEditing,
  onClose,
  onSuccess,
  parentCategories
}: CategoryFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryReqBody) => categoryApi.create(data),
    onSuccess: () => {
      message.success('Category created successfully')
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['parentCategories'])
      form.resetFields()
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to create category')
      console.error(error)
    }
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryReqBody }) => categoryApi.update(id, data),
    onSuccess: () => {
      message.success('Category updated successfully')
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['parentCategories'])
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to update category')
      console.error(error)
    }
  })

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (visible) {
      if (isEditing && category) {
        form.setFieldsValue({
          name: category.name,
          parentCategoryId: category.parentCategoryId
        })
        setLogoUrl(category.logo)
      } else {
        form.resetFields()
        setLogoUrl(null)
      }
    }
  }, [visible, category, isEditing, form])

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = {
        ...values,
        logo: logoUrl || ''
      }

      if (isEditing && category) {
        // Update existing category
        updateCategoryMutation.mutate({
          id: category.id,
          data: formData as UpdateCategoryReqBody
        })
      } else {
        // Create new category
        createCategoryMutation.mutate(formData as CreateCategoryReqBody)
      }
    })
  }

  // Handle logo upload
  const handleLogoChange = async (info: any) => {
    if (info.file.status === 'uploading') {
      return
    }

    if (info.file.originFileObj) {
      try {
        const files = [info.file.originFileObj]
        const response = await uploadLogo(files)

        if (response.data && response.data.data.length > 0) {
          const imageUrl = response.data.data[0].url
          setLogoUrl(imageUrl)
          message.success('Logo uploaded successfully')
        }
      } catch (error) {
        console.error('Error uploading logo:', error)
        message.error('Failed to upload logo')
      }
    }
  }

  // Custom upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  return (
    <Modal
      title={isEditing ? 'Edit Category' : 'Create Category'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          type='primary'
          onClick={handleSubmit}
          loading={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      ]}
      width={600}
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='logo' label='Logo'>
          <Upload
            name='logo'
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
            onChange={handleLogoChange}
          >
            {logoUrl ? <img src={logoUrl || '/placeholder.svg'} alt='logo' style={{ width: '100%' }} /> : uploadButton}
          </Upload>
        </Form.Item>

        <Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter category name' }]}>
          <Input placeholder='Enter category name' />
        </Form.Item>

        <Form.Item name='parentCategoryId' label='Parent Category'>
          <Select placeholder='Select a parent category' allowClear>
            {parentCategories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
