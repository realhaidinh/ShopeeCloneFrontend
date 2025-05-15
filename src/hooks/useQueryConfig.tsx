import { isUndefined, omitBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { orderBy, sortBy } from 'src/constants/product'
import useQueryParams from 'src/hooks/useQueryParams'
import { ProductListConfig } from 'src/types/product.type'
export type QueryConfig = {
  [key in keyof ProductListConfig]: string | string[]
}
export default function useQueryConfig() {
  const queryParams: QueryConfig = useQueryParams()
  const { categoryParentId } = useParams<{ categoryParentId: string }>()
  const queryConfig: QueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '10',
      name: queryParams.name,
      brandIds: queryParams.brandIds,
      categories: queryParams.categories || categoryParentId,
      minPrice: queryParams.minPrice,
      maxPrice: queryParams.maxPrice,
      createdById: queryParams.createdById,
      orderBy: queryParams.orderBy || orderBy.Desc,
      sortBy: queryParams.sortBy || sortBy.CreatedAt,
      lang: queryParams.lang || 'all'
    },
    isUndefined
  )
  return queryConfig
}
