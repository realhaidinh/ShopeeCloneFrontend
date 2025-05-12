import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Spin } from 'antd'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { login } from 'src/apis/auth.api'
import Input from 'src/components/Input'
import { AppContext } from 'src/contexts/app.context'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { schema, Schema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { LoadingOutlined } from '@ant-design/icons'

type FormData = Pick<Schema, 'email' | 'password'>

export default function Login() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema.pick(['email', 'password']))
  })

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => login(body)
  })
  const onSubmit = handleSubmit((data) => {
    const body = data
    loginMutation.mutate(body, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        navigate('/')
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
              <div className='text-2xl'>Đăng nhập</div>
              <Input
                name='email'
                register={register}
                type='email'
                className='mt-8'
                errorMessage={errors.email?.message}
                placeholder='Email'
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
              <div className='mt-2'>
                <button
                  type='submit'
                  className='flex items-center justify-center w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={loginMutation.isLoading}
                >
                  {loginMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                  <span className='ml-2'> Đăng nhập</span>
                </button>
              </div>
              <div className='flex items-center justify-center mt-8 gap-1'>
                <div className='text-gray-300'>Bạn chưa có tài khoản?</div>
                <Link to='/register' className=' text-red-400'>
                  Đăng ký tài khoản mới
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
