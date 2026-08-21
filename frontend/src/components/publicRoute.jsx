import { Navigate, Outlet } from 'react-router'
import { useAuth, homePathFor } from '../context/authContext'

function PublicOnlyRoute() {

    const { isAuthenticated, loading, user } = useAuth()

    if (loading) return null

    return isAuthenticated ? <Navigate to={homePathFor(user)} replace /> : <Outlet />
}

export default PublicOnlyRoute