'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Upload, message, Tabs, Space } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Brand, CreateBrandReqBody, UpdateBrandReqBody } from 'src/types/brand.type'
import type { Language } from 'src/types/language.type'
import type { UploadImageResponse } from 'src/types/media.type'
import brandApi from 'src/apis/brand.api'
import brandTranslationApi from 'src/apis/brandTranslation.api'
import languageApi from 'src/apis/language.api'
import http from 'src/utils/http'

const { TabPane } = Tabs

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

interface BrandFormProps {
  visible: boolean
  brand: Brand | null
  isEditing: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function BrandForm({ visible, brand, isEditing, onClose, onSuccess }: BrandFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [uploading, setUploading] = useState(false)

  // Get languages for translation tabs
  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languageApi.getList(),
    enabled: visible
  })

  // Fetch brand details when editing
  const { data: brandDetail, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', brand?.id],
    queryFn: () => brandApi.getDetailBrand(brand!.id),
    enabled: isEditing && !!brand?.id && visible
  })

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (data: CreateBrandReqBody) => {
      const response = await brandApi.create(data)
      return response
    },
    onSuccess: (response) => {
      message.success('Brand created successfully')
      queryClient.invalidateQueries(['brands'])
      form.resetFields()

      // If we have translations to create, do it after the brand is created
      if (response.data && response.data.id) {
        createTranslations(response.data.id)
      } else {
        onSuccess()
      }
    },
    onError: (error) => {
      message.error('Failed to create brand')
      console.error(error)
    }
  })

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrandReqBody }) => brandApi.update(id, data),
    onSuccess: (response) => {
      message.success('Brand updated successfully')
      queryClient.invalidateQueries(['brands'])
      queryClient.invalidateQueries(['brand', brand?.id])

      // If we have translations to update, do it after the brand is updated
      if (brand?.id) {
        updateTranslations(brand.id)
      } else {
        onSuccess()
      }
    },
    onError: (error) => {
      message.error('Failed to update brand')
      console.error(error)
    }
  })

  // Create translation mutations
  const createTranslationMutation = useMutation({
    mutationFn: (data: any) => brandTranslationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brand', brand?.id])
    },
    onError: (error) => {
      message.error('Failed to create translation')
      console.error(error)
    }
  })

  // Update translation mutations
  const updateTranslationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => brandTranslationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brand', brand?.id])
    },
    onError: (error) => {
      message.error('Failed to update translation')
      console.error(error)
    }
  })

  // Reset form when modal opens/closes or brand changes
  useEffect(() => {
    if (visible) {
      if (isEditing && brand) {
        form.setFieldsValue({
          name: brand.name
        })
        setLogoUrl(brand.logo)

        // Set translation fields if we have brand details
        if (brandDetail?.data?.brandTranslations) {
          const translations = brandDetail.data.brandTranslations
          translations.forEach((translation) => {
            form.setFieldsValue({
              [`name_${translation.languageId}`]: translation.name,
              [`description_${translation.languageId}`]: translation.description
            })
          })
        }
      } else {
        form.resetFields()
        setLogoUrl(null)
      }
    }
  }, [visible, brand, isEditing, form, brandDetail])

  // Handle logo upload
  const handleLogoChange = async (info: any) => {
    if (info.file.status === 'uploading') {
      return
    }

    if (info.file.originFileObj) {
      try {
        setUploading(true)
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
      } finally {
        setUploading(false)
      }
    }
  }

  // Create translations for a new brand
  const createTranslations = async (brandId: number) => {
    if (!languagesData?.data) {
      onSuccess()
      return
    }

    const translationPromises = languagesData.data.data.map((language: Language) => {
      const name = form.getFieldValue(`name_${language.id}`)
      const description = form.getFieldValue(`description_${language.id}`)

      if (name) {
        return createTranslationMutation.mutateAsync({
          brandId,
          languageId: language.id,
          name,
          description: description || ''
        })
      }
      return Promise.resolve()
    })

    try {
      await Promise.all(translationPromises)
      onSuccess()
    } catch (error) {
      console.error('Error creating translations:', error)
    }
  }

  // Update translations for an existing brand
  const updateTranslations = async (brandId: number) => {
    if (!languagesData?.data || !brandDetail?.data?.brandTranslations) {
      onSuccess()
      return
    }

    const existingTranslations = brandDetail.data.brandTranslations.reduce((acc, translation) => {
      acc[translation.languageId] = translation
      return acc
    }, {} as Record<string, any>)

    const translationPromises = languagesData.data.data.map((language: Language) => {
      const name = form.getFieldValue(`name_${language.id}`)
      const description = form.getFieldValue(`description_${language.id}`)

      if (name) {
        if (existingTranslations[language.id]) {
          // Update existing translation
          return updateTranslationMutation.mutateAsync({
            id: existingTranslations[language.id].id,
            data: {
              brandId,
              languageId: language.id,
              name,
              description: description || ''
            }
          })
        } else {
          // Create new translation
          return createTranslationMutation.mutateAsync({
            brandId,
            languageId: language.id,
            name,
            description: description || ''
          })
        }
      }
      return Promise.resolve()
    })

    try {
      await Promise.all(translationPromises)
      onSuccess()
    } catch (error) {
      console.error('Error updating translations:', error)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()

      const formData = {
        name: values.name,
        logo: logoUrl || ''
      }

      if (isEditing && brand) {
        // Update existing brand
        updateBrandMutation.mutate({
          id: brand.id,
          data: formData as UpdateBrandReqBody
        })
      } else {
        // Create new brand
        createBrandMutation.mutate(formData as CreateBrandReqBody)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // Custom upload button
  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{uploading ? 'Uploading...' : 'Upload'}</div>
    </div>
  )

  return (
    <Modal
      title={isEditing ? 'Edit Brand' : 'Create Brand'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          onClick={handleSubmit}
          loading={createBrandMutation.isLoading || updateBrandMutation.isLoading}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      ]}
      width={800}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab='Basic Information' key='basic'>
          <Form form={form} layout='vertical'>
            <Form.Item name='logo' label='Logo'>
              <Upload
                name='logo'
                listType='picture-card'
                className='avatar-uploader'
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  // This is just to satisfy antd's Upload component
                  // The actual upload happens in handleLogoChange
                  setTimeout(() => {
                    onSuccess && onSuccess('ok')
                  }, 0)
                }}
                onChange={handleLogoChange}
              >
                {logoUrl ? (
                  <img src={logoUrl || '/placeholder.svg'} alt='logo' style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>

            <Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter brand name' }]}>
              <Input placeholder='Enter brand name' />
            </Form.Item>
          </Form>
        </TabPane>

        {languagesData?.data.data.map((language: Language) => (
          <TabPane tab={language.name} key={language.id}>
            <Form form={form} layout='vertical'>
              <Form.Item
                name={`name_${language.id}`}
                label={`Name (${language.name})`}
                rules={[{ required: true, message: `Please enter name in ${language.name}` }]}
              >
                <Input placeholder={`Enter name in ${language.name}`} />
              </Form.Item>

              <Form.Item name={`description_${language.id}`} label={`Description (${language.name})`}>
                <Input.TextArea placeholder={`Enter description in ${language.name}`} rows={4} />
              </Form.Item>
            </Form>
          </TabPane>
        ))}
      </Tabs>
    </Modal>
  )
}
