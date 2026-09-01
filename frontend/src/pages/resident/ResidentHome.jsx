import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import api from '../../lib/axios'
import { useAuth } from '../../context/authContext'
import { PageHeader, Card, Badge, BookingSubject, tableStyles, buttonStyle } from '../../components/ui'
import { ChartCard, RankedBarChart, StatusDonut, CHART_COLORS } from '../../components/charts'
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
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  // Closure notices used to live here, but they were about facilities the
  // resident may never book. They now sit on the facility cards themselves,
  // where the reader is actually choosing.
  useEffect(() => {
    api.get('/resident/dashboard')
      .then(({ data }) => {
        setUpcomingBookings(data.upcomingBookings || [])
        setCharts({
          myHoursByFacility: data.myHoursByFacility ?? [],
          myBookingsByStatus: data.myBookingsByStatus ?? [],
        })
      })
      .catch(() => toast.error('Could not load home data'))
      .finally(() => setLoading(false))
  }, [])

  const noHours = charts?.myHoursByFacility.length === 0
  const noStatuses = charts?.myBookingsByStatus.every((d) => d.value === 0)

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

      {charts && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
        }}>
          <ChartCard
            title="Where you've booked"
            subtitle="Hours booked over the last 30 days"
            height={Math.max(180, charts.myHoursByFacility.length * 38)}
            empty={noHours ? "You haven't booked anything in the last 30 days." : null}
          >
            <RankedBarChart data={charts.myHoursByFacility} unit="h" color={CHART_COLORS.primary} />
          </ChartCard>

          <ChartCard
            title="Your requests"
            subtitle="How your last 30 days of requests went"
            empty={noStatuses ? 'No requests in the last 30 days.' : null}
          >
            <StatusDonut data={charts.myBookingsByStatus} />
          </ChartCard>
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
                  <th style={tableStyles.th}>Booked</th>
                  <th style={tableStyles.th}>Date</th>
                  <th style={tableStyles.th}>Time</th>
                  <th style={tableStyles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={tableStyles.td}><BookingSubject booking={b} /></td>
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