import { useState, useEffect, useRef } from 'react'
import { InputNumber, message } from 'antd'

interface Props {
  max?: number
  value?: number
  classNameWrapper?: string
  onType?: (value: number) => void
  disabled?: boolean
  setBuyCount?: React.Dispatch<React.SetStateAction<number>>
  productName?: string // Added to show more descriptive error messages
}

export default function QuantityController({
  max,
  value = 1,
  classNameWrapper = '',
  onType,
  disabled = false,
  setBuyCount,
  productName = 'Sản phẩm'
}: Props) {
  const [localValue, setLocalValue] = useState<number>(value)
  const [isTyping, setIsTyping] = useState(false)
  const previousValue = useRef<number>(value)
  const inputRef = useRef<any>(null)

  // Update local value when prop value changes
  useEffect(() => {
    if (!isTyping) {
      setLocalValue(value)
    }
  }, [value, isTyping])

  const validateAndUpdate = (newValue: number): boolean => {
    // Validate min value
    if (newValue < 1) {
      setLocalValue(1)
      return false
    }

    // Validate max value
    if (max !== undefined && newValue > max) {
      message.error(`${productName}: Số lượng không thể vượt quá ${max}`)
      setLocalValue(max)
      return false
    }

    // If we get here, the value is valid
    setLocalValue(newValue)
    return true
  }

  const handleChange = (newValue: number | null) => {
    if (newValue === null) {
      return
    }

    // Just update the local value during typing, don't validate yet
    if (isTyping) {
      setLocalValue(newValue)
      return
    }

    // For changes from controls, validate and call API if valid
    const isValid = validateAndUpdate(newValue)
    if (isValid && newValue !== value) {
      onType?.(newValue)
    }
  }

  const handleFocus = () => {
    setIsTyping(true)
    previousValue.current = localValue
  }

  const handleBlur = () => {
    // Validate on blur
    const isValid = validateAndUpdate(localValue)
    setIsTyping(false)

    // Only call API if value is valid and has changed
    if (isValid && previousValue.current !== localValue) {
      onType?.(localValue)
    } else if (!isValid) {
      // If invalid, reset to a valid value (either max or 1)
      if (max !== undefined && localValue > max) {
        onType?.(max)
      } else if (localValue < 1) {
        onType?.(1)
      }
    }
  }

  // This handles the step buttons (up/down arrows)
  const handleStep = (value: number) => {
    const isValid = validateAndUpdate(value)
    if (isValid && value !== previousValue.current) {
      onType?.(value)
    }
  }

  return (
    <div className={`flex items-center ${classNameWrapper}`}>
      <InputNumber
        className='w-24'
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onStep={handleStep}
        min={1}
        max={max}
        disabled={disabled}
        controls
        size='middle'
        ref={inputRef}
      />
    </div>
  )
}
