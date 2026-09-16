import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, BookingSubject, tableStyles, buttonOutlineStyle, buttonDangerStyle } from '../../components/ui'
import toast from 'react-hot-toast'

const FILTERS = ['All', 'Upcoming', 'Pending', 'Past', 'Cancelled']

function statusTone(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled' || status === 'Rejected') return 'danger'
  return 'default'
}

function matchesFilter(booking, filter) {
  if (filter === 'All') return true
  if (filter === 'Upcoming') return booking.status === 'Approved' && new Date(booking.startTime) > new Date()
  if (filter === 'Pending') return booking.status === 'Pending'
  if (filter === 'Past') return booking.status === 'Approved' && new Date(booking.startTime) <= new Date()
  if (filter === 'Cancelled') return booking.status === 'Cancelled' || booking.status === 'Rejected'
  return true
}

function ResidentBookings() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/resident/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(id) {
    try {
      const { data } = await api.patch(`/bookings/${id}/cancel`)
      setBookings((prev) => prev.map((b) => (b._id === id ? data : b)))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Could not cancel booking')
    }
  }

  const filtered = bookings.filter((b) => matchesFilter(b, filter))

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader title="My bookings" description="View, track and cancel your facility and equipment bookings." />

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
        <div style={tableStyles.scrollWrapper('calc(100vh - 170px)')}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.stickyTh}>Type</th>
                <th style={tableStyles.stickyTh}>Booked</th>
                <th style={tableStyles.stickyTh}>Start Time</th>
                <th style={tableStyles.stickyTh}>End Time</th>
                <th style={tableStyles.stickyTh}>Status</th>
                <th style={tableStyles.stickyTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td style={tableStyles.td}>
                    <Badge>{b.bookingType === 'Equipment' ? 'Equipment' : 'Facility'}</Badge>
                  </td>
                  <td style={tableStyles.td}><BookingSubject booking={b} /></td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{new Date(b.startTime).toLocaleString()}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{new Date(b.endTime).toLocaleString()}</td>
                  <td style={tableStyles.td}>
                    <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                  </td>
                  <td style={tableStyles.td}>
                    {(b.status === 'Approved' || b.status === 'Pending') ? (
                      <button style={buttonDangerStyle} onClick={() => handleCancel(b._id)}>
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

          {filtered.length === 0 && (
            <div style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No bookings match this filter.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ResidentBookings