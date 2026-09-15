import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, tableStyles } from '../../components/ui'
import toast from 'react-hot-toast'

const STATUS_TONE = { Approved: 'success', Pending: 'warning', Cancelled: 'neutral', Rejected: 'danger' }

function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter)

  const cancelBooking = async (id) => {
    try {
      const { data } = await api.patch(`/bookings/${id}`, { status: 'Cancelled' })
      setBookings((prev) => prev.map((b) => (b._id === id ? data : b)))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Could not cancel booking')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="All bookings"
        description="Every booking across all facilities, regardless of status."
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{
            padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)', color: 'var(--color-text)',
          }}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Cancelled</option>
            <option>Rejected</option>
          </select>
        }
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.scrollWrapper('calc(100vh - 110px)')}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.stickyTh}>Facility</th>
                <th style={tableStyles.stickyTh}>Requester</th>
                <th style={tableStyles.stickyTh}>Start Time</th>
                <th style={tableStyles.stickyTh}>Status</th>
                <th style={tableStyles.stickyTh}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td style={tableStyles.td}>{b.facility?.name ?? '—'}</td>
                  <td style={tableStyles.td}>{b.user?.name ?? '—'}</td>
                  <td style={tableStyles.td}>{new Date(b.startTime).toLocaleString()}</td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={b.status} tone={STATUS_TONE[b.status]} />
                  </td>
                  <td style={tableStyles.td}>
                    {b.status !== 'Cancelled' && b.status !== 'Rejected' && (
                      <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => cancelBooking(b._id)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ padding: '16px', color: 'var(--color-text-muted)' }}>No bookings found.</p>}
        </div>
      </Card>
    </div>
  )
}

export default AllBookings
