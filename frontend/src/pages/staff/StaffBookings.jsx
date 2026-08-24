import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, tableStyles, inputStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function statusTone(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled' || status === 'Rejected') return 'danger'
  return 'default'
}

function StaffBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.get('/staff/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  const filtered = bookings.filter((b) =>
    `${b.facility?.name} ${b.user?.name} ${b.status}`.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage facility bookings."
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

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Facility</th>
                <th style={tableStyles.th}>Resident</th>
                <th style={tableStyles.th}>Date</th>
                <th style={tableStyles.th}>Time</th>
                <th style={tableStyles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tableStyles.td, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : filtered.map((b) => (
                <tr key={b._id}>
                  <td style={tableStyles.td}>{b.facility?.name ?? '—'}</td>
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