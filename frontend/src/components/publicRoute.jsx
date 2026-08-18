import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/authContext'

function PublicOnlyRoute() {

    const { isAuthenticated, loading } = useAuth()

    if (loading) return null

    return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />
}

export default PublicOnlyRoute