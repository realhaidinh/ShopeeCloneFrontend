'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Table, Space, Tag, message, Pagination } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { omit } from 'lodash'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useQueryConfig, { type QueryConfig } from 'src/hooks/useQueryConfig'
import type { Role } from 'src/types/role.type'
import roleApi from 'src/apis/role.api'
import DeleteConfirmation from 'src/pages/ManageRole/DeleteConfirmation'
import RoleDetail from 'src/pages/ManageRole/RoleDetail'
import RoleForm from 'src/pages/ManageRole/RoleForm'
import { formatDate } from 'src/utils/utils'

export default function ManageRole() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  let queryConfig: QueryConfig = useQueryConfig()
  // Remove orderBy and sortBy because default value is undefined
  queryConfig = omit(queryConfig, ['orderBy', 'sortBy', 'lang'])
  const [page, setPage] = useState(queryConfig.page || 1)
  const [pageSize, setPageSize] = useState(queryConfig.limit || 10)

  const [isDetailVisible, setIsDetailVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const {
    data: rolesData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['roles', { page, limit: pageSize }],
    queryFn: () => {
      return roleApi.getList({ page: page as number, limit: pageSize as number })
    },
    keepPreviousData: true
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => roleApi.delete(roleId),
    onSuccess: () => {
      message.success('Role deleted successfully')
      queryClient.invalidateQueries(['roles'])
      setIsDeleteVisible(false)
    },
    onError: (error) => {
      message.error('Failed to delete role')
      console.error(error)
    }
  })

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  const handleViewDetails = (role: Role) => {
    setSelectedRole(role)
    setIsDetailVisible(true)
  }

  // Handle create role
  const handleCreateRole = () => {
    setSelectedRole(null)
    setIsEditing(false)
    setIsFormVisible(true)
  }

  // Handle edit role
  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsEditing(true)
    setIsFormVisible(true)
  }

  // Handle delete role
  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteVisible(true)
  }

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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space size='middle'>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          <Button type='text' icon={<EditOutlined />} onClick={() => handleEditRole(record)} />
          <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDeleteRole(record)} />
        </Space>
      )
    }
  ]

  return (
    <div className='manage-role-container'>
      <div className='header-actions' style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Manage Roles</h2>
        <Button icon={<PlusOutlined />} onClick={handleCreateRole}>
          Add Role
        </Button>
      </div>

      <Table dataSource={rolesData?.data.data} columns={columns} rowKey='id' loading={isLoading} pagination={false} />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page as number}
          pageSize={pageSize as number}
          total={rolesData?.data.totalItems || 0}
          onChange={handlePaginationChange}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      {/* Role Detail Modal */}
      {selectedRole && (
        <RoleDetail visible={isDetailVisible} role={selectedRole} onClose={() => setIsDetailVisible(false)} />
      )}

      {/* Role Form Modal (Create/Update) */}
      <RoleForm
        visible={isFormVisible}
        role={selectedRole}
        isEditing={isEditing}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => {
          setIsFormVisible(false)
          queryClient.invalidateQueries(['roles'])
        }}
      />

      {/* Delete Confirmation Modal */}
      {selectedRole && (
        <DeleteConfirmation
          visible={isDeleteVisible}
          role={selectedRole}
          onCancel={() => setIsDeleteVisible(false)}
          onConfirm={() => deleteRoleMutation.mutate(selectedRole.id)}
          isLoading={deleteRoleMutation.isLoading}
        />
      )}
    </div>
  )
}
