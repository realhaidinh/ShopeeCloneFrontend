import type { RegisterOptions, UseFormRegister } from 'react-hook-form'

interface Props {
  type: React.HTMLInputTypeAttribute
  errorMessage?: string
  placeholder?: string
  className?: string
  name: string
  register: UseFormRegister<any>
  rules?: RegisterOptions
  autoComplete?: string
  value?: string
}

export default function Input({
  type,
  errorMessage,
  placeholder,
  className,
  name,
  register,
  rules,
  autoComplete,
  value
}: Props) {
  return (
    <div className={className}>
      <input
        type={type}
        // name='email' - register đã có sẵn name=email rồi
        className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed'
        placeholder={placeholder}
        {...register(name, rules)}
        autoComplete={autoComplete}
        defaultValue={value}
        disabled={!!value}
      />
      <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{errorMessage}</div>
    </div>
  )
}
