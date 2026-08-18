import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { googleLogout } from '@react-oauth/google'
import api from '../lib/axios'

const AuthContext = createContext(null)
const validRoles = ['admin', 'staff', 'resident']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('coastlink_user')

    if (stored) {
      try {
        const parsed = JSON.parse(stored)

        const isExpired =
          !parsed.exp || parsed.exp * 1000 < Date.now()

        const hasValidRole =
          validRoles.includes(parsed.role)

        if (isExpired || !hasValidRole) {
          localStorage.removeItem('coastlink_user')
        } else {
          setUser(parsed)
        }
      } catch (error) {
        localStorage.removeItem('coastlink_user')
      }
    }

    setLoading(false)
  }, [])

  // Google OAuth login — unchanged
  const login = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential)
    setUser(decoded)
    localStorage.setItem('coastlink_user', JSON.stringify(decoded))
    setRole("admin")
  }

  // Email/password login or signup
  // TODO: replace with real calls once the backend exists —
  // POST /api/auth/login  { email, password }
  // POST /api/auth/register { email, password }
  // Express should verify (or create) the account and return a real user + token.
  const loginWithCredentials = async ({ email, password, mode }) => {
    try {
      await api.post(`/login`, { email, password, mode })
    } catch (error) {

    }
    // const mockUser = {
    //   name: email.split('@')[0],
    //   email,
    //   picture: null,
    //   exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // mock 24hr session
    // }
    // setUser(mockUser)
    // localStorage.setItem('coastlink_user', JSON.stringify(mockUser))
  }

  const logout = () => {
    googleLogout()
    setUser(null)
    localStorage.removeItem('coastlink_user')
  }


  // DEV ONLY DELETE THIS
  const setRole = (role) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, role }
      localStorage.setItem('coastlink_user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithCredentials, logout, setRole, isAuthenticated: !!user, loading }}>
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