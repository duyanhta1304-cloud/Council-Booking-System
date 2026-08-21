import jwt from 'jsonwebtoken'
import { TOKEN_COOKIE } from './jwtUtils.js'

function authMiddleware(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE]

  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Use after authMiddleware: requireRole('admin') or requireRole('admin', 'staff')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}

export default authMiddleware
