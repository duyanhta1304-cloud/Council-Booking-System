import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/user.model.js'
import { TOKEN_COOKIE, cookieOptions, setAuthCookie } from '../middleware/jwtUtils.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

const ASSIGNABLE_ROLES = ['resident', 'staff', 'admin']

// POST /api/auth/register  { name, email, password, accountType }
export async function register(req, res) {
  const { name, email, password, accountType } = req.body ?? {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' })
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
  }

  if (accountType && !ASSIGNABLE_ROLES.includes(accountType)) {
    return res.status(400).json({ message: 'Invalid account type' })
  }

  try {
    const normalisedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalisedEmail })

    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists' })
    }

    const user = await User.create({
      name: name.trim(),
      email: normalisedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      authProvider: 'local',
      role: accountType ?? 'resident',
      lastLoginAt: new Date(),
    })

    setAuthCookie(res, user)
    res.status(201).json({ user: user.toPublicJSON() })
  } catch (error) {
    console.log('Register error: ', error)
    res.status(500).json({ message: 'Could not create account' })
  }
}

// POST /api/auth/login  { email, password }
export async function login(req, res) {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash')

    // Same message for "no such user" and "wrong password" so the response
    // cannot be used to discover which emails are registered.
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    user.lastLoginAt = new Date()
    await user.save()

    setAuthCookie(res, user)
    res.json({ user: user.toPublicJSON() })
  } catch (error) {
    console.log('Login error: ', error)
    res.status(500).json({ message: 'Could not log in' })
  }
}

// POST /api/auth/google  { credential }
// Verifies the Google ID token server-side, then issues our own cookie so both
// login paths share one session mechanism.
export async function googleLogin(req, res) {
  const { credential } = req.body ?? {}

  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential' })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload?.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' })
    }

    const email = payload.email.toLowerCase()
    let user = await User.findOne({ email })
    const isNewUser = !user

    if (!user) {
      user = new User({
        name: payload.name || email.split('@')[0],
        email,
        authProvider: 'google',
        role: 'resident',
      })
    }

    user.googleId = payload.sub
    user.emailVerified = true
    user.profilePictureUrl = payload.picture || user.profilePictureUrl
    user.lastLoginAt = new Date()
    await user.save()

    setAuthCookie(res, user)
    res.json({ user: user.toPublicJSON(), isNewUser })
  } catch (error) {
    console.log('Google login error: ', error)
    res.status(401).json({ message: 'Google sign-in failed' })
  }
}

// GET /api/auth/me — the source of truth for the client's auth state.
export async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined })
      return res.status(401).json({ message: 'Account no longer exists' })
    }

    res.json({ user: user.toPublicJSON() })
  } catch (error) {
    console.log('Me error: ', error)
    res.status(500).json({ message: 'Could not load account' })
  }
}

// DELETE /api/auth/me — permanently removes the signed-in user's own account.
export async function deleteAccount(req, res) {
  try {
    const deleted = await User.findByIdAndDelete(req.user.userId)

    if (!deleted) {
      return res.status(404).json({ message: 'Account not found' })
    }

    // The session must die with the account.
    res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined })
    res.json({ message: 'Account deleted' })
  } catch (error) {
    console.log('Delete account error: ', error)
    res.status(500).json({ message: 'Could not delete account' })
  }
}

// POST /api/auth/logout
export function logout(req, res) {
  // clearCookie only matches if the flags match the ones used to set it.
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined })
  res.json({ message: 'Logged out' })
}
