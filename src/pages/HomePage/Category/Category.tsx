import { useQuery } from '@tanstack/react-query'
import categoryApi from 'src/apis/category.api' // bạn cần tự định nghĩa API này
import { Spin } from 'antd'
import { Link } from 'react-router-dom'
import { Category as CategoryType } from 'src/types/category.type'

export default function Category() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 2 * 60 * 1000
  })

  const categories = data?.data.data || []

  return (
    <div className='container'>
      <div className='my-6 text-lg font-semibold uppercase text-gray-700'>Danh mục</div>

      {isLoading ? (
        <div className='flex h-32 items-center justify-center'>
          <Spin size='large' />
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {categories.map((category: CategoryType) => (
            <Link to={`/categories/${category.id}`} key={category.id}>
              <div className='group flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-4 shadow transition hover:border-orange hover:shadow-md'>
                <img
                  src={category.logo}
                  alt={category.name}
                  className='mb-2 h-16 w-16 object-contain transition-transform group-hover:scale-105'
                />
                <div className='text-center text-sm font-medium text-gray-700 group-hover:text-orange'>
                  {category.categoryTranslations[0]?.name || ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
