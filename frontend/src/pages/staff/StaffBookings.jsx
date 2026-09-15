import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, BookingSubject, bookingSubject, tableStyles, inputStyle } from '../../components/ui'
import toast from 'react-hot-toast'

const TYPE_FILTERS = ['All', 'Facility', 'Equipment']

function statusTone(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled' || status === 'Rejected') return 'danger'
  return 'default'
}

function typeOf(booking) {
  return booking.bookingType === 'Equipment' ? 'Equipment' : 'Facility'
}

function StaffBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    api.get('/staff/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  const filtered = bookings
    .filter((b) => typeFilter === 'All' || typeOf(b) === typeFilter)
    .filter((b) =>
      `${bookingSubject(b).primary} ${b.facility?.name} ${b.user?.name} ${b.status}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage facility and equipment bookings."
        action={
          <input
            type="text"
            placeholder="Search bookings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
        }
      />

      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
              backgroundColor: typeFilter === t ? 'var(--color-primary)' : 'var(--color-surface)',
              color: typeFilter === t ? 'var(--color-text-on-dark)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        {/* Extra offset for the type filter chips above the table. */}
        <div style={tableStyles.scrollWrapper('calc(100vh - 160px)')}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.stickyTh}>Type</th>
                <th style={tableStyles.stickyTh}>Booked</th>
                <th style={tableStyles.stickyTh}>Resident</th>
                <th style={tableStyles.stickyTh}>Date</th>
                <th style={tableStyles.stickyTh}>Time</th>
                <th style={tableStyles.stickyTh}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tableStyles.td, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : filtered.map((b) => (
                <tr key={b._id}>
                  <td style={tableStyles.td}>
                    <Badge>{typeOf(b)}</Badge>
                  </td>
                  <td style={tableStyles.td}><BookingSubject booking={b} /></td>
                  <td style={tableStyles.td}>{b.user?.name ?? '—'}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{formatDate(b.startTime)}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{formatTime(b.startTime)}</td>
                  <td style={tableStyles.td}>
                    <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default StaffBookings