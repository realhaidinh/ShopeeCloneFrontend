import { Select, Pagination } from 'antd'
import './index.css'
export default function SortProductList() {
  return (
    <div className='bg-gray-300/40 py-4 px-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center flex-wrap gap-2'>
          <div>Sắp xếp theo</div>
          <button className='h-8 px-4 capitalize bg-orange text-white text-sm hover:bg-orange/80 text-center'>
            Mới nhất
          </button>
          <button className='h-8 px-4 capitalize bg-white text-black text-sm hover:bg-slate-100 text-center'>
            Bán chạy
          </button>
          <Select
            placeholder='Giá'
            defaultValue={'price:asc'}
            className='custom-select'
            // onChange={onChange}
            // onSearch={onSearch}
            style={{ width: 200, height: '2.25rem' }}
            options={[
              {
                value: 'price:asc',
                label: 'Giá: Thấp đến Cao'
              },
              {
                value: 'price:desc',
                label: 'Giá: Cao đến Thấp'
              }
            ]}
          />
        </div>
        <div>
          <Pagination size='small' simple defaultCurrent={1} pageSize={5} total={50} />
        </div>
      </div>
    </div>
  )
}
