import { Link } from 'react-router'

function ImagePlaceholder({ label = 'Image placeholder', height = '200px', borderRadius = 'var(--radius-lg)' }) {
    return (
        <div style={{
            height, borderRadius, backgroundColor: 'var(--color-bg)',
            border: '1px dashed var(--color-border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)', gap: '8px',
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="M21 16l-5.5-5.5L3 19" />
            </svg>
            <span style={{ fontSize: 'var(--font-size-xs)' }}>{label}</span>
        </div>
    )
}

const FEATURED_FACILITIES = [
    { id: 1, name: 'Community Hall A', category: 'Hall', status: 'Available' },
    { id: 4, name: 'Community Hall C', category: 'Hall', status: 'Available' },
    { id: 5, name: 'Meeting Room D', category: 'Room', status: 'Available' },
]
// TODO: replace with GET /api/facilities?featured=true

const STATUS_COLORS = {
    Available: { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
}

function LandingPage() {
    return (
        <div>
            {/* Hero */}
            <section style={{
                backgroundColor: 'var(--color-primary)', padding: 'var(--space-3xl) var(--space-lg)',
            }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)',
                    alignItems: 'center', maxWidth: '1100px', margin: '0 auto',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 'var(--font-size-4xl)', color: 'var(--color-text-on-dark)',
                            margin: '0 0 var(--space-md)', lineHeight: 'var(--line-height-tight)',
                        }}>
                            Book a Council facility, online, in minutes
                        </h1>
                        <p style={{
                            fontSize: 'var(--font-size-lg)', color: '#DCEBF5',
                            margin: '0 0 var(--space-xl)', lineHeight: 'var(--line-height-relaxed)',
                        }}>
                            Search halls, rooms and sports courts across the region, check
                            what's free, and book — no phone calls or paper forms needed.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                            <Link to="/resident/facilities" style={{
                                backgroundColor: 'var(--color-text-on-dark)', color: 'var(--color-primary)',
                                padding: '14px 28px', borderRadius: 'var(--radius-md)', textDecoration: 'none',
                                fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)',
                            }}>
                                Search facilities
                            </Link>
                        </div>
                    </div>
                    <ImagePlaceholder label="Hero image placeholder" height="260px" />
                </div>
            </section>

            {/* Quick actions */}
            <section style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-lg)' }}>
                    What would you like to do?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
                    <QuickActionCard to="/resident/facilities" icon={<SearchIcon />} title="Find a facility"
                        description="Browse halls, rooms and courts near you and check availability." />
                    <QuickActionCard to="/resident/bookings" icon={<CalendarIcon />} title="Manage my bookings"
                        description="View, change or cancel a booking you've already made." />
                    <QuickActionCard href="#support" icon={<HelpIcon />} title="Get help booking"
                        description="Step-by-step guidance, or call our customer service team directly." />
                </div>
            </section>

            {/* Featured facilities */}
            <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 var(--space-lg) var(--space-2xl)' }}>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-lg)' }}>
                    Popular facilities
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                    {FEATURED_FACILITIES.map((f) => (
                        <Link key={f.id} to={`/details/${f.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
                                <ImagePlaceholder label={f.category} height="120px" borderRadius="0" />
                                <div style={{ padding: 'var(--space-md)' }}>
                                    <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>{f.name}</h3>
                                    <span style={{
                                        fontSize: 'var(--font-size-sm)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                        backgroundColor: STATUS_COLORS[f.status].bg, color: STATUS_COLORS[f.status].text,
                                    }}>
                                        {f.status}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-2xl) var(--space-lg)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                        How it works
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-xl)' }}>
                        <Step number="1" title="Search" description="Look up a facility by type, location or date." />
                        <Step number="2" title="Book" description="Pick a free time slot and submit your request." />
                        <Step number="3" title="Confirmed" description="Council staff review and confirm — you'll be notified." />
                    </div>
                </div>
            </section>

            {/* Support footer note */}
            <section style={{ padding: 'var(--space-xl) var(--space-lg)', textAlign: 'center' }}>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
                    Prefer to book by phone? Call our Customer Service team on{' '}
                    <strong style={{ color: 'var(--color-text)' }}>[placeholder phone number]</strong>,
                    Monday-Friday, 9am-5pm.
                </p>
            </section>
        </div>
    )
}

function QuickActionCard({ to, icon, title, description }) {
    return (
        <Link to={to} style={{ textDecoration: 'none' }}>
            <div style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface)',
                minHeight: '150px', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
            }}>
                <div style={{ color: 'var(--color-secondary)' }}>{icon}</div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-normal)' }}>
                    {description}
                </p>
            </div>
        </Link>
    )
}

function Step({ number, title, description }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-on-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', margin: '0 auto var(--space-md)',
            }}>
                {number}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{description}</p>
        </div>
    )
}

function SearchIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
        </svg>
    )
}
function CalendarIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
    )
}
function HelpIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5" /><path d="M12 17h.01" />
        </svg>
    )
}

export default LandingPage