import { Link } from 'react-router'
import { PageHeader, Card, Badge, tableStyles, buttonStyle } from '../../components/ui'

// TODO: replace with GET /api/resident/dashboard
const UPCOMING_BOOKINGS = [
  { id: 1, facility: 'Community Hall A', date: '20 Aug', time: '2:00 PM', status: 'Confirmed' },
  { id: 2, facility: 'Sports Court 1', date: '24 Aug', time: '10:00 AM', status: 'Pending' },
]

const NOTICES = [
  { id: 1, message: 'Sports Court 2 is closed for resurfacing until 25 Aug.', tone: 'warning' },
]

function statusTone(status) {
  if (status === 'Confirmed') return 'success'
  if (status === 'Pending') return 'warning'
  return 'default'
}

function ResidentHome() {
  return (
    <div>
      <PageHeader
        title="Welcome back"
        description="Here's what's coming up and what's new with Council facilities."
        action={
          <Link to="/resident/facilities" style={{ textDecoration: 'none' }}>
            <button style={buttonStyle}>Book a facility</button>
          </Link>
        }
      />

      {NOTICES.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
          {NOTICES.map((n) => (
            <div key={n.id} style={{
              backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
              padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
            }}>
              {n.message}
            </div>
          ))}
        </div>
      )}

      <Card style={{ padding: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Upcoming bookings
          </h2>
          <Link to="/resident/bookings" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
            View all
          </Link>
        </div>

        {UPCOMING_BOOKINGS.length === 0 ? (
          <div style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            You have no upcoming bookings.
          </div>
        ) : (
          <div style={tableStyles.wrapper}>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>Facility</th>
                  <th style={tableStyles.th}>Date</th>
                  <th style={tableStyles.th}>Time</th>
                  <th style={tableStyles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {UPCOMING_BOOKINGS.map((b) => (
                  <tr key={b.id}>
                    <td style={tableStyles.td}>{b.facility}</td>
                    <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{b.date}</td>
                    <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{b.time}</td>
                    <td style={tableStyles.td}>
                      <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ResidentHome