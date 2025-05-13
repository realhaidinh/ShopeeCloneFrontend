import { Avatar, Card, Rate } from 'antd'
import { Link } from 'react-router-dom'
import { Product as ProductType } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle } from 'src/utils/utils'
interface Props {
  product: ProductType
}
export default function Product({ product }: Props) {
  return (
    <Link to='/'>
      <div className='bg-white w-full h-full shadow rounded-sm hover:translate-y-[-0.1rem] hover:shadow-md duration-100 transition-transform overflow-hidden hover:border-[2px] border-orange/70'>
        <div className='w-full pt-[100%] relative'>
          <img
            src={product.images[0]}
            alt={product.name}
            className='absolute top-0 left-0 bg-white w-full h-full object-cover'
          />
        </div>
        <div className='p-2 overflow-hidden'>
          <div className='min-h-[2rem] line-clamp-2 text-sm'>{product.productTranslations[0].name}</div>
          <div className='flex items-center mt-3 justify-end font-medium'>
            <div className='line-through max-w-[50%] text-gray-500 truncate text-xs'>
              <span className='text-xs'>₫</span>
              <span>{formatCurrency(product.virtualPrice)}</span>
            </div>
            <div className='text-orange truncate ml-1'>
              <span className='text-xs'>₫</span>
              <span>{formatCurrency(product.basePrice)}</span>
            </div>
          </div>
          <div className='mt-3 flex flex-wrap-reverse items-center justify-end'>
            <Rate style={{ fontSize: '0.75rem' }} allowHalf disabled defaultValue={4.5} />
            <div className='ml-2 text-sm'>
              <span>
                {formatNumberToSocialStyle(
                  product.productSKUSnapshots?.reduce((prev, next) => prev + next.quantity, 0) || 0
                )}
              </span>
              <span className='ml-1'>Đã bán</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
