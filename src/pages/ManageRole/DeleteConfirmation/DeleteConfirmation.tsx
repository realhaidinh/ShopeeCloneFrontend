import React from 'react'
import { Modal, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Role } from 'src/types/role.type'
const { Text } = Typography

interface DeleteConfirmationProps {
  visible: boolean
  role: Role
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}

export default function DeleteConfirmation({ visible, role, onCancel, onConfirm, isLoading }: DeleteConfirmationProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Delete Role</span>
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
      <p>Are you sure you want to delete this role?</p>
      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 16 }}>
        <Text strong>{role.name}</Text>
      </div>
      <p>This action cannot be undone.</p>
    </Modal>
  )
}
