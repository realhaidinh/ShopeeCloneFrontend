'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Table, Space, message, Pagination, Image, Select } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { Category } from 'src/types/category.type'
import categoryApi from 'src/apis/manageCategory.api'
import CategoryDetail from './CategoryDetail'
import CategoryForm from './CategoryForm'
import DeleteConfirmation from './DeleteConfirmation'
import { formatDate } from 'src/utils/utils'

export default function ManageCategory() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)

  // State for modals
  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch parent categories for dropdown
  const { data: parentCategoriesData } = useQuery({
    queryKey: ['parentCategories'],
    queryFn: () => categoryApi.getParentCategories()
  })

  // Fetch categories based on parent selection
  const {
    data: categoriesData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['categories', { parentId: selectedParentId, page, pageSize }],
    queryFn: () => {
      if (selectedParentId) {
        return categoryApi.getChildrenCategories(selectedParentId)
      }
      return categoryApi.getParentCategories()
    },
    keepPreviousData: true
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => categoryApi.delete(categoryId),
    onSuccess: () => {
      message.success('Category deleted successfully')
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['parentCategories'])
      setIsDeleteVisible(false)
    },
    onError: (error) => {
      message.error('Failed to delete category')
      console.error(error)
    }
  })

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  // Handle view category details
  const handleViewDetails = (category: Category) => {
    setSelectedCategory(category)
    setIsDetailVisible(true)
  }

  // Handle create category
  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setIsEditing(false)
    setIsFormVisible(true)
  }

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsEditing(true)
    setIsFormVisible(true)
  }

  // Handle delete category
  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteVisible(true)
  }

  // Handle parent category change
  const handleParentChange = (value: number | null) => {
    setSelectedParentId(value)
    setPage(1) // Reset to first page when changing parent
  }

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      render: (logo: string) => (
        <Image
          src={logo || '/placeholder.svg?height=40&width=40'}
          alt='Category Logo'
          width={40}
          height={40}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback='/placeholder.svg?height=40&width=40'
        />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Parent Category',
      dataIndex: 'parentCategoryId',
      key: 'parentCategoryId',
      render: (parentId: number | null) => {
        if (!parentId) return 'None'
        const parent = parentCategoriesData?.data.data.find((cat) => cat.id === parentId)
        return parent ? parent.name : 'Unknown'
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space size='middle'>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          <Button type='text' icon={<EditOutlined />} onClick={() => handleEditCategory(record)} />
          <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDeleteCategory(record)} />
        </Space>
      )
    }
  ]

  return (
    <div className='manage-category-container'>
      <div className='header-actions' style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Manage Categories</h2>
        <Button icon={<PlusOutlined />} onClick={handleCreateCategory}>
          Add Category
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>Filter by Parent Category:</span>
          <Select
            style={{ width: 300 }}
            placeholder='Select a parent category'
            allowClear
            onChange={handleParentChange}
            value={selectedParentId}
          >
            {parentCategoriesData?.data.data.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </div>

      <Table
        dataSource={categoriesData?.data.data}
        columns={columns}
        rowKey='id'
        loading={isLoading}
        pagination={false}
      />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={categoriesData?.data.totalItems || 0}
          onChange={handlePaginationChange}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <CategoryDetail
          visible={isDetailVisible}
          category={selectedCategory}
          onClose={() => setIsDetailVisible(false)}
        />
      )}

      {/* Category Form Modal (Create/Update) */}
      <CategoryForm
        visible={isFormVisible}
        category={selectedCategory}
        isEditing={isEditing}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => {
          setIsFormVisible(false)
          queryClient.invalidateQueries(['categories'])
          queryClient.invalidateQueries(['parentCategories'])
        }}
        parentCategories={parentCategoriesData?.data.data || []}
      />

      {/* Delete Confirmation Modal */}
      {selectedCategory && (
        <DeleteConfirmation
          visible={isDeleteVisible}
          category={selectedCategory}
          onCancel={() => setIsDeleteVisible(false)}
          onConfirm={() => deleteCategoryMutation.mutate(selectedCategory.id)}
          isLoading={deleteCategoryMutation.isLoading}
        />
      )}
    </div>
  )
}
