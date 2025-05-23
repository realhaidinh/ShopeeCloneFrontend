'use client'

import { Modal, Typography, Image } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { Brand } from 'src/types/brand.type'

const { Text } = Typography

interface DeleteConfirmationProps {
  visible: boolean
  brand: Brand
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}

export default function DeleteConfirmation({
  visible,
  brand,
  onCancel,
  onConfirm,
  isLoading
}: DeleteConfirmationProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Delete Brand</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText='Delete'
      cancelText='Cancel'
      okButtonProps={{
        danger: true,
        loading: isLoading
      }}
      centered
    >
      <p>Are you sure you want to delete this brand?</p>
      <div
        style={{
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 4,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <Image
          src={brand.logo || '/placeholder.svg?height=40&width=40'}
          alt={brand.name}
          width={40}
          height={40}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback='/placeholder.svg?height=40&width=40'
        />
        <div>
          <Text strong>{brand.name}</Text>
        </div>
      </div>
      <p>This action cannot be undone.</p>
    </Modal>
  )
}
