'use client'

import { Descriptions, Table, Tag, Typography, Divider, Image } from 'antd'
import { formatCurrency } from 'src/utils/utils'
import { OrderStatus, type ListOrderItem, type Order } from 'src/types/order.type'
import UpdateOrder from 'src/pages/ManageOrder/UpdateOrder'

const { Text } = Typography

interface DetailOrderProps {
  order: Order
}

export default function DetailOrder({ order }: DetailOrderProps) {
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

  // Calculate total price for the order
  const calculateOrderTotal = (items: ListOrderItem[] = []) => {
    return items.reduce((total, item) => total + item.skuPrice * item.quantity, 0)
  }

  // Table columns for order items
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => <Image src={image || '/placeholder.svg'} alt='Product' width={80} height={80} />
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'SKU',
      dataIndex: 'skuValue',
      key: 'skuValue'
    },
    {
      title: 'Đơn giá',
      dataIndex: 'skuPrice',
      key: 'skuPrice',
      render: (price: number) => <Text type='danger'>₫{formatCurrency(price)}</Text>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, record: ListOrderItem) => (
        <Text strong type='danger'>
          ₫{formatCurrency(record.skuPrice * record.quantity)}
        </Text>
      )
    }
  ]

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <Tag color={getStatusColor(order.status)} className='px-3 py-1 text-base'>
          {getStatusText(order.status)}
        </Tag>
        {order.status !== OrderStatus.CANCELLED &&
          order.status !== OrderStatus.PENDING_PAYMENT &&
          order.status !== OrderStatus.DELIVERED && <UpdateOrder order={order} />}
      </div>

      <Divider orientation='left'>Thông tin đơn hàng</Divider>
      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
        <Descriptions.Item label='Mã đơn hàng'>#{order.id}</Descriptions.Item>
        <Descriptions.Item label='Ngày đặt hàng'>{new Date(order.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label='Ngày cập nhật'>{new Date(order.updatedAt).toLocaleString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label='Mã thanh toán'>#{order.paymentId}</Descriptions.Item>
        <Descriptions.Item label='Mã cửa hàng'>#{order.shopId}</Descriptions.Item>
        <Descriptions.Item label='Mã người dùng'>#{order.userId}</Descriptions.Item>
      </Descriptions>

      <Divider orientation='left'>Thông tin người nhận</Divider>
      <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
        <Descriptions.Item label='Tên người nhận'>{order.receiver.name}</Descriptions.Item>
        <Descriptions.Item label='Số điện thoại'>{order.receiver.phone}</Descriptions.Item>
        <Descriptions.Item label='Địa chỉ' span={2}>
          {order.receiver.address}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation='left'>Danh sách sản phẩm</Divider>
      <Table
        columns={columns}
        dataSource={order.items || []}
        rowKey='id'
        pagination={false}
        summary={(pageData) => {
          const total = calculateOrderTotal(order.items)
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5} className='text-right'>
                  <Text strong>Tổng tiền:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong type='danger' className='text-lg'>
                    ₫{formatCurrency(total)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )
        }}
      />
    </div>
  )
}
