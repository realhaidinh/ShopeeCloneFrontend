import { Avatar, Card, Rate } from 'antd'
import { Link } from 'react-router-dom'
import { Product as ProductType } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle } from 'src/utils/utils'
interface Props {
  product: ProductType
}
export default function Product({ product }: Props) {
  return (
    <Link to={`/products/${product.id}`}>
      <div className='h-full w-full overflow-hidden rounded-sm border-orange/70 bg-white shadow transition-transform duration-100 hover:translate-y-[-0.1rem] hover:border-[2px] hover:shadow-md'>
        <div className='relative w-full pt-[100%]'>
          <img
            src={product.images[0]}
            alt={product.name}
            className='absolute top-0 left-0 h-full w-full bg-white object-cover'
          />
        </div>
        <div className='overflow-hidden p-2'>
          <div className='min-h-[2rem] text-sm line-clamp-2'>{product.productTranslations[0]?.name || ''}</div>
          <div className='mt-3 flex items-center justify-end font-medium'>
            <div className='max-w-[50%] truncate text-xs text-gray-500 line-through'>
              <span className='text-xs'>₫</span>
              <span>{formatCurrency(product.virtualPrice)}</span>
            </div>
            <div className='ml-1 truncate text-orange'>
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
