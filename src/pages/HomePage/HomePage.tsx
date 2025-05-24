import { useQuery } from '@tanstack/react-query'
import { Carousel, Divider, Empty, Pagination, Spin } from 'antd'
import productApi from 'src/apis/product.api'
import useQueryConfig from 'src/hooks/useQueryConfig'
import Category from 'src/pages/HomePage/Category'
import Product from 'src/pages/ProductList/Product'
import { ProductListConfig } from 'src/types/product.type'

export default function HomePage() {
  const queryConfig = useQueryConfig()
  console.log(queryConfig)
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000
  })
  return (
    <div>
      <div className='my-5'>
        <Carousel className='mx-auto w-3/4' autoplay={{ dotDuration: true }} autoplaySpeed={3000} arrows>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfgt-m9ju2anplprdb9_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rff0-m9ju25er8tr6d1_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfgr-m9k2ny16t5jt56_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/vn-11134258-7ra0g-m9jtwjmghsp39a_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfez-m9jtqueetalj51_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfg9-m9jtpbj53x5u4e_xxhdpi' alt='' />
          </div>
        </Carousel>
      </div>
      <div className='container my-5'>
        <Category />
      </div>
      <div className='container my-5 px-8'>
        <Divider />
        <div className='my-6 text-lg font-semibold uppercase text-gray-700'>Sản phẩm mới</div>
        {isLoading && (
          <div className='flex items-center justify-center'>
            <Spin size='large' />
          </div>
        )}
        {productData ? (
          <>
            {productData?.data.data.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} />
            ) : (
              <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
                {productData.data.data.map((product) => (
                  <div key={product.id} className='col-span-1'>
                    <Product product={product} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className='mt-6 flex items-center justify-center'>Không có dữ liệu</div>
        )}
      </div>
    </div>
  )
}
