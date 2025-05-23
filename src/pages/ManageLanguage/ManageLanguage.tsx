import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Table, Space, Tag, message, Pagination } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { omit, set } from 'lodash'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useQueryConfig, { type QueryConfig } from 'src/hooks/useQueryConfig'
import { Language } from 'src/types/language.type'
import languageApi from 'src/apis/language.api'
import LanguageForm from 'src/pages/ManageLanguage/LanguageForm'
import DeleteConfirmation from 'src/pages/ManageLanguage/DeleteConfirmation'

export default function ManageLanguage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  let queryConfig: QueryConfig = useQueryConfig()
  // Remove orderBy and sortBy because default value is undefined
  queryConfig = omit(queryConfig, ['orderBy', 'sortBy', 'lang'])

  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const {
    data: languagesData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['languages'],
    queryFn: () => {
      return languageApi.getList()
    },
    keepPreviousData: true
  })

  const deleteLanguageMutation = useMutation({
    mutationFn: (languageId: string) => languageApi.delete(languageId),
    onSuccess: () => {
      message.success('Language deleted successfully')
      queryClient.invalidateQueries(['languages'])
    },
    onError: (error) => {
      message.error('Failed to delete language')
      console.error(error)
    }
  })

  // Handle view user details
  const handleViewDetails = (language: Language) => {
    setSelectedLanguage(language)
    setIsDetailVisible(true)
  }

  // Handle create user
  const handleCreateLanguage = () => {
    setSelectedLanguage(null)
    setIsEditing(false)
    setIsFormVisible(true)
  }

  // Handle edit user
  const handleEditLanguage = (language: Language) => {
    setSelectedLanguage(language)
    setIsEditing(true)
    setIsFormVisible(true)
  }

  // Handle delete user
  const handleDeleteLanguage = (language: Language) => {
    setSelectedLanguage(language)
    setIsDeleteVisible(true)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Language) => (
        <Space size='middle'>
          <Button type='text' icon={<EditOutlined />} onClick={() => handleEditLanguage(record)} />
          <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDeleteLanguage(record)} />
        </Space>
      )
    }
  ]

  return (
    <div className='manage-language-container'>
      <div className='header-actions' style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Manage Languages</h2>
        <Button icon={<PlusOutlined />} onClick={handleCreateLanguage}>
          Add Language
        </Button>
      </div>

      <Table
        dataSource={languagesData?.data.data}
        columns={columns}
        rowKey='id'
        loading={isLoading}
        pagination={false}
      />

      {/* User Form Modal (Create/Update) */}
      <LanguageForm
        visible={isFormVisible}
        language={selectedLanguage}
        isEditing={isEditing}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => {
          setIsFormVisible(false)
          queryClient.invalidateQueries(['languages'])
        }}
      />

      {/* Delete Confirmation Modal */}
      {selectedLanguage && (
        <DeleteConfirmation
          visible={isDeleteVisible}
          language={selectedLanguage}
          onCancel={() => setIsDeleteVisible(false)}
          onConfirm={() => {
            deleteLanguageMutation.mutate(selectedLanguage.id)
            setIsDeleteVisible(false)
          }}
          isLoading={deleteLanguageMutation.isLoading}
        />
      )}
    </div>
  )
}
