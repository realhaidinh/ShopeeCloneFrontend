import { Avatar, Card, Rate } from 'antd'
import { Link } from 'react-router-dom'
export default function Product() {
  return (
    <Link to='/'>
      <div className='bg-white w-full h-full shadow rounded-sm hover:translate-y-[-0.04rem] hover:shadow-md duration-100 transition-transform overflow-hidden'>
        <div className='w-full pt-[100%] relative'>
          <img
            src='https://cf.shopee.vn/file/ea0f159f3f4c713abcf56b5ba73840b9_tn'
            alt=''
            className='absolute top-0 left-0 bg-white w-full h-full object-cover'
          />
        </div>
        <div className='p-2 overflow-hidden'>
          <div className='min-h-[2rem] line-clamp-2 text-xs'>
            [HÀNG HIỆU] Thắt Lưng Da Nam Khóa Tự Động Cao Cấp Dây Nịt Nam Mặt Xoay Chính Hãng , Phong Cách Hàn Quốc -
            v77men
          </div>
          <div className='flex items-center mt-3 justify-end font-medium'>
            <div className='line-through max-w-[50%] text-gray-500 truncate text-xs'>
              <span className='text-xs'>₫</span>
              <span>5.000</span>
            </div>
            <div className='text-orange truncate ml-1'>
              <span className='text-xs'>₫</span>
              <span>2.000</span>
            </div>
          </div>
          <div className='mt-3 flex flex-wrap-reverse items-center justify-end'>
            <Rate style={{ fontSize: '0.75rem' }} allowHalf disabled defaultValue={4.5} />
            <div className='ml-2 text-sm'>
              <span>5.66k</span>
              <span className='ml-1'>Đã bán</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
