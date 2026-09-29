import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, EmptyState, bookingSubject, bookingOptions, tableStyles, inputStyle, selectStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function ApprovalsQueue() {
  const [requests, setRequests] = useState([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings?status=Pending')
      .then(({ data }) => setRequests(data))
      .catch(() => toast.error('Could not load pending bookings'))
      .finally(() => setLoading(false))
  }, [])

  const facilityOptions = bookingOptions(requests, (r) => r.facility)
  const userOptions = bookingOptions(requests, (r) => r.user)

  // Every request here is already Pending, so booking type stands in for the
  // status dropdown the all-bookings page has.
  const q = query.trim().toLowerCase()
  const filtered = requests.filter((r) => {
    const type = r.bookingType === 'Equipment' ? 'Equipment' : 'Facility'
    if (typeFilter !== 'All' && type !== typeFilter) return false
    if (facilityFilter !== 'all' && r.facility?._id !== facilityFilter) return false
    if (userFilter !== 'all' && r.user?._id !== userFilter) return false
    if (!q) return true
    const { primary, secondary } = bookingSubject(r)
    return `${r.facility?.name ?? ''} ${primary} ${secondary ?? ''} ${r.user?.name ?? ''} ${type} ${r.purpose ?? ''}`
      .toLowerCase()
      .includes(q)
  })

  const respond = async (id, action) => {
    try {
      await api.post(`/bookings/${id}/${action}`, { status: action === 'approve' ? 'Approved' : 'Rejected' })
      setRequests((prev) => prev.filter((r) => r._id !== id))
      toast.success(`Booking ${action}d successfully`)
    } catch {
      toast.error(`Could not ${action} booking`)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader title="Approvals queue" description="Review and respond to pending booking requests." />

      <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        {/* minWidth: 0 lets the input shrink below its content width rather
                than pushing the row wider. */}
        <input
          type="text"
          placeholder="Search pending requests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option>All</option>
            <option>Facility</option>
            <option>Equipment</option>
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

      {/* Same height cap as the table pages, so the queue scrolls inside its card. */}
      <Card style={{ padding: 'var(--space-md)', ...tableStyles.scrollWrapper('calc(100vh - 230px)') }}>
        {requests.length === 0 && <EmptyState message="No pending requests — you're all caught up." />}
        {requests.length > 0 && filtered.length === 0 && (
          <EmptyState message="No pending requests match your search." />
        )}

        {filtered.map((r) => (
          <div key={r._id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)',
            padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: '200px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
                fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)',
              }}>
                <StatusBadge
                  label={r.bookingType === 'Equipment' ? 'Equipment' : 'Facility'}
                  tone={r.bookingType === 'Equipment' ? 'info' : 'neutral'}
                />
                {bookingSubject(r).primary}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {r.user?.name ?? 'Unknown user'} · {new Date(r.startTime).toLocaleString()}
                {bookingSubject(r).secondary ? ` · ${bookingSubject(r).secondary}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Button variant="secondary" onClick={() => respond(r._id, 'reject')}>Reject</Button>
              <Button variant="primary" onClick={() => respond(r._id, 'approve')}>Approve</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

export default ApprovalsQueue
