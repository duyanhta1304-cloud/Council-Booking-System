import { useAuth } from "./authContext"


// DEV ONLY — DELETE BEFORE PRODUCTION
// Floating widget to switch the logged-in user's role without a real backend.
// Requires the (also dev-only) `setRole` function exposed by AuthProvider.

const ROLES = ['admin', 'staff', 'resident']
// DEV ONLY DELETE THIS

function DevRoleSwitcher() {
    const { user, setRole, isAuthenticated } = useAuth()

    // Only makes sense once someone is logged in — setRole no-ops without a user anyway
    if (!isAuthenticated) return null

    return (
        <div style={{
            position: 'fixed', bottom: 'var(--space-md)', right: 'var(--space-md)',
            zIndex: 'var(--z-toast)', backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)', padding: 'var(--space-sm) var(--space-md)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            fontSize: 'var(--font-size-xs)',
        }}>
            <span style={{
                fontWeight: 'var(--font-weight-bold)', color: 'var(--color-danger)',
                textTransform: 'uppercase', letterSpacing: '0.03em',
            }}>
                Dev
            </span>

            <span style={{ color: 'var(--color-text-secondary)' }}>Role:</span>

            <div style={{ display: 'flex', gap: '4px' }}>
                {ROLES.map((role) => {
                    const isActive = user?.role === role
                    return (
                        <button
                            key={role}
                            onClick={() => setRole(role)}
                            style={{
                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? 'var(--color-text-on-dark)' : 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                                cursor: 'pointer', textTransform: 'capitalize',
                            }}
                        >
                            {role}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default DevRoleSwitcher