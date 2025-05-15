import { useQuery } from '@tanstack/react-query'
import { Empty, Spin } from 'antd'
import productApi from 'src/apis/product.api'
import Pagination from 'src/components/Pagination'
import AsideFilter from 'src/pages/ProductList/AsideFilter'
import Product from 'src/pages/ProductList/Product/Product'
import SortProductList from 'src/pages/ProductList/SortProductList'
import { ProductListConfig } from 'src/types/product.type'
import { useParams } from 'react-router-dom'
import categoryApi from 'src/apis/category.api'
import useQueryConfig from 'src/hooks/useQueryConfig'

export default function ProductList() {
  const { categoryParentId } = useParams<{ categoryParentId: string }>()
  const queryConfig = useQueryConfig()
  const { data: productData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    keepPreviousData: true
  })
  const { data: categoryData } = useQuery({
    queryKey: ['categories', categoryParentId],
    queryFn: () => categoryApi.getChildrenCategories(Number(categoryParentId)),
    enabled: !!categoryParentId // tránh gọi khi null
  })

  const { data: parentCategoryData } = useQuery({
    queryKey: ['parentCategories', categoryParentId],
    queryFn: () => categoryApi.getDetailCategory(Number(categoryParentId)),
    enabled: !!categoryParentId // tránh gọi khi null
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
                parentCategoryData={parentCategoryData?.data || undefined}
              />
            </div>
            <div className='col-span-9'>
              {queryConfig.name && (
                <h1 className='text-md my-3 font-medium uppercase text-gray-600'>
                  Kết quả tìm kiếm cho từ khoá: {queryConfig.name}
                </h1>
              )}
              {productData ? (
                <>
                  <SortProductList
                    queryConfig={queryConfig}
                    categoryParentId={categoryParentId || undefined}
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
