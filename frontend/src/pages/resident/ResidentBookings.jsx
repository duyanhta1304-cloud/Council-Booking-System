import { useState } from 'react'
import { PageHeader, Card, Badge, tableStyles, buttonOutlineStyle, buttonDangerStyle } from '../../components/ui'

// TODO: replace with GET /api/resident/bookings
const INITIAL_BOOKINGS = [
  { id: 1, facility: 'Community Hall A', date: '20 Aug', time: '2:00 PM', status: 'Confirmed', affectedByClosure: false },
  { id: 2, facility: 'Sports Court 1', date: '24 Aug', time: '10:00 AM', status: 'Pending', affectedByClosure: false },
  { id: 3, facility: 'Sports Court 2', date: '22 Aug', time: '4:00 PM', status: 'Confirmed', affectedByClosure: true },
  { id: 4, facility: 'Meeting Room D', date: '10 Aug', time: '9:00 AM', status: 'Completed', affectedByClosure: false },
  { id: 5, facility: 'BBQ Pavilion', date: '5 Aug', time: '1:00 PM', status: 'Cancelled', affectedByClosure: false },
]

const FILTERS = ['All', 'Upcoming', 'Pending', 'Past', 'Cancelled']

function statusTone(status) {
  if (status === 'Confirmed') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled') return 'danger'
  return 'default'
}

function matchesFilter(booking, filter) {
  if (filter === 'All') return true
  if (filter === 'Upcoming') return booking.status === 'Confirmed'
  if (filter === 'Pending') return booking.status === 'Pending'
  if (filter === 'Past') return booking.status === 'Completed'
  if (filter === 'Cancelled') return booking.status === 'Cancelled'
  return true
}

function ResidentBookings() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [filter, setFilter] = useState('All')

  function handleCancel(id) {
    // TODO: PATCH /api/bookings/:id/cancel
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)))
  }

  const filtered = bookings.filter((b) => matchesFilter(b, filter))

  return (
    <div>
      <PageHeader
        title="My bookings"
        description="View, track and cancel your facility bookings."
      />

      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
              backgroundColor: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? 'var(--color-text-on-dark)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Facility</th>
                <th style={tableStyles.th}>Date</th>
                <th style={tableStyles.th}>Time</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={tableStyles.td}>
                    {b.facility}
                    {b.affectedByClosure && (
                      <div style={{ marginTop: '4px' }}>
                        <Badge tone="warning">Affected by closure</Badge>
                      </div>
                    )}
                  </td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{b.date}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{b.time}</td>
                  <td style={tableStyles.td}>
                    <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                  </td>
                  <td style={tableStyles.td}>
                    {(b.status === 'Confirmed' || b.status === 'Pending') ? (
                      <button style={buttonDangerStyle} onClick={() => handleCancel(b.id)}>
                        Cancel
                      </button>
                    ) : (
                      <button style={{ ...buttonOutlineStyle, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No bookings match this filter.
          </div>
        )}
      </Card>
    </div>
  )
}

export default ResidentBookings