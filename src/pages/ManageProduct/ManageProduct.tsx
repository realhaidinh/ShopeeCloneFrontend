'use client'

import { useContext, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { Table, Button, Card, Spin, Empty, Modal, Image, Typography, Space, Tooltip, Badge, Input, message } from 'antd'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  PlusOutlined,
  TranslationOutlined
} from '@ant-design/icons'
import useQueryConfig, { type QueryConfig } from 'src/hooks/useQueryConfig'
import type { Brand, Product, ProductListConfig, Sku } from 'src/types/product.type'
import productApi from 'src/apis/product.api'
import { manageProductApi } from 'src/apis/manageProduct.api'
import categoryApi from 'src/apis/manageCategory.api'
import brandApi from 'src/apis/brand.api'
import { AppContext } from 'src/contexts/app.context'
import { orderBy } from 'src/constants/product'
import { formatCurrency } from 'src/utils/utils'
import { omit } from 'lodash'
import ProductDetail from './ProductDetail'
import ProductForm from './ProductForm'
import ProductTranslationModal from './ProductTranslation'
import DeleteConfirmation from './DeleteConfirmation'

const { confirm } = Modal
const { Title, Text } = Typography

export default function ManageProduct() {
  const { profile } = useContext(AppContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  let queryConfig: QueryConfig = useQueryConfig()

  const [page, setPage] = useState(queryConfig.page || 1)
  const [pageSize, setPageSize] = useState(queryConfig.limit || 10)
  const [searchText, setSearchText] = useState(queryConfig.name || '')

  // Modal visibility states
  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isTranslationVisible, setIsTranslationVisible] = useState(false)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  if (profile && profile.roleId === 3) {
    queryConfig = {
      ...queryConfig,
      createdById: profile.id.toString()
    }
  }

  const {
    data: productData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    keepPreviousData: true
  })

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => manageProductApi.delete(id),
    onSuccess: () => {
      message.success('Product deleted successfully')
      queryClient.invalidateQueries(['products'])
      setIsDeleteVisible(false)
    },
    onError: (error) => {
      message.error('Failed to delete product')
      console.error(error)
    }
  })

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailVisible(true)
  }

  const handleSearch = (value: string) => {
    const query = {
      ...queryConfig,
      name: value
    }
    navigate({
      pathname: `/manage/products`,
      search: createSearchParams(query).toString()
    })
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)

    // Create a new queryConfig object instead of mutating the existing one
    const config = {
      ...queryConfig,
      page: pagination.current.toString(),
      limit: pagination.pageSize.toString()
    }

    // Handle sorting if needed
    if (sorter.columnKey && sorter.order) {
      config.sortBy = sorter.columnKey
      config.orderBy = sorter.order === 'ascend' ? orderBy.Asc : orderBy.Desc
    }
    navigate({
      pathname: `/manage/products`,
      search: createSearchParams(config).toString()
    })
  }

  const handleRefresh = () => {
    navigate({
      pathname: `/manage/products`,
      search: createSearchParams(omit(queryConfig, ['page', 'limit', 'name'])).toString()
    })
  }

  // Handle create product
  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setIsEditing(false)
    setIsFormVisible(true)
  }

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditing(true)
    setIsFormVisible(true)
  }

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteVisible(true)
  }

  // Handle manage translations
  const handleManageTranslations = (product: Product) => {
    setSelectedProduct(product)
    setIsTranslationVisible(true)
  }

  // Calculate total stock for a product from all SKUs
  const calculateTotalStock = (skus: Sku[]) => {
    if (!skus) return 0
    return skus.reduce((total, sku) => total + sku.stock, 0)
  }

  // Calculate total sales for a product
  const calculateTotalSales = (product: Product) => {
    if (!product.productSKUSnapshots) return 0
    return product.productSKUSnapshots.reduce((total, snapshot) => total + snapshot.quantity, 0)
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      width: 100,
      render: (images: string[]) => (
        <Image
          src={images && images.length > 0 ? images[0] : '/placeholder-image.png'}
          alt='Product'
          width={80}
          height={80}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback='data:image/png;base64,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'
        />
      )
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              ID: {record.id}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand: Brand) => brand.name
    },
    {
      title: 'ShopId',
      dataIndex: 'createdById',
      key: 'shopId',
      render: (shopId: number) => shopId
    },
    {
      title: 'Price',
      dataIndex: 'basePrice',
      key: 'price',
      sorter: true,
      render: (basePrice: number, record: Product) => (
        <div>
          <Text strong>${formatCurrency(basePrice)}</Text>
          {record.virtualPrice > 0 && (
            <div>
              <Text type='secondary' delete style={{ fontSize: '12px' }}>
                ${formatCurrency(record.virtualPrice)}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_: any, record: Product) => {
        const totalStock = calculateTotalStock(record.skus)
        if (totalStock === 0) return <Badge status='error' showZero count={totalStock} />
        if (totalStock > 100) return <Badge status='success' showZero count={totalStock} />
        if (totalStock > 50) return <Badge status='warning' showZero count={totalStock} />
      }
    },
    {
      title: 'Total Sales',
      sorter: true,
      key: 'sale',
      render: (_: any, record: Product) => {
        const totalSales = calculateTotalSales(record)
        return totalSales
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Product) => (
        <Space>
          <Tooltip title='View Details'>
            <Button shape='circle' icon={<EyeOutlined />} onClick={() => handleViewProduct(record)} />
          </Tooltip>
          <Tooltip title='Edit'>
            <Button shape='circle' icon={<EditOutlined />} onClick={() => handleEditProduct(record)} />
          </Tooltip>
          <Tooltip title='Translations'>
            <Button shape='circle' icon={<TranslationOutlined />} onClick={() => handleManageTranslations(record)} />
          </Tooltip>
          <Tooltip title='Delete'>
            <Button danger shape='circle' icon={<DeleteOutlined />} onClick={() => handleDeleteProduct(record)} />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <>
      <Card
        title={<Title level={4}>Product Management</Title>}
        extra={
          <Space>
            <Input
              placeholder='Search products'
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onBlur={(e) => handleSearch(searchText as string)}
              style={{ width: 250 }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              Refresh
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleCreateProduct}>
              Add Product
            </Button>
          </Space>
        }
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size='large' />
          </div>
        ) : isError ? (
          <Empty description='Error loading products' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : !productData || !productData.data || productData.data.totalItems === 0 ? (
          <Empty description='No products found' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <>
            <Table
              dataSource={productData.data.data}
              columns={columns}
              rowKey='id'
              pagination={{
                current: page as number,
                pageSize: pageSize as number,
                total: productData.data.totalItems,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} products`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
              bordered
            />
          </>
        )}
      </Card>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          visible={isDetailVisible}
          product={selectedProduct}
          onClose={() => setIsDetailVisible(false)}
          onEdit={handleEditProduct}
          onManageTranslations={handleManageTranslations}
        />
      )}

      {/* Product Form Modal (Create/Update) */}
      <ProductForm
        visible={isFormVisible}
        product={selectedProduct}
        isEditing={isEditing}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => {
          setIsFormVisible(false)
          queryClient.invalidateQueries(['products'])
          if (selectedProduct) {
            queryClient.invalidateQueries(['product', selectedProduct.id])
          }
        }}
        categoryApi={categoryApi}
        brandApi={brandApi}
      />

      {/* Product Translation Modal */}
      {selectedProduct && (
        <ProductTranslationModal
          visible={isTranslationVisible}
          product={selectedProduct}
          onClose={() => setIsTranslationVisible(false)}
          onSuccess={() => {
            setIsTranslationVisible(false)
            queryClient.invalidateQueries(['product', selectedProduct.id])
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <DeleteConfirmation
          visible={isDeleteVisible}
          product={selectedProduct}
          onCancel={() => setIsDeleteVisible(false)}
          onConfirm={() => deleteProductMutation.mutate(selectedProduct.id)}
          isLoading={deleteProductMutation.isLoading}
        />
      )}
    </>
  )
}
