import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatCard, Badge, BookingSubject, tableStyles } from '../../components/ui'
import { ChartCard, GroupedBarChart, StatusDonut, CHART_COLORS } from '../../components/charts'
import toast from 'react-hot-toast'

const WEEK_SERIES = [
  { key: 'facility', label: 'Facility', color: CHART_COLORS.primary },
  { key: 'equipment', label: 'Equipment', color: CHART_COLORS.secondary },
]

function statusTone(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled' || status === 'Rejected') return 'danger'
  return 'default'
}

function StaffDashboard() {
  const [stats, setStats] = useState(null)
  const [todaysBookings, setTodaysBookings] = useState([])
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/dashboard')
      .then(({ data }) => {
        const s = data.stats || {}
        setStats([
          { label: "Today's bookings", value: s.todaysBookings ?? 0, tone: 'default' },
          { label: 'Pending maintenance', value: s.pendingMaintenance ?? 0, tone: 'warning' },
          { label: 'Overdue tasks', value: s.overdueTasks ?? 0, tone: 'danger' },
          { label: 'Completed this week', value: s.completedThisWeek ?? 0, tone: 'success' },
        ])
        setTodaysBookings(data.todaysBookings || [])
        setCharts({
          weekAhead: data.weekAhead ?? [],
          myTasksByStatus: data.myTasksByStatus ?? [],
        })
      })
      .catch(() => toast.error('Could not load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const noWeek = charts?.weekAhead.every((d) => d.facility === 0 && d.equipment === 0)
  const noTasks = charts?.myTasksByStatus.every((d) => d.value === 0)

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading dashboard...</p>

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick overview of today's bookings and outstanding tasks."
      />

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
        {stats && stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      {charts && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
        }}>
          <ChartCard
            title="The week ahead"
            subtitle="Bookings starting each day over the next 7 days"
            empty={noWeek ? 'Nothing booked in the next 7 days.' : null}
          >
            <GroupedBarChart data={charts.weekAhead} series={WEEK_SERIES} />
          </ChartCard>

          <ChartCard
            title="My maintenance tasks"
            subtitle="Everything assigned to you, by status"
            empty={noTasks ? 'No tasks assigned to you.' : null}
          >
            <StatusDonut data={charts.myTasksByStatus} />
          </ChartCard>
        </div>
      )}

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Today's bookings
          </h2>
        </div>
        {todaysBookings.length === 0 ? (
          <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No bookings today.
          </p>
        ) : (
          <div style={tableStyles.wrapper}>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>Time</th>
                  <th style={tableStyles.th}>Booked</th>
                  <th style={tableStyles.th}>Resident</th>
                  <th style={tableStyles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {todaysBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={tableStyles.td}>{formatTime(b.startTime)}</td>
                    <td style={tableStyles.td}><BookingSubject booking={b} /></td>
                    <td style={tableStyles.td}>{b.user?.name ?? '—'}</td>
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

export default StaffDashboard