import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Card, Pagination, message, Spin, Empty, Modal } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import purchaseApi from 'src/apis/purchaseApi'
import { formatCurrency } from 'src/utils/utils'
import type { ListOrder } from 'src/types/purchase.type'

const { confirm } = Modal

export default function Order() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch orders with correct pagination parameters
  const {
    data: ordersData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () => purchaseApi.getListOrders({ page, limit: pageSize })
  })

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => purchaseApi.cancelOrder(orderId),
    onSuccess: () => {
      message.success('Đã hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.')
      console.error('Error canceling order:', error)
    }
  })

  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    navigate(`/orders/${orderId}`)
  }

  // Handle cancel order
  const showCancelConfirm = (order: ListOrder) => {
    confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Đơn hàng sẽ bị hủy và không thể khôi phục.',
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        cancelOrderMutation.mutate(order.id)
      }
    })
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
            type='primary'
            icon={<EyeOutlined />}
            size='small'
            onClick={() => handleViewOrder(record.id)}
            className='bg-blue-500 hover:bg-blue-600'
          >
            Chi tiết
          </Button>
          {record.status === 'PENDING_PAYMENT' && (
            <Button danger icon={<DeleteOutlined />} size='small' onClick={() => showCancelConfirm(record)}>
              Hủy
            </Button>
          )}
        </div>
      )
    }
  ]

  // Handle pagination change
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
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
      <Card title='Đơn hàng của tôi' className='mb-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Spin size='large' tip='Đang tải đơn hàng...' />
          </div>
        ) : ordersData?.data?.data && ordersData.data.data.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={ordersData.data.data}
              rowKey='id'
              pagination={false}
              className='mb-4'
            />
            <div className='flex justify-end'>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={ordersData.data.totalItems}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `Tổng ${total} đơn hàng`}
              />
            </div>
          </>
        ) : (
          <Empty description='Bạn chưa có đơn hàng nào' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  )
}
