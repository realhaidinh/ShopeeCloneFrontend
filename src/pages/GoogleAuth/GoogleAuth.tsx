import { useMutation } from '@tanstack/react-query'
import { get } from 'lodash'
import { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import profileApi from 'src/apis/profile.api'
import { AppContext } from 'src/contexts/app.context'
export default function GoogleAuth() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const getProfileMutation = useMutation({
    mutationFn: () => profileApi.getProfile()
  })
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      getProfileMutation.mutate(undefined, {
        onSuccess: (data) => {
          setIsAuthenticated(true)
          console.log(data.data)
          setProfile(data.data)
          if (data.data.roleId === 2 || data.data.roleId === 1) {
            navigate('/manage/profile')
          } else {
            navigate('/')
          }
        }
      })
    }
  }, [])
  return <></>
}
