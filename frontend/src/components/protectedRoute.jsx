import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/authContext'

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return null // avoid a flash-redirect while checking localStorage

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const hasAccess = !allowedRoles || allowedRoles.includes(user?.role)

  if (!hasAccess) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute