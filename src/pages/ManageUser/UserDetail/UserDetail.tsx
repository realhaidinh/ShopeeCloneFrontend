import { Modal, Descriptions, Avatar, Tag, Divider } from 'antd'
import { type User, UserStatus } from 'src/types/user.type'
import { UserOutlined } from '@ant-design/icons'
import { formatDate } from 'src/utils/utils'

interface UserDetailProps {
  visible: boolean
  user: User
  onClose: () => void
}

const UserDetail = ({ visible, user, onClose }: UserDetailProps) => {
  // Status tag renderer
  const renderStatusTag = (status: typeof UserStatus[keyof typeof UserStatus]) => {
    let color = 'green'
    if (status === UserStatus.INACTIVE) color = 'orange'
    if (status === UserStatus.BLOCKED) color = 'red'

    return <Tag color={color}>{status}</Tag>
  }

  return (
    <Modal title='User Details' open={visible} onCancel={onClose} footer={null} width={900}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <Avatar size={64} src={user.avatar} icon={!user.avatar ? <UserOutlined /> : undefined} />
        <div style={{ marginLeft: 16 }}>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.45)' }}>{user.email}</p>
        </div>
      </div>

      <Divider />

      <Descriptions bordered column={2}>
        <Descriptions.Item label='ID'>{user.id}</Descriptions.Item>
        <Descriptions.Item label='Status'>{renderStatusTag(user.status)}</Descriptions.Item>
        <Descriptions.Item label='Phone Number'>{user.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label='Role'>{user.role?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label='Created At'>{formatDate(user.createdAt)}</Descriptions.Item>
        <Descriptions.Item label='Updated At'>{formatDate(user.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label='Created By'>{user.createdById || '-'}</Descriptions.Item>
        <Descriptions.Item label='Updated By'>{user.updatedById || '-'}</Descriptions.Item>
      </Descriptions>

      {user.deletedAt && (
        <>
          <Divider />
          <Descriptions bordered column={2}>
            <Descriptions.Item label='Deleted At'>{formatDate(user.deletedAt)}</Descriptions.Item>
            <Descriptions.Item label='Deleted By'>{user.deletedById || '-'}</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  )
}

export default UserDetail
