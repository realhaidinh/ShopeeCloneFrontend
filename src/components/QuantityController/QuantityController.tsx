import { InputNumber, message } from 'antd'
import type { InputNumberProps } from 'antd'

interface Props {
  max?: number
  value?: number
  setBuyCount: React.Dispatch<React.SetStateAction<number>>
}

export default function QuantityController({ max = 100, value, setBuyCount }: Props) {
  const handleValueChange = (value: number | null) => {
    if (value === null || value < 1) {
      setBuyCount(1)
      return
    }
    if (max !== undefined && value > max) {
      message.error(`Số lượng không được vượt quá tồn kho`)
      setBuyCount(max)
      return
    }
    setBuyCount(value)
  }

  const handleInputChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputElement = e.target as HTMLInputElement
    const value = inputElement.value
    // Nếu rỗng, reset về 1
    if (value === '') {
      message.error(`Số lượng không phù hợp`)
      handleValueChange(1)
      return
    }
    const numValue = Number(value)
    if (!isNaN(numValue)) {
      handleValueChange(numValue)
    }
  }

  return (
    <div>
      <InputNumber
        min={1}
        max={max}
        value={value}
        size='large'
        onBlur={handleInputChange} // Gọi khi mất focus
        onStep={handleValueChange} // Gọi khi nhấn nút tăng/giảm
      />
    </div>
  )
}
