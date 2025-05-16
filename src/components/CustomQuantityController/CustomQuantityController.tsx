import { useState, useEffect, useRef } from 'react'
import { message } from 'antd'

interface Props {
  max?: number
  value?: number
  classNameWrapper?: string
  onType?: (value: number) => void
  disabled?: boolean
  setBuyCount?: React.Dispatch<React.SetStateAction<number>>
  productName?: string
}

export default function CustomQuantityController({
  max,
  value = 1,
  classNameWrapper = '',
  onType,
  disabled = false,
  setBuyCount,
  productName = 'Sản phẩm'
}: Props) {
  const [inputValue, setInputValue] = useState<string>(value.toString())
  const [isTyping, setIsTyping] = useState(false)
  const previousValue = useRef<number>(value)

  // Update input value when prop value changes
  useEffect(() => {
    if (!isTyping) {
      setInputValue(value.toString())
    }
  }, [value, isTyping])

  const validateAndUpdate = (newValue: number): boolean => {
    console.log('Validating value:', newValue)

    // Validate min value
    if (newValue < 1) {
      setInputValue('1')
      return false
    }

    // Validate max value
    if (max !== undefined && newValue > max) {
      message.error(`${productName}: Số lượng không thể vượt quá ${max}`)
      setInputValue(max.toString())
      return false
    }

    // If we get here, the value is valid
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value
    console.log('Input changed to:', newInputValue)

    // Allow empty input or numbers only
    if (newInputValue === '' || /^\d+$/.test(newInputValue)) {
      setInputValue(newInputValue)
      setBuyCount?.(newInputValue === '' ? 1 : parseInt(newInputValue, 10))
    }
  }

  const handleFocus = () => {
    console.log('Input focused')
    setIsTyping(true)
    previousValue.current = parseInt(inputValue || '1', 10)
  }

  const handleBlur = () => {
    console.log('Input blurred with value:', inputValue)
    setIsTyping(false)

    // Handle empty input
    if (inputValue === '') {
      setInputValue('1')
      onType?.(1)
      return
    }

    // Parse the input value
    const numValue = parseInt(inputValue, 10)
    console.log('Parsed to number:', numValue)

    // Validate
    const isValid = validateAndUpdate(numValue)

    // Only call API if value is valid and has changed
    if (isValid && previousValue.current !== numValue) {
      console.log('Calling API with value:', numValue)
      onType?.(numValue)
    } else if (!isValid) {
      // If invalid, reset to a valid value (either max or 1)
      if (max !== undefined && numValue > max) {
        console.log('Value invalid, calling API with max:', max)
        onType?.(max)
      } else if (numValue < 1) {
        console.log('Value invalid, calling API with 1')
        onType?.(1)
      }
    }
  }

  const handleIncrement = () => {
    const currentValue = parseInt(inputValue || '1', 10)
    const newValue = currentValue + 1

    if (max !== undefined && newValue > max) {
      message.error(`${productName}: Số lượng không thể vượt quá ${max}`)
      return
    }

    setInputValue(newValue.toString())
    onType?.(newValue)
  }

  const handleDecrement = () => {
    const currentValue = parseInt(inputValue || '1', 10)
    const newValue = Math.max(1, currentValue - 1)

    setInputValue(newValue.toString())
    onType?.(newValue)
  }

  return (
    <div className={`flex items-center ${classNameWrapper}`}>
      <div className='flex rounded border border-gray-300'>
        <button
          type='button'
          className='border-r border-gray-300 bg-gray-50 px-2 py-1'
          onClick={handleDecrement}
          disabled={disabled || parseInt(inputValue || '1', 10) <= 1}
        >
          -
        </button>
        <input
          type='text'
          className='w-12 text-center text-black focus:outline-none'
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
        />
        <button
          type='button'
          className='border-l border-gray-300 bg-gray-50 px-2 py-1'
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && parseInt(inputValue || '1', 10) >= max)}
        >
          +
        </button>
      </div>
    </div>
  )
}
