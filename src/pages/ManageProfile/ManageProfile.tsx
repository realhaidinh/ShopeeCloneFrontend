import { useQuery } from '@tanstack/react-query'
import { Card, Descriptions, Typography, Avatar, Spin } from 'antd'
import profileApi from 'src/apis/profile.api'
import { User } from 'src/types/user.type'
import { UserOutlined } from '@ant-design/icons'

export default function ManageProfile() {
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile()
  })
  const user: User | undefined = profileData?.data

  return (
    <div>
      {isLoadingProfile && (
        <div className='flex h-full items-center justify-center'>
          <Spin size='large' tip='Đang tải thông tin...' />
        </div>
      )}
      {!user && (
        <div className='flex h-full items-center justify-center'>
          <Typography.Text type='danger'>Không thể tải thông tin người dùng. Vui lòng thử lại sau.</Typography.Text>
        </div>
      )}
      {user && (
        <div>
          <div className='mb-4 flex items-center justify-between'>
            <Typography.Title level={4}>Thông tin tài khoản</Typography.Title>
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
                  <Descriptions.Item label='Vai trò' span={2}>
                    {user.roleId === 1 ? (
                      <span className='text-blue-500'>Admin</span>
                    ) : user.roleId === 2 ? (
                      <span className='text-blue-500'>Khách hàng</span>
                    ) : (
                      <span className='text-blue-500'>Người bán hàng</span>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
