import { useState } from 'react'
import { Table, Tag, Button, Card, Typography, Empty, Spin, Pagination } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import purchaseApi from 'src/apis/purchaseApi'
import { formatCurrency } from 'src/utils/utils'

interface OrderListProps {
  status: 'all' | 'PENDING_PAYMENT' | 'PENDING_PICKUP' | 'PENDING_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
}

export default function OrderList({ status }: OrderListProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch orders with status filter if not "all"
  const {
    data: ordersData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['orders', status, page, pageSize],
    queryFn: () =>
      purchaseApi.getListOrders({
        page,
        limit: pageSize,
        ...(status !== 'all' ? { status } : {})
      })
  })

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

  // Calculate total price for an order
  const calculateOrderTotal = (order: any) => {
    return order.items.reduce((total: number, item: any) => total + item.skuPrice * item.quantity, 0)
  }

  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    navigate(`/orders/${orderId}`)
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
      render: (_: any, record: any) => (
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
      render: (_: any, record: any) => (
        <Button
          type='primary'
          icon={<EyeOutlined />}
          size='small'
          onClick={() => handleViewOrder(record.id)}
          className='bg-blue-500 hover:bg-blue-600'
        >
          Chi tiết
        </Button>
      )
    }
  ]

  // Render loading state
  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Spin size='large' tip='Đang tải đơn hàng...' />
      </div>
    )
  }

  // Render error state
  if (isError) {
    return (
      <div className='flex h-64 flex-col items-center justify-center'>
        <Typography.Text type='danger' className='mb-2'>
          Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.
        </Typography.Text>
        <Button type='primary' onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  // Render empty state
  if (!ordersData?.data?.data || ordersData.data.data.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center'>
        <Empty description={`Không có đơn hàng nào${status !== 'all' ? ' ở trạng thái này' : ''}`} />
      </div>
    )
  }

  return (
    <div>
      <Typography.Title level={4} className='mb-4'>
        {status === 'all' ? 'Tất cả đơn hàng' : `Đơn hàng ${getStatusText(status).toLowerCase()}`}
      </Typography.Title>

      <Card>
        <Table columns={columns} dataSource={ordersData.data.data} rowKey='id' pagination={false} className='mb-4' />

        <div className='flex justify-end'>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={ordersData.data.totalItems}
            onChange={(page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            }}
            showSizeChanger
            showTotal={(total) => `Tổng ${total} đơn hàng`}
          />
        </div>
      </Card>
    </div>
  )
}
