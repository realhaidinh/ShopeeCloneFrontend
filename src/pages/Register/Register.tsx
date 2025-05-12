import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Input from 'src/components/Input'
import { Schema, schema } from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { registerAccount } from 'src/apis/auth.api'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'

type FormData = Schema

export default function Register() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const registerAccountMutation = useMutation({
    mutationFn: (body: FormData) => registerAccount(body)
  })

  const onSubmit = handleSubmit((data) => {
    const body = data
    registerAccountMutation.mutate(body, {
      onSuccess: (data) => {
        navigate('/login')
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError<ResponseUnprocessableEntityApi<FormData>>(error)) {
          const formError = error.response?.data.message
          if (formError) {
            formError.forEach((err) => {
              setError(err.path, {
                message: err.message,
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })
  return (
    <div className='bg-orange'>
      <div className='container'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='p-10 rounded bg-white shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng ký</div>
              <Input
                name='email'
                register={register}
                type='email'
                className='mt-8'
                errorMessage={errors.email?.message}
                placeholder='Email'
              />
              <Input
                name='name'
                register={register}
                type='text'
                className='mt-2'
                errorMessage={errors.name?.message}
                placeholder='Name'
              />
              <Input
                name='phoneNumber'
                register={register}
                type='text'
                className='mt-2'
                errorMessage={errors.phoneNumber?.message}
                placeholder='Phone number'
              />
              <Input
                name='password'
                register={register}
                type='password'
                className='mt-2'
                errorMessage={errors.password?.message}
                placeholder='Password'
                autoComplete='on'
              />
              <Input
                name='confirmPassword'
                register={register}
                type='password'
                className='mt-2'
                errorMessage={errors.confirmPassword?.message}
                placeholder='Confirm password'
                autoComplete='on'
              />
              <Input
                name='code'
                register={register}
                type='text'
                className='mt-2'
                errorMessage={errors.code?.message}
                placeholder='Code'
              />
              <div className='mt-2'>
                <button
                  type='submit'
                  className='flex items-center justify-center w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={registerAccountMutation.isLoading}
                >
                  {registerAccountMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                  <span className='ml-2'>Đăng ký</span>
                </button>
              </div>
              <div className='flex items-center justify-center mt-8 gap-1'>
                <div className='text-gray-300'>Bạn đã có tài khoản?</div>
                <Link to='/login' className=' text-red-400'>
                  Đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
