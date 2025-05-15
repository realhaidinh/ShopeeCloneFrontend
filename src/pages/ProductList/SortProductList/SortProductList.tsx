import { Select, Pagination } from 'antd'
import './index.css'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { ProductListConfig } from 'src/types/product.type'
import { omit } from 'lodash'
import { OrderBy } from 'src/constants/product'
import { QueryConfig } from 'src/hooks/useQueryConfig'

interface Props {
  queryConfig: QueryConfig
  totalPages: number
  totalItems: number
  categoryParentId: string | undefined
}
export default function SortProductList({ queryConfig, totalPages, totalItems, categoryParentId }: Props) {
  const navigate = useNavigate()
  const { sortBy, orderBy } = queryConfig

  const handleSort = (sortByValue: Exclude<ProductListConfig['sortBy'], undefined>) => {
    const config = categoryParentId
      ? omit(
          {
            ...queryConfig,
            sortBy: sortByValue
          },
          ['orderBy']
        )
      : omit(
          {
            ...queryConfig,
            sortBy: sortByValue
          },
          ['orderBy', 'categories']
        )

    navigate({
      pathname: `${categoryParentId ? `/categories/${categoryParentId}` : '/search'}`,
      search: createSearchParams(config).toString()
    })
  }
  const handlePriceOrder = (value: Exclude<ProductListConfig['orderBy'], undefined>) => {
    navigate({
      pathname: `${categoryParentId ? `/categories/${categoryParentId}` : '/search'}`,
      search: createSearchParams({
        ...queryConfig,
        sortBy: 'price',
        orderBy: value
      }).toString()
    })
  }
  return (
    <div className='bg-gray-300/40 py-4 px-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <div>Sắp xếp theo</div>
          <button
            className={`h-8 px-4 text-sm capitalize hover:bg-orange/80 ${
              sortBy === 'createdAt' ? 'bg-orange text-white' : 'bg-white text-black'
            }`}
            onClick={() => handleSort('createdAt')}
          >
            Mới nhất
          </button>
          <button
            className={`h-8 px-4 text-sm capitalize hover:bg-orange/80 ${
              sortBy === 'sale' ? 'bg-orange text-white' : 'bg-white text-black'
            }`}
            onClick={() => handleSort('sale')}
          >
            Bán chạy
          </button>
          <Select
            placeholder='Giá'
            value={sortBy === 'price' ? (orderBy as OrderBy | undefined) : undefined}
            className='custom-select'
            onChange={handlePriceOrder}
            // onSearch={onSearch}
            style={{ width: 200, height: '2.25rem' }}
            options={[
              {
                value: 'asc',
                label: 'Giá: Thấp đến Cao'
              },
              {
                value: 'desc',
                label: 'Giá: Cao đến Thấp'
              }
            ]}
          />
        </div>
        {/* <div>
          <Pagination size='small' simple defaultCurrent={1} pageSize={5} total={50} />
        </div> */}
      </div>
    </div>
  )
}
