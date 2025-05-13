import type { PaginationProps } from 'antd'
import { Pagination as PaginationAntd } from 'antd'

interface Props {
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  totalPage: number
  setTotalPage: React.Dispatch<React.SetStateAction<number>>
  pageSize: number
  setPageSize: React.Dispatch<React.SetStateAction<number>>
}

export default function Pagination({ page, setPage, pageSize, setPageSize, totalPage, setTotalPage }: Props) {
  const onChange: PaginationProps['onChange'] = (pageNumber) => {
    console.log('Page: ', pageNumber)
    setPage(pageNumber)
  }
  const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
    console.log(current, pageSize)
    setPageSize(pageSize)
  }
  return (
    <div className='mt-6'>
      <PaginationAntd
        align='center'
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        showQuickJumper
        defaultCurrent={page}
        total={100}
        onChange={onChange}
        style={{ textAlign: 'center' }}
        onShowSizeChange={onShowSizeChange}
      />
    </div>
  )
}
