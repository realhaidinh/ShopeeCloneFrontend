import { Modal, Form, Input, Switch, Button, message, Checkbox, Divider, Card, Row, Col } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState, useEffect } from 'react'
import { Role, CreateRoleReqBody, UpdateRoleReqBody } from 'src/types/role.type'
import { Permission } from 'src/types/permission.type'
import roleApi from 'src/apis/role.api'
import { permissionApi } from 'src/apis/permission.api'

interface RoleFormProps {
  visible: boolean
  role: Role | null
  isEditing: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function RoleForm({ visible, role, isEditing, onClose, onSuccess }: RoleFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Fetch permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionApi.getList({ page: 1, limit: 1000 }),
    enabled: visible // Only fetch when modal is visible
  })

  // Group permissions by module for better organization
  const groupedPermissions = React.useMemo(() => {
    if (!permissionsData?.data) return {}

    return permissionsData.data.data.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = []
      }
      acc[permission.module].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)
  }, [permissionsData?.data])

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: CreateRoleReqBody) => roleApi.create(data),
    onSuccess: () => {
      message.success('Role created successfully')
      queryClient.invalidateQueries(['roles'])
      form.resetFields()
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to create role')
      console.error(error)
    }
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleReqBody }) => roleApi.update(id, data),
    onSuccess: () => {
      message.success('Role updated successfully')
      queryClient.invalidateQueries(['roles'])
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to update role')
      console.error(error)
    }
  })

  // Fetch role details when editing
  const { data: roleDetail, isLoading: roleLoading } = useQuery({
    queryKey: ['role', role?.id],
    queryFn: () => roleApi.detail(role!.id),
    enabled: isEditing && !!role?.id && visible
  })

  // Reset form when modal opens/closes or role changes
  useEffect(() => {
    if (visible) {
      if (isEditing && role) {
        form.setFieldsValue({
          name: role.name,
          description: role.description,
          isActive: role.isActive
        })

        // If we have role details with permissions, set selected permissions
        if (roleDetail?.data?.permissions) {
          const permissionIds = roleDetail.data.permissions.map((p) => p.id)
          setSelectedPermissions(permissionIds)
        }
      } else {
        form.resetFields()
        setSelectedPermissions([])
      }
    }
  }, [visible, role, isEditing, form, roleDetail])

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = {
        ...values
      }

      if (isEditing && role) {
        // Update existing role with permissions
        updateRoleMutation.mutate({
          id: role.id,
          data: {
            ...formData,
            permissionIds: selectedPermissions
          } as UpdateRoleReqBody
        })
      } else {
        // Create new role
        createRoleMutation.mutate(formData as CreateRoleReqBody)
      }
    })
  }

  // Handle permission selection
  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionId])
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId))
    }
  }

  // Handle module selection (select/deselect all permissions in a module)
  const handleModuleChange = (module: string, permissions: Permission[], checked: boolean) => {
    const permissionIds = permissions.map((p) => p.id)

    if (checked) {
      // Add all permissions from this module that aren't already selected
      setSelectedPermissions((prev) => {
        const newPermissions = [...prev]
        permissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id)
          }
        })
        return newPermissions
      })
    } else {
      // Remove all permissions from this module
      setSelectedPermissions((prev) => prev.filter((id) => !permissionIds.includes(id)))
    }
  }

  // Check if all permissions in a module are selected
  const isModuleSelected = (permissions: Permission[]) => {
    return permissions.every((p) => selectedPermissions.includes(p.id))
  }

  // Check if some permissions in a module are selected
  const isModuleIndeterminate = (permissions: Permission[]) => {
    const selected = permissions.some((p) => selectedPermissions.includes(p.id))
    return selected && !isModuleSelected(permissions)
  }

  return (
    <Modal
      title={isEditing ? 'Edit Role' : 'Create Role'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          onClick={handleSubmit}
          loading={createRoleMutation.isLoading || updateRoleMutation.isLoading}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      ]}
      width={800}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          isActive: true
        }}
      >
        <Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter role name' }]}>
          <Input placeholder='Enter role name' />
        </Form.Item>

        <Form.Item
          name='description'
          label='Description'
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input.TextArea placeholder='Enter description' rows={3} />
        </Form.Item>

        <Form.Item name='isActive' label='Status' valuePropName='checked'>
          <Switch checkedChildren='Active' unCheckedChildren='Inactive' />
        </Form.Item>

        {isEditing && (
          <>
            <Divider orientation='left'>Permissions</Divider>

            {permissionsLoading || roleLoading ? (
              <div>Loading permissions...</div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Row gutter={[16, 16]}>
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <Col span={12} key={module}>
                      <Card
                        title={
                          <Checkbox
                            checked={isModuleSelected(permissions)}
                            indeterminate={isModuleIndeterminate(permissions)}
                            onChange={(e) => handleModuleChange(module, permissions, e.target.checked)}
                          >
                            {module}
                          </Checkbox>
                        }
                        size='small'
                      >
                        {permissions.map((permission) => (
                          <div key={permission.id} style={{ marginBottom: '8px' }}>
                            <Checkbox
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            >
                              <div>
                                <div>{permission.name}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                                  {permission.method} {permission.path}
                                </div>
                              </div>
                            </Checkbox>
                          </div>
                        ))}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </>
        )}
      </Form>
    </Modal>
  )
}
