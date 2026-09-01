import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatCard, StatusBadge, bookingSubject } from '../../components/ui'
import { ChartCard, BookingTrendChart, StatusDonut } from '../../components/charts'
import toast from 'react-hot-toast'

const APPROVAL_TONE = { Pending: 'warning', Approved: 'success', Rejected: 'danger', Cancelled: 'neutral' }
const ISSUE_TONE = { 'In Progress': 'warning', Pending: 'danger', Completed: 'success', Cancelled: 'neutral' }

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [recentApprovals, setRecentApprovals] = useState([])
  const [openIssues, setOpenIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/bookings?status=Pending'),
      api.get('/maintenance'),
    ])
      .then(([dashRes, bookingsRes, maintenanceRes]) => {
        const d = dashRes.data
        setStats([
          { label: 'Pending approvals', value: d.pendingBookings, tone: 'warning' },
          { label: 'Facilities', value: d.facilities, tone: 'info' },
          { label: 'Active maintenance', value: d.activeMaintenance, tone: 'danger' },
          { label: 'Total users', value: d.users, tone: 'neutral' },
        ])
        setCharts({
          bookingTrend: d.bookingTrend ?? [],
          maintenanceByStatus: d.maintenanceByStatus ?? [],
          maintenanceByPriority: d.maintenanceByPriority ?? [],
        })
        setRecentApprovals(bookingsRes.data.slice(0, 5))
        setOpenIssues(
          maintenanceRes.data.filter((t) => t.status === 'Pending' || t.status === 'In Progress').slice(0, 5)
        )
      })
      .catch(() => toast.error('Could not load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const noTrend = charts?.bookingTrend.every((d) => d.facility === 0 && d.equipment === 0)
  const noMaintenance = charts?.maintenanceByStatus.every((d) => d.value === 0)

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading dashboard...</p>

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of today's activity across CoastLink facilities." />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-md)', marginBottom: 'var(--space-xl)',
      }}>
        {stats && stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {charts && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
        }}>
          <ChartCard
            title="Booking requests"
            subtitle="Requests received per day over the last 14 days"
            empty={noTrend ? 'No bookings requested in the last 14 days.' : null}
          >
            <BookingTrendChart data={charts.bookingTrend} />
          </ChartCard>

          <ChartCard
            title="Maintenance by status"
            subtitle="Every reported issue, by where it sits now"
            empty={noMaintenance ? 'No maintenance issues reported yet.' : null}
          >
            <StatusDonut data={charts.maintenanceByStatus} />
          </ChartCard>

          <ChartCard
            title="Maintenance by priority"
            subtitle="How urgent the reported issues are"
            empty={noMaintenance ? 'No maintenance issues reported yet.' : null}
          >
            <StatusDonut data={charts.maintenanceByPriority} />
          </ChartCard>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Pending approvals
          </h2>
          {recentApprovals.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No pending approvals.</p>
          ) : recentApprovals.map((a) => (
            <div key={a._id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
            }}>
              <div>
                <div style={{ color: 'var(--color-text)' }}>{bookingSubject(a).primary}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{a.user?.name ?? 'Unknown user'}</div>
              </div>
              <StatusBadge label={a.status} tone={APPROVAL_TONE[a.status]} />
            </div>
          ))}
        </Card>

        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Open maintenance
          </h2>
          {openIssues.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No open issues.</p>
          ) : openIssues.map((i) => (
            <div key={i._id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
            }}>
              <div>
                <div style={{ color: 'var(--color-text)' }}>{i.facility?.name ?? 'Unknown facility'}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{i.description}</div>
              </div>
              <StatusBadge label={i.status} tone={ISSUE_TONE[i.status]} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
