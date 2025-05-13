import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Input from 'src/components/Input'
import { Schema, schema } from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import authApi from 'src/apis/auth.api'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { Button, message, Steps, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useState } from 'react'
import EmailOtp from 'src/components/Others'

type FormData = Schema
export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [current, setCurrent] = useState(0)

  const onChange = (value: number) => {
    if (value === 1 && !email) {
      message.warning('Vui lòng nhập email!')
      return
    }
    setCurrent(value)
  }
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const registerAccountMutation = useMutation({
    mutationFn: (body: FormData) => authApi.registerAccount(body)
  })

  const onSubmit = handleSubmit((data) => {
    const body = data
    registerAccountMutation.mutate(body, {
      onSuccess: (data) => {
        message.success(data.data.message)
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
      <div className='container max-w-[100rem]'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='p-10 rounded bg-white shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl mb-5'>Đăng ký</div>
              <Steps
                type='navigation'
                current={current}
                onChange={onChange}
                className='site-navigation-steps'
                items={[
                  {
                    title: 'Xác nhận email'
                  },
                  {
                    title: 'Nhập OTP và Đăng ký'
                  }
                ]}
              />
              {current === 0 && (
                <>
                  <EmailOtp email={email} setEmail={setEmail} setCurrent={setCurrent} setValue={setValue} />
                </>
              )}
              {current === 1 && (
                <>
                  <Input
                    name='email'
                    register={register}
                    type='email'
                    className='mt-8'
                    errorMessage={errors.email?.message}
                    placeholder='Email'
                    value={email}
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
                </>
              )}

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
