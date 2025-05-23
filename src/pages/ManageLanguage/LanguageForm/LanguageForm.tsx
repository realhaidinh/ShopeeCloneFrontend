import { CreateLanguageReqBody, Language, UpdateLanguageReqBody } from 'src/types/language.type'
import { Modal, Form, Input, Select, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import languageApi from 'src/apis/language.api'
interface LanguageFormProps {
  visible: boolean
  language: Language | null
  isEditing: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LanguageForm({ visible, language, isEditing, onClose, onSuccess }: LanguageFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const createLanguageMutation = useMutation({
    mutationFn: (data: CreateLanguageReqBody) => languageApi.create(data),
    onSuccess: () => {
      message.success('Language created successfully')
      queryClient.invalidateQueries(['languages'])
      form.resetFields()
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to create language')
      console.error(error)
    }
  })
  const updateLanguageMutation = useMutation({
    mutationFn: ({ languageId, body }: { languageId: string; body: UpdateLanguageReqBody }) =>
      languageApi.update(languageId, body),
    onSuccess: () => {
      message.success('User updated successfully')
      queryClient.invalidateQueries(['languages'])
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to update language')
      console.error(error)
    }
  })

  useEffect(() => {
    if (visible) {
      if (isEditing && language) {
        form.setFieldsValue({
          id: language.id,
          name: language.name
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, language, isEditing, form])

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = {
        ...values
      }

      if (isEditing && language) {
        // Update existing user
        updateLanguageMutation.mutate({
          languageId: language.id,
          body: formData as UpdateLanguageReqBody
        })
      } else {
        // Create new user
        createLanguageMutation.mutate(formData as CreateLanguageReqBody)
      }
    })
  }

  return (
    <Modal
      title={isEditing ? 'Edit Language' : 'Create Language'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          onClick={handleSubmit}
          loading={createLanguageMutation.isLoading || updateLanguageMutation.isLoading}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      ]}
      width={600}
    >
      <Form form={form} layout='vertical'>
        {!isEditing && (
          <Form.Item name='id' label='Id' rules={[{ required: true, message: 'Please enter id' }]}>
            <Input placeholder='Enter id' disabled={isEditing} />
          </Form.Item>
        )}

        <Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter language name' }]}>
          <Input placeholder='Enter user name' />
        </Form.Item>
      </Form>
    </Modal>
  )
}
