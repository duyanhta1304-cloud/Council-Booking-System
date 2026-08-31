import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth, homePathFor } from '../../context/authContext'
import { Link } from 'react-router'
import { toast } from 'react-hot-toast'
import { useEffect } from 'react'
import { ledger } from './ledgerTheme'

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
      `Welcome back, ${user.name}! Redirecting...`,
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
      const { user: signedInUser, isNewUser } = await login(credentialResponse)
      toast.success(isNewUser ? `Welcome, ${signedInUser.name}!` : `Welcome back, ${signedInUser.name}!`)
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
      const { user: signedInUser, isNewUser } = await loginWithCredentials({ name, email, password, mode, accountType })
      toast.success(isNewUser ? `Welcome, ${signedInUser.name}!` : `Welcome back, ${signedInUser.name}!`)
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
      backgroundColor: ledger.paper, padding: 'var(--space-md)', fontFamily: ledger.fontBody, color: ledger.ink,
    }}>
      <Link
        to="/"
        aria-label="Back to home"
        style={{
          position: 'fixed', top: 'var(--space-lg)', left: 'var(--space-lg)',
          display: 'flex', alignItems: 'center', gap: '6px',
          color: ledger.inkSoft, textDecoration: 'none', fontSize: 'var(--font-size-sm)',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = ledger.navy}
        onMouseLeave={(e) => e.currentTarget.style.color = ledger.inkSoft}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      <div style={{
        width: '100%', maxWidth: '900px', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        backgroundColor: ledger.card, border: `1px solid ${ledger.rule}`,
        boxShadow: '0 24px 48px rgba(11,37,48,.12)',
      }}>
        {/* Aside */}
        <div style={{
          backgroundColor: ledger.navy, color: ledger.onPrimary, padding: '44px 36px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '32px',
        }}>
          <div>
            <div style={{
              fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
              color: '#a9c1c4', marginBottom: '18px',
            }}>
              CoastLink Council
            </div>
            <h2 style={{
              fontFamily: ledger.fontHeading, fontWeight: 600, color: ledger.onPrimary,
              fontSize: '1.9rem', lineHeight: 1.15, margin: 0, textWrap: 'balance',
            }}>
              Your council account, one sign-in.
            </h2>
            <p style={{ color: '#cfe0e2', fontSize: '.92rem', marginTop: '16px', lineHeight: 1.55 }}>
              Residents, staff and administrators all sign in here — what you see next
              depends on your role.
            </p>
          </div>
          <div style={{
            alignSelf: 'flex-start', border: `1.5px solid ${ledger.brassBright}`, color: ledger.brassBright,
            fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.08em', padding: '6px 14px',
            borderRadius: '50px', transform: 'rotate(-4deg)',
          }}>
            Est. session · 7 days
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '44px 40px' }}>
          <div style={{ display: 'flex', gap: '28px', borderBottom: `1px solid ${ledger.rule}`, marginBottom: '28px' }}>
            <button type="button" onClick={() => switchMode('login')} style={tabStyle(!isSignup)}>
              Log in
            </button>
            <button type="button" onClick={() => switchMode('signup')} style={tabStyle(isSignup)}>
              Sign up
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)',
              padding: 'var(--space-sm) var(--space-md)', borderRadius: '2px',
              fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <Field label="Full name">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Citizen" style={inputStyle} required {...focusHandlers} />
              </Field>
            )}

            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle} required {...focusHandlers} />
            </Field>

            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'At least 8 characters' : '••••••••'} style={inputStyle} required {...focusHandlers} />
            </Field>

            {isSignup && (
              <Field label="Account type">
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {['resident', 'staff', 'admin'].map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => setAccountType(role)}
                      style={{
                        flex: 1, textAlign: 'center', padding: '9px 6px', fontSize: '.82rem',
                        fontFamily: ledger.fontMono, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer',
                        border: `1.5px solid ${accountType === role ? ledger.brass : ledger.rule}`,
                        color: accountType === role ? ledger.brass : ledger.inkSoft,
                        backgroundColor: accountType === role ? 'rgba(168,117,42,.12)' : 'transparent',
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '30px', gap: '16px', flexWrap: 'wrap' }}>
              <button type="submit" disabled={submitting} style={{
                backgroundColor: ledger.navy, color: ledger.onPrimary, border: 'none', borderRadius: '2px',
                padding: '13px 26px', fontFamily: ledger.fontBody, fontSize: '.95rem', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                transition: 'background var(--transition-fast)',
              }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = ledger.navyDeep)}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ledger.navy}
              >
                {submitting ? 'Please wait…' : isSignup ? 'Create account →' : 'Log in →'}
              </button>
              <span
                onClick={() => switchMode(isSignup ? 'login' : 'signup')}
                style={{ fontFamily: ledger.fontMono, fontSize: '.8rem', color: ledger.inkSoft, cursor: 'pointer' }}
              >
                {isSignup ? 'Have an account? Log in' : 'No account? Switch to sign up'}
              </span>
            </div>
          </form>

          <div style={{ marginTop: '22px', paddingTop: '22px', borderTop: `1px dashed ${ledger.rule}`, display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed.')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: '20px' }}>
      <span style={{
        display: 'block', fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.08em',
        textTransform: 'uppercase', color: ledger.inkSoft, marginBottom: '8px',
      }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function tabStyle(active) {
  return {
    fontFamily: ledger.fontHeading, fontSize: '1.05rem', fontWeight: 600, paddingBottom: '14px',
    color: active ? ledger.ink : ledger.inkSoft, borderBottom: `2px solid ${active ? ledger.brass : 'transparent'}`,
    background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
  }
}

const inputStyle = {
  width: '100%', border: 'none', borderBottom: `1.5px solid ${ledger.rule}`, background: 'transparent',
  padding: '10px 2px', fontSize: '1rem', color: ledger.ink, fontFamily: ledger.fontBody, boxSizing: 'border-box',
  outline: 'none',
}

// Inline styles can't express :focus, so this pair fills in the accent border a real stylesheet would.
const focusHandlers = {
  onFocus: (e) => { e.currentTarget.style.borderBottomColor = ledger.brass },
  onBlur: (e) => { e.currentTarget.style.borderBottomColor = ledger.rule },
}

export default Login
