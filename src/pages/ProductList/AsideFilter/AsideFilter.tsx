import { Link } from 'react-router-dom'
import { UnorderedListOutlined, CaretRightOutlined, FilterOutlined } from '@ant-design/icons'
import type { InputNumberProps, SliderSingleProps } from 'antd'
import { InputNumber, Slider, Space, Rate, Select } from 'antd'

export default function AsideFilter() {
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
      <div className='bg-gray-300 h-[1px] my-4'></div>
      <ul>
        <li className='py-2 pl-2'>
          <Link to='/' className='px-2 text-orange font-semibold relative'>
            <div className='absolute top-0 left-[-10px]'>
              <CaretRightOutlined style={{ color: '#ee4d2d', fontSize: '12px' }} />
            </div>
            Thời Trang Nam
          </Link>
        </li>
        <li className='py-2 pl-2'>
          <Link to='/' className='px-2'>
            Điện thoại
          </Link>
        </li>
      </ul>
      {/* Khoảng giá */}
      <Link to='/all-categories' className='flex items-center gap-3 font-bold mt-4 uppercase'>
        <FilterOutlined />
        Bộ lọc tìm kiếm
      </Link>
      <div className='bg-gray-300 h-[1px] my-4'></div>
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
      <div className='bg-gray-300 h-[1px] my-4'></div>
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
          <button type='submit' className='w-full uppercase bg-orange text-white font-medium text-sm py-2 px-2'>
            Áp dụng
          </button>
        </form>
      </div>
      <div className='bg-gray-300 h-[1px] my-4'></div>
      {/* Đánh giá */}
      <div>Đánh giá</div>
      <div className='my-3 flex items-center gap-3'>
        <Rate allowHalf defaultValue={5} />
        Trở lên
      </div>
      <div className='bg-gray-300 h-[1px] my-4'></div>
      <button className='w-full uppercase bg-orange text-white text-sm py-2 px-2 font-medium'>Xoá tất cả</button>
    </div>
  )
}
