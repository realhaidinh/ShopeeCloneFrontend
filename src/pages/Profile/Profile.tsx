import { useState } from 'react'
import { Layout, Menu, Typography, Avatar, Spin } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  EditOutlined,
  LockOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import profileApi from 'src/apis/profile.api'
import type { User } from 'src/types/user.type'
import ProfileInfo from 'src/pages/Profile/ProfileInfo'
import ProfileEdit from 'src/pages/Profile/ProfileEdit'
import ChangePassword from 'src/pages/Profile/ChangePassword'
import OrderList from 'src/pages/Profile/OrderList'

const { Sider, Content } = Layout
const { Title } = Typography

type MenuKey =
  | 'profile'
  | 'edit-profile'
  | 'change-password'
  | 'orders-all'
  | 'orders-pending'
  | 'orders-processing'
  | 'orders-shipping'
  | 'orders-completed'
  | 'orders-cancelled'

export default function Profile() {
  const [selectedKey, setSelectedKey] = useState<MenuKey>('profile')

  // Fetch user profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile()
  })

  const user: User | undefined = profileData?.data

  const renderContent = () => {
    if (isLoadingProfile) {
      return (
        <div className='flex h-full items-center justify-center'>
          <Spin size='large' tip='Đang tải thông tin...' />
        </div>
      )
    }

    if (!user) {
      return (
        <div className='flex h-full items-center justify-center'>
          <Typography.Text type='danger'>Không thể tải thông tin người dùng. Vui lòng thử lại sau.</Typography.Text>
        </div>
      )
    }

    switch (selectedKey) {
      case 'profile':
        return <ProfileInfo user={user} onEdit={() => setSelectedKey('edit-profile')} />
      case 'edit-profile':
        return <ProfileEdit user={user} onSuccess={() => setSelectedKey('profile')} />
      case 'change-password':
        return <ChangePassword onSuccess={() => setSelectedKey('profile')} />
      case 'orders-all':
        return <OrderList status='all' />
      case 'orders-pending':
        return <OrderList status='PENDING_PAYMENT' />
      case 'orders-processing':
        return <OrderList status='PENDING_PICKUP' />
      case 'orders-shipping':
        return <OrderList status='PENDING_DELIVERY' />
      case 'orders-completed':
        return <OrderList status='DELIVERED' />
      case 'orders-cancelled':
        return <OrderList status='CANCELLED' />
      default:
        return <ProfileInfo user={user} onEdit={() => setSelectedKey('edit-profile')} />
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Title level={2} className='mb-6'>
        Tài khoản của tôi
      </Title>

      <Layout className='min-h-[600px] bg-white'>
        <Sider width={280} theme='light' className='rounded-l-lg border-r border-gray-200'>
          <div className='flex flex-col items-center border-b border-gray-200 p-6'>
            <Avatar
              size={80}
              src={user?.avatar || undefined}
              icon={!user?.avatar && <UserOutlined />}
              className='mb-3'
            />
            <Typography.Title level={5} className='mb-1'>
              {user?.name || 'Người dùng'}
            </Typography.Title>
            <Typography.Text type='secondary'>{user?.email || ''}</Typography.Text>
          </div>

          <Menu
            mode='inline'
            selectedKeys={[selectedKey]}
            style={{ borderRight: 0 }}
            onSelect={({ key }) => setSelectedKey(key as MenuKey)}
            items={[
              {
                key: 'account',
                label: 'Tài khoản của tôi',
                type: 'group',
                children: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Thông tin tài khoản'
                  },
                  {
                    key: 'edit-profile',
                    icon: <EditOutlined />,
                    label: 'Chỉnh sửa thông tin'
                  },
                  {
                    key: 'change-password',
                    icon: <LockOutlined />,
                    label: 'Đổi mật khẩu'
                  }
                ]
              },
              {
                key: 'orders',
                label: 'Đơn hàng của tôi',
                type: 'group',
                children: [
                  {
                    key: 'orders-all',
                    icon: <ShoppingOutlined />,
                    label: 'Tất cả đơn hàng'
                  },
                  {
                    key: 'orders-pending',
                    icon: <ClockCircleOutlined />,
                    label: 'Chờ thanh toán'
                  },
                  {
                    key: 'orders-processing',
                    icon: <ClockCircleOutlined />,
                    label: 'Chờ lấy hàng'
                  },
                  {
                    key: 'orders-shipping',
                    icon: <CarOutlined />,
                    label: 'Đang giao hàng'
                  },
                  {
                    key: 'orders-completed',
                    icon: <CheckCircleOutlined />,
                    label: 'Đã giao hàng'
                  },
                  {
                    key: 'orders-cancelled',
                    icon: <ExclamationCircleOutlined />,
                    label: 'Đã hủy'
                  }
                ]
              }
            ]}
          />
        </Sider>

        <Content className='rounded-r-lg bg-white p-6'>{renderContent()}</Content>
      </Layout>
    </div>
  )
}
