import type { RegisterOptions, UseFormGetValues } from 'react-hook-form'
import * as yup from 'yup'

type Rules = {
  [key in 'email' | 'password' | 'confirmPassword']?: RegisterOptions
}

export const getRules = (getValues?: UseFormGetValues<any>): Rules => ({
  email: {
    required: {
      value: true,
      message: 'Email là bắt buộc'
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Email không đúng định dạng'
    }
  },
  password: {
    required: {
      value: true,
      message: 'Mật khẩu là bắt buộc'
    },
    maxLength: {
      value: 100,
      message: 'Mật khẩu phải có độ dài từ 6 - 100 ký tự'
    },
    minLength: {
      value: 6,
      message: 'Mật khẩu phải có độ dài từ 6 - 100 ký tự'
    }
  },
  confirmPassword: {
    required: {
      value: true,
      message: 'Nhập lại mật khẩu là bắt buộc'
    },
    maxLength: {
      value: 100,
      message: 'Nhập lại mật khẩu phải có độ dài từ 6 - 100 ký tự'
    },
    minLength: {
      value: 6,
      message: 'Nhập lại mật khẩu phải có độ dài từ 6 - 100 ký tự'
    },
    validate:
      typeof getValues === 'function' ? (value) => value === getValues('password') || 'Mật khẩu không khớp' : undefined
  }
})

export const emailSchema = yup
  .object({
    email: yup.string().required('Email là bắt buộc').email('Email không đúng định dạng')
  })
  .required()

export type emailType = yup.InferType<typeof emailSchema>

export const schema = yup
  .object({
    email: yup.string().required('Email là bắt buộc').email('Email không đúng định dạng'),
    password: yup
      .string()
      .required('Mật khẩu là bắt buộc')
      .min(6, 'Nhập lại mật khẩu phải có độ dài từ 6 - 100 ký tự')
      .max(100, 'Nhập lại mật khẩu phải có độ dài từ 6 - 100 ký tự'),
    name: yup
      .string()
      .required('Họ và tên là bắt buộc')
      .min(1, 'Họ và tên phải có độ dài từ 1 - 100 ký tự')
      .max(100, 'Họ và tên phải có độ dài từ 1 - 100 ký tự'),
    phoneNumber: yup
      .string()
      .required('Số điện thoại là bắt buộc')
      .min(9, 'Số điện thoại phải có độ dài từ 9 - 15 ký tự')
      .max(15, 'Số điện thoại phải có độ dài từ 9 - 15 ký tự'),
    confirmPassword: yup
      .string()
      .required('Nhập lại mật khẩu là bắt buộc')
      .min(6, 'Nhập lại mật khẩu phải có độ dài từ 6 - 100 ký tự')
      .max(100, 'Nhập lại mật khẩu phải có độ dài từ 6 - 100 ký tự')
      .oneOf([yup.ref('password')], 'Nhập lại mật khẩu không khớp'),
    code: yup.string().required('Mã xác nhận là bắt buộc').length(6, 'Mã xác nhận phải có độ dài 6 ký tự')
  })
  .required()

export type Schema = yup.InferType<typeof schema>
