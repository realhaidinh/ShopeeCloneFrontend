import { useQuery } from '@tanstack/react-query'
import { Carousel, Empty, Spin } from 'antd'
import { useState } from 'react'
import { omitBy, isUndefined } from 'lodash'
import productApi from 'src/apis/product.api'
import Pagination from 'src/components/Pagination'
import useQueryParams from 'src/hooks/useQueryParams'
import AsideFilter from 'src/pages/ProductList/AsideFilter'
import Product from 'src/pages/ProductList/Product/Product'
import SortProductList from 'src/pages/ProductList/SortProductList'
import { ProductListConfig } from 'src/types/product.type'
import { orderBy, sortBy } from 'src/constants/product'
import { useParams } from 'react-router-dom'
import categoryApi from 'src/apis/category.api'

export type QueryConfig = {
  [key in keyof ProductListConfig]: string | string[]
}

export default function ProductList() {
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
      sortBy: queryParams.sortBy || sortBy.CreatedAt
    },
    isUndefined
  )
  const { data: productData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    keepPreviousData: true
  })
  const { data: categoryData } = useQuery({
    queryKey: ['categories', categoryParentId],
    queryFn: () => {
      return categoryApi.getChildrenCategories(Number(categoryParentId))
    }
  })
  const { data: parentCategoryData } = useQuery({
    queryKey: ['parentCategories', categoryParentId],
    queryFn: () => {
      return categoryApi.getDetailCategory(Number(categoryParentId))
    }
  })
  return (
    <div>
      <div className='bg-gray-200 py-6'>
        <div className='container'>
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-3'>
              <AsideFilter
                queryConfig={queryConfig}
                categoryData={categoryData?.data.data || []}
                parentCategoryData={parentCategoryData?.data}
              />
            </div>
            <div className='col-span-9'>
              {productData ? (
                <>
                  <SortProductList
                    queryConfig={queryConfig}
                    categoryParentId={categoryParentId}
                    totalPages={productData.data.totalPages}
                    totalItems={productData.data.totalItems}
                  />
                  {productData?.data.data.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} />
                  ) : (
                    <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                      {productData.data.data.map((product) => (
                        <div key={product.id} className='col-span-1'>
                          <Product product={product} />
                        </div>
                      ))}
                    </div>
                  )}

                  <Pagination
                    queryConfig={queryConfig}
                    totalPages={productData.data.totalPages}
                    totalItems={productData.data.totalItems}
                  />
                </>
              ) : (
                <div className='mt-6 flex items-center justify-center'>
                  <Spin size='large' />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
