import { NavLink, Outlet } from 'react-router'
import { UserProfileCard } from '../auth'

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
                        fontWeight: 'var(--font-weight-bold)',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-primary)',
                        padding: '0 var(--space-sm)',
                        marginBottom: 'var(--space-lg)',
                    }}
                >
                    CoastLink {roleName}
                </div>

                {/* Navigation */}
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        style={({ isActive }) => ({
                            padding: '10px var(--space-sm)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: isActive
                                ? 'var(--font-weight-semibold)'
                                : 'var(--font-weight-regular)',
                            color: isActive
                                ? 'var(--color-primary)'
                                : 'var(--color-text-secondary)',
                            backgroundColor: isActive
                                ? 'var(--color-primary-light)'
                                : 'transparent',
                        })}
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
                    padding: 'var(--space-xl)',
                    backgroundColor: 'var(--color-bg)',
                }}
            >
                <Outlet />
            </main>
        </div>
    )
}

export default GeneralLayout