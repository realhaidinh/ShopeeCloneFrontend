import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Carousel, Divider, Empty, Spin } from 'antd'
import { useEffect, useRef } from 'react'
import brandApi from 'src/apis/brand.api'
import productApi from 'src/apis/product.api'
import Category from 'src/pages/HomePage/Category'
import Product from 'src/pages/ProductList/Product'

const LIMIT = 10

export default function HomePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => productApi.getProducts({ page: pageParam, limit: LIMIT }),
    getNextPageParam: (lastPage, allPages) => {
      const total = lastPage.data.totalItems
      const currentPage = allPages.length
      return currentPage * LIMIT < total ? currentPage + 1 : undefined
    }
  })

  const observerRef = useRef<HTMLDivElement>(null)

  const { data: brandsData, isError } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getBrands({ page: 1, limit: 10000 }),
    keepPreviousData: true
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }
    )
    if (observerRef.current) {
      observer.observe(observerRef.current)
    }
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [observerRef.current, hasNextPage, isFetchingNextPage])

  return (
    <div>
      {/* Carousel */}
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

      {/* Danh mục */}
      <div className='container my-5'>
        <Category />
      </div>

      {/* Thương hiệu */}
      {brandsData && !isError && (
        <div className='container my-5 px-8'>
          <Divider />
          <div className='my-6 text-lg font-semibold uppercase text-gray-700'>Thương hiệu</div>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
            {brandsData.data.data.map((brand) => (
              <div key={brand.id} className='col-span-1'>
                <div className='group flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-4 shadow '>
                  <img src={brand.logo} alt={brand.name} className='mb-2 h-16 w-16 object-contain' />
                  <div className='text-center text-sm font-medium text-gray-700 group-hover:text-orange'>
                    {brand.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sản phẩm */}
      <div className='container my-5 px-8'>
        <Divider />
        <div className='my-6 text-lg font-semibold uppercase text-gray-700'>Sản phẩm mới</div>

        {isLoading && (
          <div className='flex items-center justify-center'>
            <Spin size='large' />
          </div>
        )}

        {data && (
          <>
            {data.pages[0].data.data.length === 0 ? (
              <Empty description='Không có sản phẩm' />
            ) : (
              <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
                {data.pages.map((page) =>
                  page.data.data.map((product) => (
                    <div key={product.id} className='col-span-1'>
                      <Product product={product} />
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {isFetchingNextPage && (
          <div className='mt-4 flex items-center justify-center'>
            <Spin />
          </div>
        )}

        {/* Trigger load next page */}
        <div ref={observerRef} className='h-1'></div>
      </div>
    </div>
  )
}
