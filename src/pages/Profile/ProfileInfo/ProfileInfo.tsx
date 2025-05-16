import { Button, Card, Descriptions, Divider, Typography, Avatar } from 'antd'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import type { User } from 'src/types/user.type'

interface ProfileInfoProps {
  user: User
  onEdit: () => void
}

export default function ProfileInfo({ user, onEdit }: ProfileInfoProps) {
  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <Typography.Title level={4}>Thông tin tài khoản</Typography.Title>
        <Button type='primary' icon={<EditOutlined />} onClick={onEdit}>
          Chỉnh sửa
        </Button>
      </div>

      <Card>
        <div className='mb-6 flex flex-col items-center sm:flex-row sm:items-start'>
          <Avatar
            size={100}
            src={user.avatar || undefined}
            icon={!user.avatar && <UserOutlined />}
            className='mb-4 sm:mb-0 sm:mr-6'
          />

          <div className='flex-1'>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label='Họ và tên' span={2}>
                {user.name || 'Chưa cập nhật'}
              </Descriptions.Item>

              <Descriptions.Item label='Email' span={2}>
                {user.email}
              </Descriptions.Item>

              <Descriptions.Item label='Số điện thoại' span={2}>
                {user.phoneNumber || 'Chưa cập nhật'}
              </Descriptions.Item>

              <Descriptions.Item label='Trạng thái tài khoản' span={2}>
                {user.status === 'ACTIVE' ? (
                  <span className='text-green-500'>Hoạt động</span>
                ) : user.status === 'INACTIVE' ? (
                  <span className='text-orange-500'>Không hoạt động</span>
                ) : (
                  <span className='text-red-500'>Đã khóa</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label='Ngày tạo tài khoản' span={2}>
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        <Divider />

        <div className='flex justify-end'>
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Chỉnh sửa thông tin
          </Button>
        </div>
      </Card>
    </div>
  )
}
