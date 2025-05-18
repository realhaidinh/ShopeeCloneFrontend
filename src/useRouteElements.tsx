import { Link, Navigate, Outlet, useRoutes } from 'react-router-dom'
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
import NotFound from 'src/pages/NotFound'
import ManageLayout from 'src/layouts/ManageLayout'
import { Button, Result } from 'antd'
import ManageProfile from 'src/pages/ManageProfile'
import EditProfile from 'src/pages/ManageProfile/EditProfile'
import ChangePassword from 'src/pages/ManageProfile/ChangePassword'
import DashBoard from 'src/pages/DashBoard'
import ManageProduct from 'src/pages/ManageProduct'
import ManageOrder from 'src/pages/ManageOrder'
import ManageBrand from 'src/pages/ManageBrand'
import ManageUser from 'src/pages/ManageUser'
import ManageLanguage from 'src/pages/ManageLanguage'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

function AdminRoute() {
  const { isAuthenticated, profile } = useContext(AppContext)
  return isAuthenticated && profile && profile?.roleId === 1 ? (
    <Outlet />
  ) : (
    <Result
      status='403'
      title='403'
      subTitle='Sorry, you are not authorized to access this page.'
      extra={
        <Button>
          <Link to='/'>Back to home page</Link>
        </Button>
      }
    />
  )
}

function ManageRoute() {
  const { isAuthenticated, profile } = useContext(AppContext)
  const allowedRoles = [1, 3] // Admin and Seller

  return isAuthenticated && profile && allowedRoles.includes(profile.roleId) ? (
    <Outlet />
  ) : (
    <Result
      status='403'
      title='403'
      subTitle='Sorry, you are not authorized to access this page.'
      extra={
        <Button>
          <Link to='/'>Back to home page</Link>
        </Button>
      }
    />
  )
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
      path: '*',
      element: (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )
    },
    {
      path: '/manage',
      element: <ManageRoute />,
      children: [
        {
          path: 'products',
          element: (
            <ManageLayout>
              <ManageProduct />
            </ManageLayout>
          )
        },
        {
          path: 'products/:id',
          element: (
            <ManageLayout>
              <div>Product Detail</div>
            </ManageLayout>
          )
        },
        {
          path: 'dashboard',
          element: (
            <ManageLayout>
              <DashBoard />
            </ManageLayout>
          )
        },
        {
          path: 'profile',
          element: (
            <ManageLayout>
              <ManageProfile />
            </ManageLayout>
          )
        },
        {
          path: 'profile/edit',
          element: (
            <ManageLayout>
              <EditProfile />
            </ManageLayout>
          )
        },
        {
          path: 'profile/change-password',
          element: (
            <ManageLayout>
              <ChangePassword />
            </ManageLayout>
          )
        },
        {
          path: 'orders',
          element: (
            <ManageLayout>
              <ManageOrder />
            </ManageLayout>
          )
        },
        {
          path: 'orders/:id',
          element: (
            <ManageLayout>
              <div>Order Detail</div>
            </ManageLayout>
          )
        },

        // Group các route riêng cho Admin
        {
          element: <AdminRoute />,
          children: [
            {
              path: 'brands',
              element: (
                <ManageLayout>
                  <ManageBrand />
                </ManageLayout>
              )
            },
            {
              path: 'categories',
              element: (
                <ManageLayout>
                  <div>Categories Page</div>
                </ManageLayout>
              )
            },
            {
              path: 'roles',
              element: (
                <ManageLayout>
                  <div>Roles Page</div>
                </ManageLayout>
              )
            },
            {
              path: 'languages',
              element: (
                <ManageLayout>
                  <ManageLanguage />
                </ManageLayout>
              )
            },
            {
              path: 'users',
              element: (
                <ManageLayout>
                  <ManageUser />
                </ManageLayout>
              )
            }
          ]
        }
      ]
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
