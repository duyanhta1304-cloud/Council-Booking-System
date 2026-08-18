import { useState } from 'react'
import { PageHeader, Card, StatusBadge, Button, tableStyles } from '../../components/ui'

// TODO: replace with GET /api/bookings
const INITIAL_BOOKINGS = [
  { id: 1, facility: 'Community Hall A', requester: 'J. Tan', date: '20 Aug, 2:00 PM', status: 'Approved' },
  { id: 2, facility: 'Meeting Room D', requester: 'S. Ahmed', date: '23 Aug, 9:00 AM', status: 'Pending' },
  { id: 3, facility: 'Sports Court 1', requester: 'M. Lopez', date: '18 Aug, 4:00 PM', status: 'Cancelled' },
  { id: 4, facility: 'Community Hall C', requester: 'A. Wong', date: '25 Aug, 11:00 AM', status: 'Approved' },
]

const STATUS_TONE = { Approved: 'success', Pending: 'warning', Cancelled: 'neutral' }

function AllBookings() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [filter, setFilter] = useState('All')

  const filtered = bookings.filter((b) => filter === 'All' || b.status === filter)

  const cancelBooking = (id) => {
    // TODO: PATCH /api/bookings/:id { status: 'Cancelled' }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)))
  }

  return (
    <div>
      <PageHeader
        title="All bookings"
        description="Every booking across all facilities, regardless of status."
        action={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-family-base)',
            }}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Cancelled</option>
          </select>
        }
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Facility</th>
                <th style={tableStyles.th}>Requester</th>
                <th style={tableStyles.th}>Date</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={tableStyles.td}>{b.facility}</td>
                  <td style={tableStyles.td}>{b.requester}</td>
                  <td style={tableStyles.td}>{b.date}</td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={b.status} tone={STATUS_TONE[b.status]} />
                  </td>
                  <td style={tableStyles.td}>
                    {b.status !== 'Cancelled' && (
                      <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => cancelBooking(b.id)}>
                        Cancel
                      </Button>
                    )}
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

export default AllBookings
