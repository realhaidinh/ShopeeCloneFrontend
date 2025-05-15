import type { PaginationProps } from 'antd'
import { Pagination as PaginationAntd } from 'antd'
import { useNavigate, createSearchParams, useParams } from 'react-router-dom'
import { QueryConfig } from 'src/hooks/useQueryConfig'

interface Props {
  queryConfig: QueryConfig
  totalPages: number
  totalItems: number
}

export default function Pagination({ queryConfig, totalPages, totalItems }: Props) {
  const page = Number(queryConfig.page)
  const limit = Number(queryConfig.limit)
  const { categoryParentId } = useParams<{ categoryParentId: string }>()
  const navigate = useNavigate()
  const onChange: PaginationProps['onChange'] = (pageNumber) => {
    navigate({
      pathname: `${categoryParentId ? `/categories/${categoryParentId}` : '/search'}`,
      search: createSearchParams({
        ...queryConfig,
        page: pageNumber.toString()
      }).toString()
    })
  }
  const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
    console.log(current, pageSize)
  }
  return (
    <div className='mt-6'>
      <PaginationAntd
        align='center'
        showTotal={(totalItems, range) => `${range[0]}-${range[1]} of ${totalItems} items`}
        showQuickJumper
        current={page} // dùng current thay vì defaultCurrent
        total={totalItems}
        onChange={onChange}
        style={{ textAlign: 'center' }}
        onShowSizeChange={onShowSizeChange}
        pageSize={limit}
      />
    </div>
  )
}
