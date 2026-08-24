import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import api from '../../lib/axios'
import { useAuth } from '../../context/authContext'
import { PageHeader, Card, Badge, tableStyles, buttonStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function statusTone(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled' || status === 'Rejected') return 'danger'
  return 'default'
}

function ResidentHome() {
  const { user } = useAuth()
  const [upcomingBookings, setUpcomingBookings] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/resident/dashboard'),
      api.get('/closures'),
    ])
      .then(([dashRes, closuresRes]) => {
        setUpcomingBookings(dashRes.data.upcomingBookings || [])
        // Show closures as notices — only upcoming/active ones
        const now = new Date()
        const activeClosures = closuresRes.data.filter(
          (c) => new Date(c.endDate) >= now
        )
        setNotices(activeClosures)
      })
      .catch(() => toast.error('Could not load home data'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <PageHeader
        title={user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
        description="Here's what's coming up and what's new with Council facilities."
        action={
          <Link to="/resident/facilities" style={{ textDecoration: 'none' }}>
            <button style={buttonStyle}>Book a facility</button>
          </Link>
        }
      />

      {notices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
          {notices.map((n) => (
            <div key={n._id} style={{
              backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
              padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
            }}>
              ⚠️ <strong>{n.facility?.name}</strong> is closed from {formatDate(n.startDate)} to {formatDate(n.endDate)}: {n.reason}
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

        {upcomingBookings.length === 0 ? (
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
                {upcomingBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={tableStyles.td}>{b.facility?.name ?? '—'}</td>
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
        )}
      </Card>
    </div>
  )
}

export default ResidentHome