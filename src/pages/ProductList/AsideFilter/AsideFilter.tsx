import { createSearchParams, Link, useNavigate, useParams } from 'react-router-dom'
import { UnorderedListOutlined, CaretRightOutlined, FilterOutlined } from '@ant-design/icons'
import type { InputNumberProps, SliderSingleProps } from 'antd'
import { InputNumber, Slider, Space, Rate, Select, message } from 'antd'
import { Category } from 'src/types/category.type'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import brandApi from 'src/apis/brand.api'
import { Brand } from 'src/types/brand.type'
import { omit, omitBy } from 'lodash'
import { QueryConfig } from 'src/hooks/useQueryConfig'
import { useQuery } from '@tanstack/react-query'

interface Props {
  queryConfig: QueryConfig
  categoryData: Category[]
  parentCategoryData?: Category
}

export default function AsideFilter({ queryConfig, categoryData, parentCategoryData }: Props) {
  const { categories, brandIds } = queryConfig
  const { categoryParentId } = useParams<{ categoryParentId: string }>()
  const navigate = useNavigate()
  const [minPrice, setMinPrice] = useState(Number(queryConfig.minPrice) || 0)
  const [maxPrice, setMaxPrice] = useState(Number(queryConfig.maxPrice) || 0)
  const [selectedBrands, setSelectedBrands] = useState<string[]>((brandIds as string[]) || [])
  const {
    data: brandsData,
    isLoading: brandsLoading,
    error
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getBrands(),
    staleTime: 2 * 60 * 1000 // 5 phút, tùy bạn
  })

  const brands = brandsData?.data.data ?? []

  useEffect(() => {
    if (error) toast.error('Không thể tải danh sách thương hiệu')
  }, [error])
  // console.log(queryConfig)
  // console.log(categoryParentId)
  // console.log(brands)
  // console.log(queryConfig)
  const marks: SliderSingleProps['marks'] = {
    0: '0',
    3000000: {
      style: { color: '#f50' },
      label: <strong>3,000,000</strong>
    },
    10000000: {
      style: { color: '#f50' },
      label: <strong className='pr-16'>10,000,000</strong>
    }
  }
  const onChangeMinPrice: InputNumberProps['onChange'] = (value) => {
    setMinPrice(value as number)
  }

  const onChangeMaxPrice: InputNumberProps['onChange'] = (value) => {
    setMaxPrice(value as number)
  }

  const handleChangeSelectBrand = (value: string[]) => {
    setSelectedBrands([...value])
  }
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Kiểm tra nếu maxPrice > 0 và minPrice >= maxPrice
    if ((maxPrice > 0 && minPrice >= maxPrice) || (minPrice > 0 && maxPrice <= minPrice)) {
      message.error('Giá tối thiểu không được lớn hơn hoặc bằng giá tối đa')
      return
    }

    // Khởi tạo query object từ queryConfig
    let query = {
      ...queryConfig,
      brandIds: selectedBrands as string[]
    }

    // Nếu maxPrice === 0, loại bỏ minPrice và maxPrice khỏi query
    if (maxPrice > 0) {
      query = {
        ...query,
        minPrice: String(minPrice),
        maxPrice: String(maxPrice)
      }
    }

    navigate({
      pathname: `${categoryParentId ? `/categories/${categoryParentId}` : '/search'}`,
      search: createSearchParams(query).toString()
    })
  }
  const handleClearAll = () => {
    setMinPrice(0)
    setMaxPrice(0)
    setSelectedBrands([])
    navigate({
      pathname: `${categoryParentId ? `/categories/${categoryParentId}` : '/search'}`,
      search: createSearchParams(omit(queryConfig, ['minPrice', 'maxPrice', 'brandIds', 'categories'])).toString()
    })
  }
  return (
    <div className='py-4'>
      {categoryParentId && (
        <>
          <ul>
            <Link to='/all-categories' className='flex items-center gap-3 font-bold'>
              <UnorderedListOutlined />
              Tất Cả Danh Mục
            </Link>
            <div className='my-4 h-[1px] bg-gray-300'></div>
            <li className='py-2 pl-2'>
              <Link
                to={{
                  pathname: `/categories/${categoryParentId}`,
                  search: createSearchParams({
                    ...queryConfig,
                    categories: ''
                  }).toString()
                }}
                className={`relative px-2 ${
                  categoryParentId && categories === categoryParentId ? 'font-semibold text-orange' : ''
                }`}
              >
                {categoryParentId && categories === categoryParentId && (
                  <div className='absolute top-0 left-[-10px]'>
                    <CaretRightOutlined style={{ color: '#ee4d2d', fontSize: '12px' }} />
                  </div>
                )}
                {parentCategoryData?.categoryTranslations[0]?.name || 'Category name null'}
              </Link>
            </li>
            {categoryData.map((category) => {
              const isActive = Number(categories) === category.id
              return (
                <li key={category.id} className={` py-2 pl-2 `}>
                  <Link
                    to={{
                      pathname: `/categories/${categoryParentId}`,
                      search: createSearchParams({
                        ...queryConfig,
                        categories: String(category.id)
                      }).toString()
                    }}
                    className={`relative px-2 ${isActive ? 'font-semibold text-orange' : ''}`}
                  >
                    {isActive && (
                      <div className='absolute top-0 left-[-10px]'>
                        <CaretRightOutlined style={{ color: '#ee4d2d', fontSize: '12px' }} />
                      </div>
                    )}
                    {category.categoryTranslations[0]?.name || 'Category name null'}
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
      {/* Khoảng giá */}
      <Link to='/all-categories' className='mt-4 flex items-center gap-3 font-bold uppercase'>
        <FilterOutlined />
        Bộ lọc tìm kiếm
      </Link>
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <div className='my-5'>Thương hiệu</div>
      <Select
        allowClear
        mode='multiple'
        style={{ width: '100%' }}
        placeholder='Nhập thương hiệu để tìm kiếm'
        optionFilterProp='label'
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
        }
        options={brands.map((brand) => ({
          value: String(brand.id),
          label: brand.name
        }))}
        value={selectedBrands}
        onChange={handleChangeSelectBrand}
      />
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <div className='my-5'>
        <div>Khoảng giá</div>
        <form onSubmit={handleSubmit} className='mt-2'>
          <div className='my-2 flex items-center gap-3'>
            <InputNumber<number>
              value={minPrice}
              formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/[^\d]/g, '') || 0)}
              onChange={onChangeMinPrice}
              step={100000}
              className='grow'
              min={0}
              max={100000000}
            />
            <Space className='shrink-0'>-</Space>
            <InputNumber<number>
              value={maxPrice}
              formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/[^\d]/g, '') || 0)}
              onChange={onChangeMaxPrice}
              step={100000}
              className='grow'
              min={0}
              max={100000000}
            />
          </div>
          {/* <div>
            <Slider marks={marks} range min={0} max={10000000} step={100000} defaultValue={[0, 3000000]} />
          </div> */}
          <button className='w-full bg-orange py-2 px-2 text-sm font-medium uppercase text-white'>Áp dụng</button>
        </form>
      </div>
      <div className='my-4 h-[1px] bg-gray-300'></div>
      {/* Đánh giá */}
      <div>Đánh giá</div>
      <div className='my-3 flex items-center gap-3'>
        <Rate allowHalf defaultValue={5} />
        Trở lên
      </div>
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <button onClick={handleClearAll} className='w-full bg-orange py-2 px-2 text-sm font-medium uppercase text-white'>
        Xoá tất cả
      </button>
    </div>
  )
}
