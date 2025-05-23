'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Table, Space, message, Pagination, Image, Input } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { Brand } from 'src/types/brand.type'
import brandApi from 'src/apis/brand.api'
import BrandDetail from './BrandDetail'
import BrandForm from './BrandForm'
import DeleteConfirmation from './DeleteConfirmation'
import { formatDate } from 'src/utils/utils'

export default function ManageBrand() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  // State for modals
  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch brands
  const {
    data: brandsData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['brands', { page, limit: pageSize }],
    queryFn: () => brandApi.getBrands({ page, limit: pageSize }),
    keepPreviousData: true
  })

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (brandId: number) => brandApi.delete(brandId),
    onSuccess: () => {
      message.success('Brand deleted successfully')
      queryClient.invalidateQueries(['brands'])
      setIsDeleteVisible(false)
    },
    onError: (error) => {
      message.error('Failed to delete brand')
      console.error(error)
    }
  })

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  // Handle view brand details
  const handleViewDetails = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsDetailVisible(true)
  }

  // Handle create brand
  const handleCreateBrand = () => {
    setSelectedBrand(null)
    setIsEditing(false)
    setIsFormVisible(true)
  }

  // Handle edit brand
  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsEditing(true)
    setIsFormVisible(true)
  }

  // Handle delete brand
  const handleDeleteBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsDeleteVisible(true)
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1) // Reset to first page when searching
  }

  // Filter brands based on search term
  const filteredBrands = brandsData?.data.data.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          alt='Brand Logo'
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
      render: (_: any, record: Brand) => (
        <Space size='middle'>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          <Button type='text' icon={<EditOutlined />} onClick={() => handleEditBrand(record)} />
          <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDeleteBrand(record)} />
        </Space>
      )
    }
  ]

  return (
    <div className='manage-brand-container'>
      <div className='header-actions' style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Manage Brands</h2>
        <Button icon={<PlusOutlined />} onClick={handleCreateBrand}>
          Add Brand
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder='Search brands'
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Table dataSource={filteredBrands || []} columns={columns} rowKey='id' loading={isLoading} pagination={false} />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={brandsData?.data.totalItems || 0}
          onChange={handlePaginationChange}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <BrandDetail visible={isDetailVisible} brand={selectedBrand} onClose={() => setIsDetailVisible(false)} />
      )}

      {/* Brand Form Modal (Create/Update) */}
      <BrandForm
        visible={isFormVisible}
        brand={selectedBrand}
        isEditing={isEditing}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => {
          setIsFormVisible(false)
          queryClient.invalidateQueries(['brands'])
        }}
      />

      {/* Delete Confirmation Modal */}
      {selectedBrand && (
        <DeleteConfirmation
          visible={isDeleteVisible}
          brand={selectedBrand}
          onCancel={() => setIsDeleteVisible(false)}
          onConfirm={() => deleteBrandMutation.mutate(selectedBrand.id)}
          isLoading={deleteBrandMutation.isLoading}
        />
      )}
    </div>
  )
}
