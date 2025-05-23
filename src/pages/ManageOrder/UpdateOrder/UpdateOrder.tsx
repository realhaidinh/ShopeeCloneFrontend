'use client'

import { useState } from 'react'
import { Button, Select, Form, message, Modal } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EditOutlined } from '@ant-design/icons'
import { manageOrderApi } from 'src/apis/manageOrders.api'
import { type Order, OrderStatus, type ChangeOrderStatusReqBody } from 'src/types/order.type'

interface UpdateOrderProps {
  order: Order
}

export default function UpdateOrder({ order }: UpdateOrderProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

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

  // Create status options for select
  const statusOptions = Object.keys(OrderStatus).map((key) => {
    const value = OrderStatus[key as keyof typeof OrderStatus]
    return {
      value,
      label: getStatusText(value)
    }
  })

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: ChangeOrderStatusReqBody }) =>
      manageOrderApi.changeStatusOrder(id, body),
    onSuccess: () => {
      message.success('Cập nhật trạng thái đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['order', order.id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setIsModalVisible(false)
      form.resetFields()
    },
    onError: (error) => {
      message.error('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.')
      console.error('Error updating order status:', error)
    }
  })

  const showModal = () => {
    form.setFieldsValue({ status: order.status })
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleSubmit = (values: { status: string }) => {
    if (values.status === order.status) {
      message.info('Trạng thái đơn hàng không thay đổi')
      return
    }

    updateOrderMutation.mutate({
      id: order.id,
      body: { status: values.status as typeof OrderStatus[keyof typeof OrderStatus] }
    })
  }

  return (
    <>
      <Button type='primary' icon={<EditOutlined />} onClick={showModal} className='bg-blue-500 hover:bg-blue-600'>
        Cập nhật trạng thái
      </Button>

      <Modal title='Cập nhật trạng thái đơn hàng' open={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} layout='vertical' onFinish={handleSubmit} initialValues={{ status: order.status }}>
          <Form.Item
            name='status'
            label='Trạng thái đơn hàng'
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái đơn hàng' }]}
          >
            <Select options={statusOptions} />
          </Form.Item>

          <div className='flex justify-end gap-2'>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type='primary'
              htmlType='submit'
              loading={updateOrderMutation.isLoading}
              className='bg-blue-500 hover:bg-blue-600'
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}
