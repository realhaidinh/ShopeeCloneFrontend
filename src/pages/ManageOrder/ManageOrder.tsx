'use client'

import { useContext, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Card, Spin, Empty, Modal } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { formatCurrency } from 'src/utils/utils'
import { manageOrderApi } from 'src/apis/manageOrders.api'
import { AppContext } from 'src/contexts/app.context'
import useQueryConfig, { type QueryConfig } from 'src/hooks/useQueryConfig'
import { omit } from 'lodash'
import type { ListOrder } from 'src/types/order.type' // Use order.type consistently
import DetailOrder from 'src/pages/ManageOrder/DetailOrder'
import CancelOrder from 'src/pages/ManageOrder/CancelOrder'

export default function ManageOrder() {
  const { profile } = useContext(AppContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const queryConfig: QueryConfig = useQueryConfig()
  const [page, setPage] = useState(Number(queryConfig.page) || 1)
  const [pageSize, setPageSize] = useState(Number(queryConfig.limit) || 10)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)

  const {
    data: ordersData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () => manageOrderApi.getListOrders({ page, limit: pageSize })
  })

  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsDetailModalVisible(true)
  }

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false)
  }

  // Calculate total price for an order
  const calculateOrderTotal = (order: ListOrder) => {
    return order.items.reduce((total, item) => total + item.skuPrice * item.quantity, 0)
  }

  // Get status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'orange'
      case 'PENDING_PICKUP':
        return 'blue'
      case 'PENDING_DELIVERY':
        return 'yellow'
      case 'RETURNED':
        return 'cyan'
      case 'DELIVERED':
        return 'green'
      case 'CANCELLED':
        return 'red'
      default:
        return 'default'
    }
  }

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Chờ thanh toán'
      case 'PENDING_PICKUP':
        return 'Chờ lấy hàng'
      case 'PENDING_DELIVERY':
        return 'Đang giao hàng'
      case 'DELIVERED':
        return 'Đã giao hàng'
      case 'CANCELLED':
        return 'Đã hủy'
      case 'RETURNED':
        return 'Hoàn trả'
      default:
        return status
    }
  }
  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <span>#{id}</span>
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <span>
          {items.length} sản phẩm
          <div className='text-xs text-gray-500'>
            {items
              .map((item) => item.productName)
              .join(', ')
              .substring(0, 50)}
            {items.map((item) => item.productName).join(', ').length > 50 ? '...' : ''}
          </div>
        </span>
      )
    },
    {
      title: 'Tổng tiền',
      key: 'total',
      render: (_: any, record: ListOrder) => (
        <span className='font-medium text-red-500'>₫{formatCurrency(calculateOrderTotal(record))}</span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ListOrder) => (
        <div className='flex space-x-2'>
          <Button
            icon={<EyeOutlined />}
            type='primary'
            size='small'
            onClick={() => handleViewOrder(record.id)}
            className='bg-blue-500 hover:bg-blue-600'
          >
            Chi tiết
          </Button>
          {record.status === 'PENDING_PAYMENT' && (
            <CancelOrder
              order={record as any} // Use type assertion as a temporary fix
            />
          )}
        </div>
      )
    }
  ]

  // Handle pagination change
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)

    // Create a new queryConfig object instead of mutating the existing one
    const config = {
      ...queryConfig,
      page: pagination.current.toString(),
      limit: pagination.pageSize.toString()
    }
    navigate({
      pathname: `/manage/orders`,
      search: createSearchParams(omit(config, ['orderBy', 'sortBy'])).toString()
    })
  }

  if (isError) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <ExclamationCircleOutlined className='mb-4 text-5xl text-red-500' />
            <h2 className='mb-2 text-xl font-semibold'>Đã xảy ra lỗi</h2>
            <p className='mb-4 text-gray-500'>Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</p>
            <Button type='primary' onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    )
  }
  return (
    <div className='container mx-auto px-4 py-8'>
      <Card title='Quản lí đơn hàng' className='mb-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Spin size='large' tip='Đang tải đơn hàng...' />
          </div>
        ) : ordersData?.data?.data && ordersData.data.data.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={ordersData?.data?.data || []}
              rowKey='id'
              pagination={{
                current: page as number,
                pageSize: pageSize as number,
                total: ordersData?.data.totalItems,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} orders`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              onChange={handleTableChange}
              className='mb-4'
            />
          </>
        ) : (
          <Empty description='Bạn chưa có đơn hàng nào' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <Modal
          title={`Chi tiết đơn hàng #${selectedOrderId}`}
          open={isDetailModalVisible}
          onCancel={handleCloseDetailModal}
          width={1000}
          footer={null}
        >
          <OrderDetailContent orderId={selectedOrderId} />
        </Modal>
      )}
    </div>
  )
}

// Component to display order details inside modal
function OrderDetailContent({ orderId }: { orderId: number }) {
  const {
    data: orderData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => manageOrderApi.getDetailOrder(orderId),
    enabled: !!orderId
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Spin size='large' tip='Đang tải thông tin đơn hàng...' />
      </div>
    )
  }

  if (isError || !orderData?.data) {
    return (
      <div className='py-4 text-center'>
        <ExclamationCircleOutlined className='mb-2 text-3xl text-red-500' />
        <p>Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.</p>
      </div>
    )
  }

  return <DetailOrder order={orderData.data} />
}
