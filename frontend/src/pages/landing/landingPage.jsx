import { Link } from 'react-router'
import { ledger } from './ledgerTheme'

const FEATURED_FACILITIES = [
    { id: 1, name: 'Community Hall A', category: 'Hall', status: 'Available', tint: [ledger.navy, ledger.navyDeep] },
    { id: 4, name: 'Community Hall C', category: 'Hall', status: 'Available', tint: [ledger.brass, '#7a541d'] },
    { id: 5, name: 'Meeting Room D', category: 'Room', status: 'Available', tint: ['#3d5a52', '#1e2f2a'] },
]
// TODO: replace with GET /api/facilities?featured=true

function LandingPage() {
    return (
        <div style={{ fontFamily: ledger.fontBody, color: ledger.ink, backgroundColor: ledger.paper }}>
            <Hero />
            <div style={{ height: '1px', backgroundColor: ledger.rule, maxWidth: '1180px', margin: '0 auto' }} />
            <QuickActions />
            <FeaturedFacilities />
            <HowItWorks />
            <Support />
        </div>
    )
}

function Hero() {
    return (
        <section style={{ backgroundColor: ledger.navy, color: ledger.onPrimary, padding: '76px 32px 64px' }}>
            <div style={{
                maxWidth: '1180px', margin: '0 auto', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'end',
            }}>
                <div>
                    <div style={{
                        fontFamily: ledger.fontMono, fontSize: '12.5px', letterSpacing: '.12em', textTransform: 'uppercase',
                        color: ledger.brassBright, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px',
                    }}>
                        <span style={{ width: '26px', height: '2px', backgroundColor: ledger.brassBright, display: 'inline-block' }} />
                        Council Facility Booking
                    </div>
                    <h1 style={{
                        fontFamily: ledger.fontHeading, fontWeight: 600, fontSize: 'clamp(2.4rem, 5vw, 4.4rem)',
                        lineHeight: 0.98, letterSpacing: '-0.01em', maxWidth: '11ch', margin: 0, textWrap: 'balance',
                    }}>
                        Book a hall, room or court — <em style={{ fontStyle: 'italic', color: ledger.brassBright, fontWeight: 500 }}>today</em>.
                    </h1>
                    <p style={{ fontSize: '1.15rem', maxWidth: '44ch', color: '#cfe0e2', marginTop: '22px', lineHeight: 1.6 }}>
                        Search what's free across the region's halls, meeting rooms and sports
                        courts, then submit your request in a few clicks. No phone queue, no
                        paper forms.
                    </p>
                    <div style={{ marginTop: '32px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to="/resident/facilities" style={{
                            backgroundColor: ledger.brass, color: '#20140a', fontWeight: 600, fontSize: '.95rem',
                            padding: '14px 26px', borderRadius: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px',
                        }}>
                            Search facilities →
                        </Link>
                        <Link to="/resident/bookings" style={{
                            border: '1.5px solid rgba(244,239,226,.55)', color: ledger.onPrimary, fontWeight: 600, fontSize: '.95rem',
                            padding: '14px 26px', borderRadius: '2px', textDecoration: 'none',
                        }}>
                            See my bookings
                        </Link>
                    </div>
                </div>

                <FacilityStub />
            </div>
        </section>
    )
}

function FacilityStub() {
    return (
        <div style={{
            backgroundColor: ledger.card, color: ledger.ink, border: `1px solid ${ledger.rule}`,
            borderRadius: '2px', padding: '22px', transform: 'rotate(2deg)',
            boxShadow: '0 18px 34px rgba(6,26,34,.35)', position: 'relative', maxWidth: '360px', justifySelf: 'end',
        }}>
            <span style={{
                position: 'absolute', top: '16px', right: '-9px', width: '18px', height: '18px', borderRadius: '50%',
                backgroundColor: ledger.navy, border: `1px solid ${ledger.rule}`,
            }} />
            <div style={{ fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: ledger.inkSoft }}>
                Facility record · No. 0114
            </div>
            <LighthouseArt />
            <h3 style={{ fontFamily: ledger.fontHeading, fontSize: '1.25rem', fontWeight: 600, margin: '4px 0 12px' }}>
                Community Hall A
            </h3>
            <Seal>Available today</Seal>
        </div>
    )
}

function LighthouseArt() {
    return (
        <svg width="100%" height="150" viewBox="0 0 320 150" fill="none" style={{ margin: '14px 0', display: 'block' }}>
            <line x1="10" y1="112" x2="310" y2="112" stroke={ledger.navy} strokeWidth="2" />
            <path d="M20 128 q15 -10 30 0 q15 10 30 0 q15 -10 30 0 q15 10 30 0 q15 -10 30 0 q15 10 30 0 q15 -10 30 0 q15 10 30 0"
                stroke={ledger.brass} strokeWidth="2" fill="none" />
            <path d="M20 141 q15 -8 30 0 q15 8 30 0 q15 -8 30 0 q15 8 30 0 q15 -8 30 0 q15 8 30 0 q15 -8 30 0 q15 8 30 0"
                stroke={ledger.brass} strokeWidth="1.5" fill="none" opacity="0.55" />
            <polygon points="150,112 170,112 165,40 155,40" fill="none" stroke={ledger.navy} strokeWidth="2" strokeLinejoin="round" />
            <line x1="152" y1="90" x2="168" y2="90" stroke={ledger.navy} strokeWidth="2" />
            <line x1="153.5" y1="66" x2="166.5" y2="66" stroke={ledger.navy} strokeWidth="2" />
            <rect x="152" y="26" width="16" height="14" fill="none" stroke={ledger.navy} strokeWidth="2" />
            <path d="M150 26 L160 13 L170 26 Z" fill="none" stroke={ledger.navy} strokeWidth="2" strokeLinejoin="round" />
            <line x1="160" y1="13" x2="160" y2="7" stroke={ledger.navy} strokeWidth="2" />
            <path d="M168 33 L232 12" stroke={ledger.brass} strokeWidth="1.5" strokeDasharray="3 4" />
            <path d="M169 33 L236 33" stroke={ledger.brass} strokeWidth="1.5" strokeDasharray="3 4" />
            <path d="M168 34 L230 54" stroke={ledger.brass} strokeWidth="1.5" strokeDasharray="3 4" />
        </svg>
    )
}

function Seal({ children }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: ledger.fontMono, fontSize: '11px',
            letterSpacing: '.05em', color: ledger.success, border: `1.5px solid ${ledger.success}`, borderRadius: '50px',
            padding: '3px 12px 3px 8px', transform: 'rotate(-3deg)',
        }}>
            <span style={{ fontSize: '8px' }}>●</span>
            {children}
        </span>
    )
}

function QuickActions() {
    const items = [
        { to: '/resident/facilities', title: 'Find a facility', description: "Browse halls, rooms and courts near you, and check what's actually free before you commit to a date." },
        { to: '/resident/bookings', title: 'Manage my bookings', description: "View, change or cancel a booking you've already made — no need to call anyone." },
        { href: '#support', title: 'Get help booking', description: 'Step-by-step guidance, or reach our Customer Service team directly.' },
    ]

    return (
        <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '88px 32px 96px' }}>
            <SectionHead title="What are you here for?" meta="03 ENTRIES" />
            {items.map((item, i) => (
                <LedgerRow key={item.title} index={i + 1} {...item} />
            ))}
        </section>
    )
}

function LedgerRow({ index, to, href, title, description }) {
    const row = (
        <div style={{
            display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: '24px', alignItems: 'center',
            padding: '26px 0', borderTop: `1px solid ${ledger.ruleSoft}`, textDecoration: 'none', color: ledger.ink,
        }}>
            <span style={{ fontFamily: ledger.fontHeading, fontSize: '2rem', fontWeight: 600, color: ledger.rule }}>
                {String(index).padStart(2, '0')}
            </span>
            <span>
                <div style={{ fontFamily: ledger.fontHeading, fontSize: '1.35rem', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
                <div style={{ color: ledger.inkSoft, fontSize: '.95rem', maxWidth: '58ch' }}>{description}</div>
            </span>
            <span style={{ fontSize: '1.4rem', color: ledger.inkSoft }}>→</span>
        </div>
    )

    return to
        ? <Link to={to} style={{ textDecoration: 'none' }}>{row}</Link>
        : <a href={href} style={{ textDecoration: 'none' }}>{row}</a>
}

function FeaturedFacilities() {
    return (
        <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 32px 100px' }}>
            <SectionHead title="Popular this month" meta="FEATURED" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
                {FEATURED_FACILITIES.map((f, i) => (
                    <Link key={f.id} to="/resident/facilities" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            backgroundColor: ledger.card, border: `1px solid ${ledger.rule}`, borderRadius: '2px',
                            paddingBottom: '20px', position: 'relative', overflow: 'hidden',
                            transform: i === 1 ? 'translateY(28px)' : i === 2 ? 'translateY(-10px)' : 'none',
                        }}>
                            <div style={{
                                height: '132px', position: 'relative', borderBottom: `1px dashed ${ledger.rule}`,
                                background: `linear-gradient(155deg, ${f.tint[0]}, ${f.tint[1]})`,
                            }}>
                                <Punch side="left" /><Punch side="right" />
                            </div>
                            <div style={{ padding: '18px 20px 0' }}>
                                <span style={{ fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: ledger.inkSoft }}>
                                    {f.category}
                                </span>
                                <h3 style={{ fontFamily: ledger.fontHeading, fontSize: '1.2rem', margin: '8px 0 12px' }}>{f.name}</h3>
                                <Seal>{f.status}</Seal>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

function Punch({ side }) {
    return (
        <span style={{
            position: 'absolute', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: ledger.paper,
            border: `1px solid ${ledger.rule}`, top: '50%', transform: 'translateY(-50%)', [side]: '-7px',
        }} />
    )
}

function HowItWorks() {
    const steps = [
        { number: '1', title: 'Search', description: 'Look a facility up by type, location or date, and see the calendar for yourself.' },
        { number: '2', title: 'Book', description: 'Pick a free time block and submit your request — it takes under a minute.' },
        { number: '3', title: 'Confirmed', description: "Council staff review it and you're notified the moment it's approved." },
    ]

    return (
        <section style={{ backgroundColor: ledger.navy, color: ledger.onPrimary, padding: '96px 32px' }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
                <SectionHead title="How a booking moves" meta="01 → 03" dark />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', position: 'relative' }}>
                    {steps.map((s) => (
                        <div key={s.number}>
                            <div style={{
                                width: '68px', height: '68px', borderRadius: '50%', backgroundColor: ledger.navyDeep,
                                border: `1.5px solid ${ledger.brassBright}`, color: ledger.brassBright, fontFamily: ledger.fontHeading,
                                fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '22px',
                            }}>
                                {s.number}
                            </div>
                            <h3 style={{ fontFamily: ledger.fontHeading, color: ledger.onPrimary, fontSize: '1.3rem', margin: '0 0 8px' }}>{s.title}</h3>
                            <p style={{ color: '#cfe0e2', fontSize: '.95rem', maxWidth: '34ch', margin: 0 }}>{s.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function Support() {
    return (
        <section id="support" style={{ padding: '80px 32px 100px' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', borderTop: `3px solid ${ledger.brass}`, paddingTop: '22px' }}>
                <p style={{ fontSize: '1.05rem', color: ledger.inkSoft, margin: 0 }}>
                    Prefer to book by phone? Call our Customer Service team on{' '}
0466776778
                    , Monday–Friday, 9am–5pm.
                </p>
            </div>
        </section>
    )
}

function SectionHead({ title, meta, dark }) {
    return (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '24px', marginBottom: '44px', flexWrap: 'wrap' }}>
            <h2 style={{
                fontFamily: ledger.fontHeading, fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                color: dark ? ledger.onPrimary : ledger.ink, margin: 0, textWrap: 'balance',
            }}>
                {title}
            </h2>
            <span style={{ fontFamily: ledger.fontMono, fontSize: '.85rem', letterSpacing: '.08em', color: dark ? '#a9c1c4' : ledger.inkSoft }}>
                {meta}
            </span>
        </div>
    )
}

export default LandingPage
