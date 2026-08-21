import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth, homePathFor } from '../../context/authContext'
import { Link } from 'react-router'
import { toast } from 'react-hot-toast'
import { useEffect } from 'react'
function Login() {
  const { user, login, loginWithCredentials, loading } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accountType, setAccountType] = useState('resident')

  const isSignup = mode === 'signup'

  useEffect(() => {
    if (loading || !user) return

    const destination = homePathFor(user)

    if (destination === '/') {
      toast.error('Your account does not have a valid role.')
      return
    }

    toast.success(
      `You are already logged in as ${user.role}. Redirecting...`,
      {
        duration: 2000,
      }
    )

    const timer = setTimeout(() => {
      navigate(destination, { replace: true })
    }, 1500)

    return () => clearTimeout(timer)
  }, [user, loading, navigate])

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')

    try {
      const signedInUser = await login(credentialResponse)
      navigate(homePathFor(signedInUser), { replace: true })
    } catch {
      setError('Google sign-in failed.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password || (isSignup && !name)) {
      setError('Please fill in all fields.')
      return
    }
    if (isSignup && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)

    try {
      const signedInUser = await loginWithCredentials({ name, email, password, mode, accountType })
      navigate(homePathFor(signedInUser), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--color-bg)', padding: 'var(--space-md)',
    }}>
      <Link
        to="/"
        aria-label="Back to home"
        style={{
          position: 'fixed',
          top: 'var(--space-lg)',
          left: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
          fontSize: 'var(--font-size-sm)',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      <div style={{
        width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-2xl)', boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)',
          textAlign: 'center', margin: '0 0 var(--space-xl)',
        }}>
          CoastLink Council
        </h1>

        <div style={{
          display: 'flex', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
          padding: '4px', marginBottom: 'var(--space-lg)',
        }}>
          <button type="button" onClick={() => switchMode('login')} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)',
            backgroundColor: !isSignup ? 'var(--color-surface)' : 'transparent',
            color: !isSignup ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)',
            cursor: 'pointer', transition: 'background var(--transition-fast), color var(--transition-fast)',
            boxShadow: !isSignup ? 'var(--shadow-sm)' : 'none',
          }}>
            Log in
          </button>
          <button type="button" onClick={() => switchMode('signup')} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)',
            backgroundColor: isSignup ? 'var(--color-surface)' : 'transparent',
            color: isSignup ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)',
            cursor: 'pointer', transition: 'background var(--transition-fast), color var(--transition-fast)',
            boxShadow: isSignup ? 'var(--shadow-sm)' : 'none',
          }}>
            Sign up
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)',
            padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {isSignup && (
            <label style={labelStyle}>
              Full name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Jane Citizen" style={inputStyle} required />
            </label>
          )}

          <label style={labelStyle}>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" style={inputStyle} required />
          </label>

          <label style={labelStyle}>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 8 characters' : '••••••••'} style={inputStyle} required />
          </label>

          {isSignup && (
            <div style={labelStyle}>
              Account Type

              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: '8px' }}>
                {['resident', 'staff', 'admin'].map((role) => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                    <input
                      type="radio"
                      name="accountType"
                      value={role}
                      checked={accountType === role}
                      onChange={(e) => setAccountType(e.target.value)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} style={{
            backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-dark)',
            border: 'none', borderRadius: 'var(--radius-md)', padding: '12px',
            fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)',
            cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
            marginTop: 'var(--space-xs)', transition: 'background var(--transition-fast)',
          }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
          >
            {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          margin: 'var(--space-lg) 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          or
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed.')} />
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: '6px',
  fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)',
}
const inputStyle = {
  padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-base)', color: 'var(--color-text)', boxSizing: 'border-box',
  fontFamily: 'var(--font-family-base)',
}

export default Login