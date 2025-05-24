import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Divider, Spin } from 'antd'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import authApi from 'src/apis/auth.api'
import Input from 'src/components/Input'
import { AppContext } from 'src/contexts/app.context'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { schema, Schema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { LoadingOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import http from 'src/utils/http'

type FormData = Pick<Schema, 'email' | 'password'>

export default function Login() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const handleGoogleLogin = async (e: any) => {
    e.preventDefault()
    const response = await http.get(`/auth/google-link`)
    console.log(response.data.url)
    window.location.href = response.data.url
  }
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
    mutationFn: (body: FormData) => authApi.login(body)
  })
  const onSubmit = handleSubmit((data) => {
    const body = data
    loginMutation.mutate(body, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        if (data.data.data.user.roleId === 2) {
          navigate('/')
        } else {
          navigate('/manage/profile')
        }
        toast.success(data.data.message)
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
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
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
                  className='flex w-full items-center justify-center bg-red-500 py-4 px-2 text-center text-sm uppercase text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={loginMutation.isLoading}
                >
                  {loginMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                  <span className='ml-2'> Đăng nhập</span>
                </button>
              </div>
              <div className='mt-5 flex justify-start'>
                <Link to='/forgot-password' className=' text-red-400'>
                  Quên mật khẩu?
                </Link>
              </div>
              <Divider />
              <div className='mt-8 flex flex-col items-center justify-center gap-1'>
                <div className='mb-5 flex items-center gap-4'>
                  <div className='text-gray-300'>Bạn chưa có tài khoản?</div>
                  <Link to='/register' className=' text-red-400'>
                    Đăng ký tài khoản mới
                  </Link>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: '10px 20px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                    alt='Google icon'
                    style={{ width: '20px', height: '20px' }}
                  />
                  Đăng nhập với Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
