import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Table, Space, Tag, message, Pagination } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { omit } from 'lodash'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userApi from 'src/apis/user.api'
import useQueryConfig, { type QueryConfig } from 'src/hooks/useQueryConfig'
import { type User, UserStatus } from 'src/types/user.type'
import UserDetail from 'src/pages/ManageUser/UserDetail'
import UserForm from 'src/pages/ManageUser/UserForm/UserForm'
import DeleteConfirmation from 'src/pages/ManageUser/DeleteConfirmation'

export default function ManageUser() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  let queryConfig: QueryConfig = useQueryConfig()
  // Remove orderBy and sortBy because default value is undefined
  queryConfig = omit(queryConfig, ['orderBy', 'sortBy', 'lang'])
  const [page, setPage] = useState(queryConfig.page || 1)
  const [pageSize, setPageSize] = useState(queryConfig.limit || 10)

  // State for modals
  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch users data
  const {
    data: usersData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['users', { page, limit: pageSize }],
    queryFn: () => {
      return userApi.getList({ page: page as number, limit: pageSize as number })
    },
    keepPreviousData: true
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),
    onSuccess: () => {
      message.success('User deleted successfully')
      queryClient.invalidateQueries(['users'])
      setIsDeleteVisible(false)
    },
    onError: (error) => {
      message.error('Failed to delete user')
      console.error(error)
    }
  })

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  // Handle view user details
  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailVisible(true)
  }

  // Handle create user
  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsEditing(false)
    setIsFormVisible(true)
  }

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditing(true)
    setIsFormVisible(true)
  }

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setIsDeleteVisible(true)
  }

  // Status tag renderer
  const renderStatusTag = (status: typeof UserStatus[keyof typeof UserStatus]) => {
    let color = 'yellow'
    if (status === UserStatus.INACTIVE) color = 'orange'
    if (status === UserStatus.BLOCKED) color = 'red'

    return <Tag color={color}>{status}</Tag>
  }

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: any) => role?.name || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size='middle'>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          <Button type='text' icon={<EditOutlined />} onClick={() => handleEditUser(record)} />
          <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record)} />
        </Space>
      )
    }
  ]

  return (
    <div className='manage-user-container'>
      <div className='header-actions' style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Manage Users</h2>
        <Button icon={<PlusOutlined />} onClick={handleCreateUser}>
          Add User
        </Button>
      </div>

      <Table dataSource={usersData?.data.data} columns={columns} rowKey='id' loading={isLoading} pagination={false} />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page as number}
          pageSize={pageSize as number}
          total={usersData?.data.totalItems || 0}
          onChange={handlePaginationChange}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetail visible={isDetailVisible} user={selectedUser} onClose={() => setIsDetailVisible(false)} />
      )}

      {/* User Form Modal (Create/Update) */}
      <UserForm
        visible={isFormVisible}
        user={selectedUser}
        isEditing={isEditing}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => {
          setIsFormVisible(false)
          queryClient.invalidateQueries(['users'])
        }}
      />

      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <DeleteConfirmation
          visible={isDeleteVisible}
          user={selectedUser}
          onCancel={() => setIsDeleteVisible(false)}
          onConfirm={() => deleteUserMutation.mutate(selectedUser.id)}
          isLoading={deleteUserMutation.isLoading}
        />
      )}
    </div>
  )
}
