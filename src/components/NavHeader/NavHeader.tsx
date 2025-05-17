import { useContext, useEffect, useState } from 'react'
import { createSearchParams, Link, useNavigate, useParams } from 'react-router-dom'
import { Select, Dropdown, Space, Button, Popover, Badge, message } from 'antd'
import type { MenuProps } from 'antd'
import { DownOutlined, UserOutlined } from '@ant-design/icons'
import { AppContext } from 'src/contexts/app.context'
import { getRefreshTokenFromLS } from 'src/utils/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import authApi from 'src/apis/auth.api'
import { toast } from 'react-toastify'

export default function NavHeader() {
  const { setIsAuthenticated, isAuthenticated, setProfile, profile } = useContext(AppContext)
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: (body: { refreshToken: string }) => authApi.logout(body),
    onSuccess: () => {
      setIsAuthenticated(false)
      setProfile(null)
      toast.success('Logout successfully')
      queryClient.removeQueries({ queryKey: ['purchases'] })
    }
  })
  const handleLogout = () => {
    const refreshToken = getRefreshTokenFromLS()
    logoutMutation.mutate({ refreshToken })
  }
  const { Option } = Select
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <Link to='/profile'>Tài khoản của tôi</Link>
    },
    {
      key: '2',
      label: <Link to='/orders'>Đơn mua</Link>
    }
  ]
  if (profile?.roleId !== 2) {
    items.push(
      {
        key: '3',
        label: <Link to='/manage/profile'>Quản lí</Link>
      },
      {
        key: '4',
        label: (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <span onClick={handleLogout} className='block w-full cursor-pointer'>
            Đăng xuất
          </span>
        )
      }
    )
  } else {
    items.push({
      key: '4',
      label: (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <span onClick={handleLogout} className='block w-full cursor-pointer'>
          Đăng xuất
        </span>
      )
    })
  }
  return (
    <div className='flex justify-end'>
      <div className='flex cursor-pointer items-center py-1'>
        <span className='mr-2'>Ngôn ngữ</span>
        <Select
          onSelect={(value) => console.log(value)}
          placeholder='Select language'
          className='ml-2 w-[9rem]'
          defaultValue='vi'
        >
          <Option value='vi'>
            <span className='flex items-center'>
              <img src='https://flagcdn.com/w40/vn.png' alt='vn' className='mr-2 h-4 w-6' />
              Tiếng Việt
            </span>
          </Option>
          <Option value='en'>
            <span className='flex items-center'>
              <img src='https://flagcdn.com/w40/gb.png' alt='en' className='mr-2 h-4 w-6' />
              English
            </span>
          </Option>
        </Select>
      </div>
      {isAuthenticated && (
        <div className='ml-6 flex cursor-pointer items-center py-1 hover:text-gray-300'>
          <div className='mr-1 h-6 w-6 flex-shrink-0'>
            <UserOutlined style={{ fontSize: '20px' }} />
          </div>
          <Dropdown menu={{ items }}>
            <Space>
              Hi, {profile?.email}
              <DownOutlined className='text-xs' />
            </Space>
          </Dropdown>
        </div>
      )}
      {!isAuthenticated && (
        <div className='flex items-center'>
          <Link to='/register' className='mx-3 capitalize hover:text-white/70'>
            Đăng ký
          </Link>
          <div className='h-4 border-r-[1px] border-r-white/40' />
          <Link to='/login' className='mx-3 capitalize hover:text-white/70'>
            Đăng nhập
          </Link>
        </div>
      )}
    </div>
  )
}
