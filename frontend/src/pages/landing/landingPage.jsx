import { Link } from 'react-router'
import { ledger } from './ledgerTheme'
import communityHall from '../../assets/communityhall.jpg'
import communityHall2 from '../../assets/communityhall2.jpg'
import communityHall3 from '../../assets/communityhall3.jpg'

const FEATURED_FACILITIES = [
    { id: 1, name: 'Community Hall A', category: 'Hall', status: 'Available', image: communityHall, alt: 'Interior of Community Hall A set up with chairs' },
    { id: 4, name: 'Community Hall C', category: 'Hall', status: 'Available', image: communityHall2, alt: 'Community Hall C main floor' },
    { id: 5, name: 'Meeting Room D', category: 'Room', status: 'Available', image: communityHall3, alt: 'Meeting Room D with table seating' },
]
    
function LandingPage() {
    return (
        <div style={{ fontFamily: ledger.fontBody, color: ledger.ink, backgroundColor: ledger.paper }}>
            <Hero />
            <div style={{ height: '1px', backgroundColor: ledger.rule, maxWidth: '1180px', margin: '0 auto' }} />
            <QuickActions />
            <FeaturedFacilities />
            <HowItWorks />
            <Support />
            <Footer />
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
                                backgroundColor: ledger.navy,
                            }}>
                                <img src={f.image} alt={f.alt} loading="lazy" style={{
                                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                                }} />
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
    const channels = [
        {
            label: 'By phone',
            value: '(02) 4466 7767',
            href: 'tel:+61244667767',
            note: 'Monday to Friday, 9:00am to 5:00pm. Closed public holidays.',
        },
        {
            label: 'By email',
            value: 'bookings@coastallink.nsw.gov.au',
            href: 'mailto:bookings@coastallink.nsw.gov.au',
            note: 'We aim to respond within two business days.',
        },
        {
            label: 'In person',
            value: 'Customer Service Centre',
            href: null,
            note: '12 Harbour Parade, Kiama NSW 2533',
        },
    ]

    return (
        <section id="support" style={{ maxWidth: '1180px', margin: '0 auto', padding: '80px 32px 96px' }}>
            <SectionHead title="Need a hand?" meta="CONTACT" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
                {channels.map((c) => (
                    <div key={c.label} style={{ borderTop: `3px solid ${ledger.brass}`, paddingTop: '18px' }}>
                        <div style={{
                            fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.1em',
                            textTransform: 'uppercase', color: ledger.inkSoft, marginBottom: '10px',
                        }}>
                            {c.label}
                        </div>
                        {c.href ? (
                            <a href={c.href} style={{
                                fontFamily: ledger.fontHeading, fontSize: '1.2rem', fontWeight: 600,
                                color: ledger.ink, textDecoration: 'none', borderBottom: `1px solid ${ledger.rule}`,
                            }}>
                                {c.value}
                            </a>
                        ) : (
                            <div style={{ fontFamily: ledger.fontHeading, fontSize: '1.2rem', fontWeight: 600 }}>{c.value}</div>
                        )}
                        <p style={{ color: ledger.inkSoft, fontSize: '.9rem', lineHeight: 1.6, margin: '10px 0 0' }}>{c.note}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

const FOOTER_COLUMNS = [
    {
        heading: 'Facilities',
        links: [
            { label: 'Search facilities', to: '/resident/facilities' },
            { label: 'Halls and function rooms', href: '#' },
            { label: 'Sports courts and fields', href: '#' },
            { label: 'Fees and charges', href: '#' },
        ],
    },
    {
        heading: 'Bookings',
        links: [
            { label: 'My bookings', to: '/resident/bookings' },
            { label: 'Conditions of use', href: '#' },
            { label: 'Cancellations and refunds', href: '#' },
            { label: 'Insurance requirements', href: '#' },
        ],
    },
    {
        heading: 'Council',
        links: [
            { label: 'About CoastalLink', href: '#' },
            { label: 'Council meetings', href: '#' },
            { label: 'News and notices', href: '#' },
            { label: 'Careers', href: '#' },
        ],
    },
    {
        heading: 'Help',
        links: [
            { label: 'Contact us', href: '#support' },
            { label: 'Report a facility issue', href: '#' },
            { label: 'Frequently asked questions', href: '#' },
            { label: 'Accessibility', href: '#' },
        ],
    },
]

const FOOTER_LEGAL = ['Privacy', 'Terms of use', 'Disclaimer', 'Right to information', 'Sitemap']

function Footer() {
    const linkStyle = {
        color: '#cfe0e2', fontSize: '.92rem', textDecoration: 'none',
        display: 'inline-block', padding: '5px 0', lineHeight: 1.5,
    }

    return (
        <footer style={{ backgroundColor: ledger.navyDeep, color: ledger.onPrimary, padding: '72px 32px 32px' }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: '40px 28px', alignItems: 'start',
                }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: ledger.fontHeading, fontSize: '1.45rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
                            CoastalLink
                        </div>
                        <div style={{
                            fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.1em',
                            textTransform: 'uppercase', color: ledger.brassBright, marginTop: '8px',
                        }}>
                            Council Facility Services
                        </div>
                        <p style={{ color: '#a9c1c4', fontSize: '.9rem', lineHeight: 1.7, margin: '18px 0 0', maxWidth: '30ch' }}>
                            12 Harbour Parade<br />
                            Kiama NSW 2533<br />
                            PO Box 114, Kiama NSW 2533
                        </p>
                        <p style={{ fontSize: '.9rem', lineHeight: 1.7, margin: '14px 0 0' }}>
                            <a href="tel:+61244667767" style={{ ...linkStyle, padding: 0 }}>(02) 4466 7767</a><br />
                            <a href="mailto:bookings@coastallink.nsw.gov.au" style={{ ...linkStyle, padding: 0 }}>
                                bookings@coastallink.nsw.gov.au
                            </a>
                        </p>
                    </div>

                    {FOOTER_COLUMNS.map((col) => (
                        <nav key={col.heading} aria-label={col.heading} style={{ minWidth: 0 }}>
                            <h3 style={{
                                fontFamily: ledger.fontMono, fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                                color: ledger.brassBright, fontWeight: 500, margin: '0 0 12px',
                            }}>
                                {col.heading}
                            </h3>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        {link.to
                                            ? <Link to={link.to} style={linkStyle}>{link.label}</Link>
                                            : <a href={link.href} style={linkStyle}>{link.label}</a>}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <p style={{
                    borderTop: '1px solid rgba(244,239,226,.18)', marginTop: '48px', paddingTop: '26px',
                    color: '#a9c1c4', fontSize: '.85rem', lineHeight: 1.7, maxWidth: '78ch',
                }}>
                    CoastalLink acknowledges the Traditional Custodians of the land and waters on which we
                    work, and pays respect to Elders past and present.
                </p>

                <div style={{
                    borderTop: '1px solid rgba(244,239,226,.18)', marginTop: '22px', paddingTop: '22px',
                    display: 'flex', flexWrap: 'wrap', gap: '12px 28px', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ color: '#8fa9ad', fontSize: '.82rem' }}>
                        &copy; {new Date().getFullYear()} CoastalLink Council &middot; ABN 42 001 114 233
                    </span>
                    <ul style={{
                        listStyle: 'none', margin: 0, padding: 0, display: 'flex',
                        flexWrap: 'wrap', gap: '8px 20px',
                    }}>
                        {FOOTER_LEGAL.map((label) => (
                            <li key={label}>
                                <a href="#" style={{ ...linkStyle, padding: 0, fontSize: '.82rem' }}>{label}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <p style={{ color: '#6d868b', fontSize: '.78rem', margin: '20px 0 0' }}>
                    Demonstration site built for CSIT214. Contact details and linked pages are placeholders.
                </p>
            </div>
        </footer>
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
