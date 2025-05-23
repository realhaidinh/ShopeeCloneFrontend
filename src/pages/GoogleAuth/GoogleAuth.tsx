import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {saveTokenToLS} from 'src/utils/auth'
export default function GoogleAuth() {
    const location = useLocation()
    const navigate = useNavigate()
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const accessToken = searchParams.get('accessToken')
        const refreshToken = searchParams.get('refreshToken')
        if (accessToken && refreshToken) {
            saveTokenToLS(accessToken, refreshToken)
            navigate('/')
        }
    }, [location])
    return <></>
}