import jwt from 'jsonwebtoken'

export const TOKEN_COOKIE = 'coastlink_token'
export const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function signToken(user, extraPayload = {}) {
    return jwt.sign(
        {
            userId: user._id.toString(), email: user.email, role: user.role, ...extraPayload
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )
}

// sameSite 'none' requires secure:true, which the browser rejects over
// http://localhost — so dev gets 'lax' and production gets 'none'.
export function cookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: TOKEN_MAX_AGE_MS,
    }
}

export function setAuthCookie(res, user) {
    res.cookie(TOKEN_COOKIE, signToken(user), cookieOptions())
}
