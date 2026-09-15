import { NavLink, Outlet } from 'react-router'
import { UserProfileCard } from '../auth'
import { NotificationBell } from '../notifications'

function GeneralLayout({ role, navItems }) {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1)

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside
                style={{
                    width: '220px',
                    flexShrink: 0,
                    backgroundColor: 'var(--color-surface)',
                    borderRight: '1px solid var(--color-border)',
                    padding: 'var(--space-lg) var(--space-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-xs)',
                }}
            >
                {/* Logo / Title */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 var(--space-sm)',
                        marginBottom: 'var(--space-lg)',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-family-heading)',
                            fontWeight: 600,
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-primary)',
                        }}
                    >
                        CoastLink {roleName}
                    </span>

                    <NotificationBell />
                </div>

                {/* Navigation */}
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        style={({ isActive }) => ({
                            padding: '10px var(--space-sm) 10px 11px',
                            borderLeft: `3px solid ${isActive ? 'var(--color-secondary)' : 'transparent'}`,
                            textDecoration: 'none',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: isActive
                                ? 'var(--font-weight-semibold)'
                                : 'var(--font-weight-regular)',
                            color: isActive
                                ? 'var(--color-text)'
                                : 'var(--color-text-secondary)',
                            backgroundColor: isActive
                                ? 'var(--color-primary-light)'
                                : 'transparent',
                            transition: 'background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
                        })}
                        onMouseEnter={(e) => {
                            if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                                e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        {item.label}
                    </NavLink>
                ))}

                {/* Pushes profile card to bottom */}
                <div style={{ flex: 1 }} />

                <UserProfileCard />
            </aside>

            {/* Page Content */}
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    padding: 'var(--space-lg)',
                    backgroundColor: 'var(--color-bg)',
                }}
            >
                <Outlet />
            </main>
        </div>
    )
}

export default GeneralLayout