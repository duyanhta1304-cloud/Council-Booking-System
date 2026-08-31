import { createContext, useContext, useState, useEffect } from 'react'
import { googleLogout } from '@react-oauth/google'
import api from '../lib/axios'

const AuthContext = createContext(null)

export const validRoles = ['admin', 'staff', 'resident']

export const roleRoutes = {
  admin: '/admin',
  staff: '/staff',
  resident: '/resident',
}

// Where a user should land after logging in.
export function homePathFor(user) {
  return roleRoutes[user?.role] ?? '/'
}

const STORAGE_KEY = 'coastlink_user'

// localStorage is only a cache so the UI can render before /auth/me answers.
// The httpOnly cookie is the real session and the server always wins.
function readCachedUser() {
  const cached = localStorage.getItem(STORAGE_KEY)

  if (!cached) return null

  try {
    const parsed = JSON.parse(cached)
    return validRoles.includes(parsed.role) ? parsed : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser)
  const [loading, setLoading] = useState(true)

  const storeUser = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    return nextUser
  }

  const clearUser = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  // Confirm the cached user against the session cookie on first load.
  useEffect(() => {
    let cancelled = false

    api.get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) storeUser(data.user)
      })
      .catch(() => {
        if (!cancelled) clearUser()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // Google sign-in — the credential is verified by the backend, which then
  // issues our own session cookie and returns the user record.
  const login = async (credentialResponse) => {
    const { data } = await api.post('/auth/google', {
      credential: credentialResponse.credential,
    })
    return { user: storeUser(data.user), isNewUser: data.isNewUser }
  }

  // Email/password login or signup. Throws with a usable message on failure.
  // accountType picks the role for a new account ('resident' | 'staff' | 'admin').
  const loginWithCredentials = async ({ name, email, password, mode, accountType }) => {
    const isSignup = mode === 'signup'

    try {
      const { data } = isSignup
        ? await api.post('/auth/register', { name, email, password, accountType })
        : await api.post('/auth/login', { email, password })

      return { user: storeUser(data.user), isNewUser: isSignup }
    } catch (error) {
      const message =
        error.response?.data?.message ??
        (isSignup ? 'Could not create account. Please try again.' : 'Invalid email or password.')
      throw new Error(message, { cause: error })
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Clear the client session regardless — the cookie expires on its own.
    }
    googleLogout()
    clearUser()
  }

  // Permanently deletes the signed-in account, then drops the local session.
  const deleteAccount = async () => {
    try {
      await api.delete('/auth/me')
    } catch (error) {
      throw new Error(error.response?.data?.message ?? 'Could not delete account.', { cause: error })
    }

    googleLogout()
    clearUser()
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithCredentials, logout, deleteAccount, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
