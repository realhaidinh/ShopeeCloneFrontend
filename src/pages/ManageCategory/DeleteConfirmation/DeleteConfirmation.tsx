import { Modal, Typography, Image } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { Category } from 'src/types/category.type'

const { Text } = Typography

interface DeleteConfirmationProps {
  visible: boolean
  category: Category
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}

export default function DeleteConfirmation({
  visible,
  category,
  onCancel,
  onConfirm,
  isLoading
}: DeleteConfirmationProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Delete Category</span>
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
      <p>Are you sure you want to delete this category?</p>
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
          src={category.logo || '/placeholder.svg?height=40&width=40'}
          alt={category.name}
          width={40}
          height={40}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback='/placeholder.svg?height=40&width=40'
        />
        <div>
          <Text strong>{category.name}</Text>
          {category.parentCategoryId && (
            <div>
              <Text type='secondary'>Parent ID: {category.parentCategoryId}</Text>
            </div>
          )}
        </div>
      </div>
      <p>This action cannot be undone.</p>
    </Modal>
  )
}
