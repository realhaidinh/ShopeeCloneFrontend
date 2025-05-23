'use client'

import { useState } from 'react'
import { Button, Modal, Typography, message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { manageOrderApi } from 'src/apis/manageOrders.api'
import type { ListOrder } from 'src/types/order.type'

const { Text } = Typography

interface CancelOrderProps {
  order: ListOrder
}

export default function CancelOrder({ order }: CancelOrderProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const queryClient = useQueryClient()

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => manageOrderApi.cancelOrder(orderId),
    onSuccess: () => {
      message.success('Đã hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setIsModalVisible(false)
    },
    onError: (error) => {
      message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.')
      console.error('Error canceling order:', error)
    }
  })

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleConfirm = () => {
    cancelOrderMutation.mutate(order.id)
  }

  return (
    <>
      <Button danger icon={<DeleteOutlined />} size='small' onClick={showModal}>
        Hủy
      </Button>

      <Modal
        title={
          <div className='flex items-center gap-2'>
            <ExclamationCircleOutlined className='text-xl text-red-500' />
            <span>Xác nhận hủy đơn hàng</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Không
          </Button>,
          <Button key='submit' danger loading={cancelOrderMutation.isLoading} onClick={handleConfirm}>
            Hủy đơn hàng
          </Button>
        ]}
      >
        <div className='py-4'>
          <Text>
            Bạn có chắc chắn muốn hủy đơn hàng <Text strong>#{order.id}</Text>?
          </Text>
          <Text className='mt-2 block'>Đơn hàng sẽ bị hủy và không thể khôi phục.</Text>
        </div>
      </Modal>
    </>
  )
}
