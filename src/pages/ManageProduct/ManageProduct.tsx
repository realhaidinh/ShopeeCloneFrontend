import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Card, Pagination, message, Spin, Empty, Modal } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import useQueryConfig, { QueryConfig } from 'src/hooks/useQueryConfig'
import { ProductListConfig } from 'src/types/product.type'
import productApi from 'src/apis/product.api'
import { AppContext } from 'src/contexts/app.context'

const { confirm } = Modal

export default function ManageProduct() {
  const { profile } = useContext(AppContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  let queryConfig: QueryConfig = useQueryConfig()
  if (profile && profile.roleId === 3) {
    queryConfig = {
      ...queryConfig,
      createdById: profile.id.toString()
    }
  }
  const { data: productData } = useQuery({
    queryKey: ['products', useQueryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    keepPreviousData: true
  })

  return <div>ManageProductaaa</div>
}
