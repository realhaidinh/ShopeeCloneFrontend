import React from 'react'
import { Modal, Descriptions, Tag, Divider, Card, List, Typography } from 'antd'
import { Role } from 'src/types/role.type'
import { formatDate } from 'src/utils/utils'

const { Text } = Typography

interface RoleDetailProps {
  visible: boolean
  role: Role
  onClose: () => void
}

export default function RoleDetail({ visible, role, onClose }: RoleDetailProps) {
  return (
    <Modal title='Role Details' open={visible} onCancel={onClose} footer={null} width={900}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0 }}>{role.name}</h2>
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.45)' }}>{role.description}</p>
        </div>
      </div>

      <Divider />

      <Descriptions bordered column={2}>
        <Descriptions.Item label='ID'>{role.id}</Descriptions.Item>
        <Descriptions.Item label='Status'>
          <Tag color={role.isActive ? 'green' : 'red'}>{role.isActive ? 'Active' : 'Inactive'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label='Created At'>{formatDate(role.createdAt)}</Descriptions.Item>
        <Descriptions.Item label='Updated At'>{formatDate(role.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label='Created By'>{role.createdById}</Descriptions.Item>
        <Descriptions.Item label='Updated By'>{role.updatedById || '-'}</Descriptions.Item>
      </Descriptions>

      {role.deletedAt && (
        <>
          <Divider />
          <Descriptions bordered column={2}>
            <Descriptions.Item label='Deleted At'>{formatDate(role.deletedAt)}</Descriptions.Item>
            <Descriptions.Item label='Deleted By'>{role.deletedById || '-'}</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  )
}
