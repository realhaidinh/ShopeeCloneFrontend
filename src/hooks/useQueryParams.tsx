import { useSearchParams } from 'react-router-dom'

export default function useQueryParams() {
  const [searchParams] = useSearchParams()
  const params: { [key: string]: string | string[] } = {}

  // Lặp qua tất cả các key trong searchParams
  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key)
    // Nếu key có nhiều giá trị, lưu dưới dạng mảng; nếu không, lưu dưới dạng chuỗi
    params[key] = values.length > 1 ? values : values[0]
  }

  return params
}
