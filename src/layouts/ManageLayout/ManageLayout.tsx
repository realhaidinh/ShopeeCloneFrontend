/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
'use client'

import type React from 'react'

import { useContext, useState } from 'react'
import { Layout, Breadcrumb, Button, theme, Dropdown, Badge, Avatar } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import ManageSidebar from 'src/components/ManageSidebar'
import { AppContext } from 'src/contexts/app.context'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import authApi from 'src/apis/auth.api'
import { toast } from 'react-toastify'
import { clearLocalStorage, getRefreshTokenFromLS } from 'src/utils/auth'

const { Header, Content, Footer } = Layout

interface ManageLayoutProps {
  children?: React.ReactNode
}

export default function ManageLayout({ children }: ManageLayoutProps) {
  const navigate = useNavigate()
  const { setIsAuthenticated, isAuthenticated, setProfile, profile } = useContext(AppContext)
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: (body: { refreshToken: string }) => authApi.logout(body),
    onSuccess: () => {
      setIsAuthenticated(false)
      setProfile(null)
      clearLocalStorage()
      toast.success('Logout successfully')
      navigate('/')
    }
  })
  const handleLogout = () => {
    console.log('Logout')
    const refreshToken = getRefreshTokenFromLS()
    logoutMutation.mutate({ refreshToken })
  }
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  // Generate breadcrumb items based on current path
  const generateBreadcrumb = () => {
    const pathSnippets = location.pathname.split('/').filter((i) => i)
    const breadcrumbItems = [
      {
        title: (
          <Link to='/manage/dashboard'>
            <HomeOutlined /> Trang chủ
          </Link>
        )
      }
    ]

    // Add additional breadcrumb items based on path
    if (pathSnippets.length > 1) {
      const title = pathSnippets[1]
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbItems.push({
        title: <span>{title}</span>
      })
    }

    return breadcrumbItems
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ManageSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
        >
          <Breadcrumb items={generateBreadcrumb()} />

          <div className='flex items-center'>
            <Button type='text' icon={<QuestionCircleOutlined />} className='mr-2'>
              Trợ giúp
            </Button>

            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Thông báo mới (3)',
                    type: 'group'
                  },
                  {
                    key: '2',
                    label: 'Đơn hàng mới #12345'
                  },
                  {
                    key: '3',
                    label: 'Sản phẩm hết hàng: Áo thun nam'
                  },
                  {
                    key: '4',
                    label: 'Cập nhật hệ thống'
                  },
                  {
                    type: 'divider'
                  },
                  {
                    key: '5',
                    label: <Link to='/manage/notifications'>Xem tất cả thông báo</Link>
                  }
                ]
              }}
              placement='bottomRight'
              arrow
            >
              <Badge count={3} className='mr-4'>
                <Button type='text' icon={<BellOutlined />} />
              </Badge>
            </Dropdown>

            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    icon: <UserOutlined />,
                    label: <Link to='/manage/profile'>Tài khoản của tôi</Link>
                  },
                  {
                    key: '2',
                    icon: <SettingOutlined />,
                    label: <Link to=''>Cài đặt</Link>
                  },
                  {
                    type: 'divider'
                  },
                  {
                    key: '3',
                    icon: <LogoutOutlined />,
                    label: 'Đăng xuất'
                  }
                ],
                onClick: ({ key }) => {
                  if (key === '3') {
                    handleLogout()
                  }
                }
              }}
              placement='bottomRight'
              arrow
            >
              <Button type='text'>
                <Avatar size='small' icon={<UserOutlined />} className='mr-2' />
                <span>Admin</span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            {children}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', background: 'white' }}>
          © {new Date().getFullYear()} Hệ thống quản lý bán hàng
        </Footer>
      </Layout>
    </Layout>
  )
}
