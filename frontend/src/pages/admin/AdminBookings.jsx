import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, bookingSubject, tableStyles, inputStyle, selectStyle } from '../../components/ui'
import toast from 'react-hot-toast'

const STATUS_TONE = { Approved: 'success', Pending: 'warning', Cancelled: 'neutral', Rejected: 'danger' }

// The facility and requester dropdowns list what the bookings actually contain,
// so neither needs its own request.
function optionsFrom(bookings, pick) {
  const byId = new Map()
  for (const b of bookings) {
    const item = pick(b)
    if (item?._id) byId.set(item._id, item.name)
  }
  return [...byId].sort((a, b) => a[1].localeCompare(b[1]))
}

function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const facilityOptions = optionsFrom(bookings, (b) => b.facility)
  const userOptions = optionsFrom(bookings, (b) => b.user)

  const q = query.trim().toLowerCase()
  const filtered = bookings.filter((b) => {
    if (filter !== 'All' && b.status !== filter) return false
    if (facilityFilter !== 'all' && b.facility?._id !== facilityFilter) return false
    if (userFilter !== 'all' && b.user?._id !== userFilter) return false
    if (!q) return true
    const { primary, secondary } = bookingSubject(b)
    return `${b.facility?.name ?? ''} ${primary} ${secondary ?? ''} ${b.user?.name ?? ''} ${b.status}`
      .toLowerCase()
      .includes(q)
  })

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
      />

      <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        {/* minWidth: 0 lets the input shrink below its content width rather
                than pushing the row wider. */}
        <input
          type="text"
          placeholder="Search bookings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Cancelled</option>
            <option>Rejected</option>
          </select>
          <select value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)} style={selectStyle}>
            <option value="all">All facilities</option>
            {facilityOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} style={selectStyle}>
            <option value="all">All requesters</option>
            {userOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.scrollWrapper('calc(100vh - 230px)')}>
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
