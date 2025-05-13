import { useQuery } from '@tanstack/react-query'
import { Carousel } from 'antd'
import { useState } from 'react'
import productApi from 'src/apis/product.api'
import Pagination from 'src/components/Pagination'
import useQueryParams from 'src/hooks/useQueryParams'
import AsideFilter from 'src/pages/ProductList/AsideFilter'
import Product from 'src/pages/ProductList/Product/Product'
import SortProductList from 'src/pages/ProductList/SortProductList'

export default function ProductList() {
  const queryParams = useQueryParams()
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => {
      return productApi.getProducts(queryParams)
    }
  })
  return (
    <div>
      <div className='my-5'>
        <Carousel className='w-3/4 mx-auto' autoplay={{ dotDuration: true }} autoplaySpeed={3000} arrows>
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
      <div className='bg-gray-200 py-6'>
        <div className='container'>
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-3'>
              <AsideFilter />
            </div>
            <div className='col-span-9'>
              <SortProductList />
              <div className='mt-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                {data &&
                  data.data.data.map((product) => (
                    <div key={product.id} className='col-span-1'>
                      <Product product={product} />
                    </div>
                  ))}
              </div>
              <Pagination
                page={page}
                setPage={setPage}
                totalPage={totalPage}
                setTotalPage={setTotalPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
