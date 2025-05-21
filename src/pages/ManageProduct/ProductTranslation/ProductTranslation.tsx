'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Tabs, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Product, ProductTranslation, CreateProductTranslationReqBody } from 'src/types/product.type'
import type { Language } from 'src/types/language.type'
import languageApi from 'src/apis/language.api'
import { productTranslationApi } from 'src/apis/productTranslation.api'

const { TabPane } = Tabs

interface ProductTranslationProps {
  visible: boolean
  product: Product
  onClose: () => void
  onSuccess: () => void
}

// Rename the component from ProductTranslation to ProductTranslationModal
export default function ProductTranslationModal({ visible, product, onClose, onSuccess }: ProductTranslationProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string>('')

  // Get languages
  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languageApi.getList(),
    enabled: visible
  })

  // Group translations by language for easier access
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const translationsByLanguage =
    product.productTranslations?.reduce((acc, translation) => {
      acc[translation.languageId] = translation
      return acc
    }, {} as Record<string, ProductTranslation>) || {}

  // Create translation mutation
  const createTranslationMutation = useMutation({
    mutationFn: (data: CreateProductTranslationReqBody) => productTranslationApi.create(data),
    onSuccess: () => {
      message.success('Translation created successfully')
      queryClient.invalidateQueries(['products'])
    },
    onError: (error) => {
      message.error('Failed to create translation')
      console.error(error)
    }
  })

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productTranslationApi.update(id, data),
    onSuccess: () => {
      message.success('Translation updated successfully')
      queryClient.invalidateQueries(['products'])
    },
    onError: (error) => {
      message.error('Failed to update translation')
      console.error(error)
    }
  })

  // Set initial form values when modal opens
  useEffect(() => {
    if (visible && languagesData?.data) {
      // Set default active tab to the first language
      if (languagesData.data.data.length > 0 && !activeTab) {
        setActiveTab(languagesData.data.data[0].id)
      }

      // Set form values for each language
      languagesData.data.data.forEach((language: Language) => {
        const translation = translationsByLanguage[language.id]
        if (translation) {
          form.setFieldsValue({
            [`name_${language.id}`]: translation.name,
            [`description_${language.id}`]: translation.description
          })
        } else {
          form.setFieldsValue({
            [`name_${language.id}`]: '',
            [`description_${language.id}`]: ''
          })
        }
      })
    }
  }, [visible, languagesData, form, translationsByLanguage, activeTab])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await form.validateFields()

      const savePromises = languagesData?.data.data.map(async (language: Language) => {
        const name = form.getFieldValue(`name_${language.id}`)
        const description = form.getFieldValue(`description_${language.id}`)

        if (name) {
          const translationData = {
            productId: product.id,
            languageId: language.id,
            name,
            description: description || ''
          }

          const existingTranslation = translationsByLanguage[language.id]
          if (existingTranslation) {
            // Update existing translation
            return updateTranslationMutation.mutateAsync({
              id: existingTranslation.id,
              data: translationData
            })
          } else {
            // Create new translation
            return createTranslationMutation.mutateAsync(translationData)
          }
        }
        return Promise.resolve()
      })

      if (savePromises) {
        await Promise.all(savePromises)
        message.success('Translations saved successfully')
        onSuccess()
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title='Product Translations'
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          onClick={handleSubmit}
          loading={createTranslationMutation.isLoading || updateTranslationMutation.isLoading}
        >
          Save Translations
        </Button>
      ]}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <strong>Product:</strong> {product.name}
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
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
                <Input.TextArea placeholder={`Enter description in ${language.name}`} rows={6} />
              </Form.Item>
            </Form>
          </TabPane>
        ))}
      </Tabs>
    </Modal>
  )
}
