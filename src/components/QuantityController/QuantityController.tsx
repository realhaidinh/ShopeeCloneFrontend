import { useState, useEffect, useRef } from 'react'
import { InputNumber } from 'antd'

interface Props {
  max?: number
  value?: number
  classNameWrapper?: string
  onType?: (value: number) => void
  disabled?: boolean
  setBuyCount?: React.Dispatch<React.SetStateAction<number>>
}

export default function QuantityController({
  max,
  value = 1,
  classNameWrapper = '',
  onType,
  disabled = false,
  setBuyCount
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

  const handleChange = (newValue: number | null) => {
    if (newValue === null) {
      return
    }

    let validValue = newValue
    if (validValue < 1) {
      validValue = 1
    } else if (max !== undefined && validValue > max) {
      validValue = max
    }

    setLocalValue(validValue)
    setBuyCount?.(validValue)

    // If the change came from the controls (up/down buttons), call API immediately
    // We can detect this by checking if the input is not focused
    if (!isTyping && document.activeElement !== inputRef.current) {
      onType?.(validValue)
    }
  }

  const handleFocus = () => {
    setIsTyping(true)
    previousValue.current = localValue
  }

  const handleBlur = () => {
    setIsTyping(false)
    // Only call API if value has changed
    if (previousValue.current !== localValue) {
      onType?.(localValue)
    }
  }

  // This handles the step buttons (up/down arrows)
  const handleStep = (value: number) => {
    setLocalValue(value)
    onType?.(value)
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
