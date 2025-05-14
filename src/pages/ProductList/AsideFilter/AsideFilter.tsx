import { createSearchParams, Link, useParams } from 'react-router-dom'
import { UnorderedListOutlined, CaretRightOutlined, FilterOutlined } from '@ant-design/icons'
import type { InputNumberProps, SliderSingleProps } from 'antd'
import { InputNumber, Slider, Space, Rate, Select } from 'antd'
import { QueryConfig } from 'src/pages/ProductList/ProductList'
import { Category } from 'src/types/category.type'

interface Props {
  queryConfig: QueryConfig
  categoryData: Category[]
  parentCategoryData?: Category
}

export default function AsideFilter({ queryConfig, categoryData, parentCategoryData }: Props) {
  const { categories } = queryConfig
  const { categoryParentId } = useParams<{ categoryParentId: string }>()
  console.log(queryConfig)
  console.log(categoryParentId)
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
  const onChange: InputNumberProps['onChange'] = (value) => {
    console.log('changed', value)
  }
  return (
    <div className='py-4'>
      <Link to='/all-categories' className='flex items-center gap-3 font-bold'>
        <UnorderedListOutlined />
        Tất Cả Danh Mục
      </Link>
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <ul>
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
        options={[
          {
            value: 'apple',
            label: 'Apple'
          },
          {
            value: 'samsung',
            label: 'Samsung'
          },
          {
            value: 'xiaomi',
            label: 'Xiaomi'
          },
          {
            value: 'oppo',
            label: 'Oppo'
          },
          {
            value: 'vivo',
            label: 'Vivo'
          }
        ]}
      />
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <div className='my-5'>
        <div>Khoảng giá</div>
        <form action='' className='mt-2'>
          <div className='flex items-center gap-3'>
            <InputNumber<number>
              defaultValue={0}
              formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/[^\d]/g, '') || 0)}
              onChange={onChange}
              step={100000}
              className='grow'
              min={0}
              max={10000000}
            />
            <Space className='shrink-0'>-</Space>
            <InputNumber<number>
              defaultValue={3000000}
              formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/[^\d]/g, '') || 0)}
              onChange={onChange}
              step={100000}
              className='grow'
              min={0}
              max={10000000}
            />
          </div>
          <div>
            <Slider marks={marks} range min={0} max={10000000} step={100000} defaultValue={[0, 3000000]} />
          </div>
          <button type='submit' className='w-full bg-orange py-2 px-2 text-sm font-medium uppercase text-white'>
            Áp dụng
          </button>
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
      <button className='w-full bg-orange py-2 px-2 text-sm font-medium uppercase text-white'>Xoá tất cả</button>
    </div>
  )
}
