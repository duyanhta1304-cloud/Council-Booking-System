import { useNavigate } from "react-router"
import { useAuth } from "../context/authContext"
import { googleLogout } from '@react-oauth/google'
import { useState } from "react"
import { DetailRow, formatAddress } from "./ui"
export function LogoutButton({ style, onLogout }) {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        googleLogout()
        logout()

        if (onLogout) {
            onLogout()
        }

        navigate('/login', { replace: true })
    }

    return (
        <button
            onClick={handleLogout}
            style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                ...style,
            }}
        >
            Log out
        </button>
    )
}

export function UserProfileCard() {
    const { user } = useAuth()
    const [showDetails, setShowDetails] = useState(false)

    if (!user) {
        return null
    }

    const roleName =
        user.role?.charAt(0).toUpperCase() + user.role?.slice(1)

    const getInitial = () => {
        if (user.name) {
            return user.name.charAt(0).toUpperCase()
        }

        if (user.email) {
            return user.email.charAt(0).toUpperCase()
        }

        return '?'
    }

    return (
        <div>
            {/* Profile Card */}
            <button
                type="button"
                onClick={() => setShowDetails(true)}
                style={{
                    width: '100%',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg)',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: 'auto',
                }}
            >
                {user.profilePictureUrl ? (
                    <img
                        src={user.profilePictureUrl}
                        alt={user.name || 'Profile'}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                        }}
                    />
                ) : null}

                {/* Fallback avatar */}
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-on-dark)',
                        display: user.profilePictureUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'var(--font-weight-semibold)',
                        flexShrink: 0,
                    }}
                >
                    {getInitial()}
                </div>

                <div
                    style={{
                        minWidth: 0,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user.name}
                    </div>

                    <div
                        style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        {roleName}
                    </div>
                </div>
            </button>

            {/* User Details Modal */}
            {showDetails && (
                <div
                    onClick={() => setShowDetails(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 'var(--z-modal)',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-md)',
                            padding: 'var(--space-xl)',
                            margin: 'var(--space-md)',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: 'var(--space-lg)',
                            }}
                        >
                            {user.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt={user.name || 'Profile'}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.nextElementSibling.style.display = 'flex'
                                    }}
                                    style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : null}

                            <div
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--color-text-on-dark)',
                                    display: user.profilePictureUrl ? 'none' : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 'var(--font-weight-semibold)',
                                }}
                            >
                                {getInitial()}
                            </div>

                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color: 'var(--color-text)',
                                        fontSize: 'var(--font-size-xl)',
                                    }}
                                >
                                    {user.name}
                                </h2>

                                <div
                                    style={{
                                        marginTop: '4px',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    {roleName}
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-sm)',
                            }}
                        >
                            <DetailRow label="Name" value={user.name} />
                            <DetailRow label="Email" value={user.email} />
                            <DetailRow label="Phone" value={user.phoneNumber} />
                            <DetailRow label="Role" value={roleName} />
                            <DetailRow label="Email verified" value={user.emailVerified ? 'Yes' : 'No'} />
                            <DetailRow label="Address" value={formatAddress(user.address)} />
                            <DetailRow
                                label="Last login"
                                value={
                                    user.lastLoginAt
                                        ? new Date(user.lastLoginAt).toLocaleString()
                                        : 'Not available'
                                }
                            />
                            <DetailRow
                                label="Account created"
                                value={
                                    user.createdAt
                                        ? new Date(user.createdAt).toLocaleString()
                                        : 'Not available'
                                }
                            />
                        </div>

                        <div style={{'display':'flex', 'marginTop': 'var(--space-lg)', 'gap': 'var(--space-sm)'}}>
                            {/* Close */}
                            <button
                                type="button"
                                onClick={() => setShowDetails(false)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--color-text-on-dark)',
                                    cursor: 'pointer',
                                    fontWeight: 'var(--font-weight-semibold)',
                                }}
                            >
                                Close
                            </button>

                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
