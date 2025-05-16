import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import RegisterLayout from './layouts/RegisterLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import MainLayout from 'src/layouts/MainLayout'
import ProductList from 'src/pages/ProductList'
import Profile from 'src/pages/Profile'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import HomePage from 'src/pages/HomePage'
import ProductDetail from 'src/pages/ProductDetail'
import Cart from 'src/pages/Cart'
import CartLayout from 'src/layouts/CartLayout'
import Checkout from 'src/pages/Checkout'
import CheckoutLayout from 'src/layouts/CheckoutLayout/CheckoutLayout'
import OrderLayout from 'src/layouts/OrderLayout'
import Order from 'src/pages/Order'
import OrderDetail from 'src/pages/OrderDetail'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: '/',
      index: true,
      element: (
        <MainLayout>
          <HomePage />
        </MainLayout>
      )
    },
    {
      path: '/products/:nameId',
      index: true,
      element: (
        <MainLayout>
          <ProductDetail />
        </MainLayout>
      )
    },
    {
      path: '/categories/:categoryParentId',
      index: true,
      element: (
        <MainLayout>
          <ProductList />
        </MainLayout>
      )
    },
    {
      path: '/search',
      index: true,
      element: (
        <MainLayout>
          <ProductList />
        </MainLayout>
      )
    },
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/profile',
          element: (
            <MainLayout>
              <Profile />
            </MainLayout>
          )
        },
        {
          path: '/cart',
          element: (
            <CartLayout>
              <Cart />
            </CartLayout>
          )
        },
        {
          path: '/checkout',
          element: (
            <CheckoutLayout>
              <Checkout />
            </CheckoutLayout>
          )
        },
        {
          path: '/orders',
          element: (
            <OrderLayout>
              <Order />
            </OrderLayout>
          )
        },
        {
          path: '/orders/:id',
          element: (
            <OrderLayout>
              <OrderDetail />
            </OrderLayout>
          )
        }
      ]
    },
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: '/login',
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          )
        },
        {
          path: '/register',
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          )
        }
      ]
    }
  ])
  return routeElements
}
