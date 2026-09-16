import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatCard, StatusBadge, Button, bookingSubject, inputStyle } from '../../components/ui'
import { ChartCard, BookingTrendChart, StatusDonut } from '../../components/charts'
import toast from 'react-hot-toast'

const ISSUE_TONE = { 'In Progress': 'warning', Pending: 'danger', Completed: 'success', Cancelled: 'neutral' }
const PRIORITY_TONE = { High: 'danger', Medium: 'warning', Low: 'success' }

// Same walk as the maintenance board's "Move →": Pending → In Progress → Completed.
const NEXT_STATUS = { Pending: 'In Progress', 'In Progress': 'Completed' }
const NEXT_LABEL = { Pending: 'Start', 'In Progress': 'Complete' }

// The page fills the viewport exactly — main's padding is the only thing above
// and below it — so the bottom cards can take the leftover height and scroll
// inside themselves instead of pushing the page into a scrollbar.
const PAGE_HEIGHT = 'calc(100vh - var(--space-lg) * 2)'

// Below this the bottom row stops shrinking; on a very short window the page
// scrolls rather than squashing the lists into nothing.
const LIST_ROW_MIN_HEIGHT = '160px'

const rowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-sm)',
  padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
}

// Cuts a single line of text short with "…"; the parent must allow shrinking (minWidth: 0).
const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }

// Button has no disabled styling of its own, so a row waiting on its request dims here.
const smallButton = (isBusy) => ({
  padding: '4px 10px', fontSize: 'var(--font-size-xs)',
  opacity: isBusy ? 0.5 : 1, cursor: isBusy ? 'default' : 'pointer',
})

function formatSlot(booking) {
  const start = new Date(booking.startTime)
  const end = new Date(booking.endTime)
  const time = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${start.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${time(start)}–${time(end)}`
}

function ListCard({ title, count, children }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-md)', height: '100%', minHeight: 0, boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-sm)' }}>
        {title}{' '}
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' }}>({count})</span>
      </h2>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
        {children}
      </div>
    </Card>
  )
}

function Dashboard() {
  const [counts, setCounts] = useState(null)
  const [charts, setCharts] = useState(null)
  const [pendingBookings, setPendingBookings] = useState([])
  const [openIssues, setOpenIssues] = useState([])
  const [staff, setStaff] = useState([])
  // Rows with a request in flight, so a double-click can't send it twice.
  const [busy, setBusy] = useState(() => new Set())
  // The maintenance row whose Cancel/Start buttons are showing.
  const [activeIssue, setActiveIssue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/bookings?status=Pending'),
      api.get('/maintenance'),
      api.get('/admin/staff'),
    ])
      .then(([dashRes, bookingsRes, maintenanceRes, staffRes]) => {
        const d = dashRes.data
        setCounts({
          pendingBookings: d.pendingBookings,
          facilities: d.facilities,
          activeMaintenance: d.activeMaintenance,
          users: d.users,
        })
        setCharts({
          bookingTrend: d.bookingTrend ?? [],
          maintenanceByStatus: d.maintenanceByStatus ?? [],
          maintenanceByPriority: d.maintenanceByPriority ?? [],
        })
        setPendingBookings(
          [...bookingsRes.data].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        )
        setOpenIssues(
          maintenanceRes.data.filter((t) => t.status === 'Pending' || t.status === 'In Progress')
        )
        setStaff(staffRes.data)
      })
      .catch(() => toast.error('Could not load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const withBusy = async (id, fn) => {
    setBusy((prev) => new Set(prev).add(id))
    try {
      await fn()
    } finally {
      setBusy((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const decideBooking = (id, decision) => withBusy(id, async () => {
    try {
      await api.post(`/bookings/${id}/${decision === 'Approved' ? 'approve' : 'reject'}`)
      setPendingBookings((prev) => prev.filter((b) => b._id !== id))
      setCounts((prev) => ({ ...prev, pendingBookings: Math.max(prev.pendingBookings - 1, 0) }))
      toast.success(`Booking ${decision.toLowerCase()}`)
    } catch {
      toast.error('Could not update booking')
    }
  })

  const updateIssue = (id, changes, message) => withBusy(id, async () => {
    try {
      const { data } = await api.patch(`/maintenance/${id}`, changes)
      const stillOpen = data.status === 'Pending' || data.status === 'In Progress'
      setOpenIssues((prev) => (stillOpen ? prev.map((t) => (t._id === id ? data : t)) : prev.filter((t) => t._id !== id)))
      if (!stillOpen) setCounts((prev) => ({ ...prev, activeMaintenance: Math.max(prev.activeMaintenance - 1, 0) }))
      toast.success(message(data))
    } catch {
      toast.error('Could not update task')
    }
  })

  const cancelIssue = (id) => {
    if (!window.confirm('Cancel this maintenance task? It will be marked Cancelled, not deleted.')) return
    updateIssue(id, { status: 'Cancelled' }, () => 'Maintenance task cancelled')
  }

  const noTrend = charts?.bookingTrend.every((d) => d.facility === 0 && d.equipment === 0)
  const noMaintenance = charts?.maintenanceByStatus.every((d) => d.value === 0)

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading dashboard...</p>

  const stats = counts && [
    { label: 'Pending approvals', value: counts.pendingBookings, tone: 'warning' },
    { label: 'Facilities', value: counts.facilities, tone: 'info' },
    { label: 'Active maintenance', value: counts.activeMaintenance, tone: 'danger' },
    { label: 'Total users', value: counts.users, tone: 'neutral' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: PAGE_HEIGHT }}>
      <PageHeader title="Dashboard" description="Overview of today's activity across CoastLink facilities." />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', flexShrink: 0,
      }}>
        {stats && stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {charts && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', flexShrink: 0,
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

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--space-sm)', flex: 1, minHeight: LIST_ROW_MIN_HEIGHT,
      }}>
        <ListCard title="Pending approvals" count={pendingBookings.length}>
          {pendingBookings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No pending approvals.</p>
          ) : pendingBookings.map((b) => (
            <div key={b._id} style={rowStyle}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'var(--color-text)' }}>{bookingSubject(b).primary}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                  {b.user?.name ?? 'Unknown user'} · {formatSlot(b)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', flexShrink: 0 }}>
                <Button variant="secondary" style={smallButton(busy.has(b._id))} disabled={busy.has(b._id)} onClick={() => decideBooking(b._id, 'Rejected')}>
                  Reject
                </Button>
                <Button variant="primary" style={smallButton(busy.has(b._id))} disabled={busy.has(b._id)} onClick={() => decideBooking(b._id, 'Approved')}>
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </ListCard>

        <ListCard title="Open maintenance" count={openIssues.length}>
          {openIssues.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No open issues.</p>
          ) : openIssues.map((i) => (
            <div
              key={i._id}
              style={{ ...rowStyle, flexWrap: 'wrap', position: 'relative' }}
              onMouseEnter={() => setActiveIssue(i._id)}
              onMouseLeave={() => setActiveIssue((prev) => (prev === i._id ? null : prev))}
              onFocus={() => setActiveIssue(i._id)}
            >
              <div style={{ minWidth: 0, flex: '1 1 160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-text)', maxWidth: '150px', textOverflow: 'ellipsis' }}>
                  <span title={i.facility?.name} style={ellipsis}>{i.facility?.name ?? 'Unknown facility'}</span>
                  <span style={{ flexShrink: 0 }}>
                    <StatusBadge label={i.priority ?? 'Medium'} tone={PRIORITY_TONE[i.priority ?? 'Medium']} />
                  </span>
                </div>
                <div title={i.description} style={{ ...ellipsis, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                  {i.description}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexShrink: 0 }}>
                <StatusBadge label={i.status} tone={ISSUE_TONE[i.status]} />
                <select
                  value={i.assignedTo?._id ?? ''}
                  disabled={busy.has(i._id)}
                  onChange={(e) => updateIssue(
                    i._id,
                    { assignedTo: e.target.value || null },
                    (data) => (data.assignedTo ? `Assigned to ${data.assignedTo.name}` : 'Assignment cleared'),
                  )}
                  style={{
                    ...inputStyle, width: 'auto', padding: '4px 6px', fontSize: 'var(--font-size-xs)',
                    color: i.assignedTo ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                {/* Floats over the middle of the row, so it takes no layout space.
                    Faded rather than unmounted so it can animate in and out;
                    pointerEvents keeps the invisible buttons from catching clicks. */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', zIndex: 1,
                  display: 'flex', gap: 'var(--space-xs)', padding: '4px',
                  backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  transition: 'opacity 150ms ease, transform 150ms ease',
                  ...(activeIssue === i._id || busy.has(i._id)
                    ? { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', pointerEvents: 'auto' }
                    : { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)', pointerEvents: 'none' }),
                }}>
                  <Button variant="secondary" style={smallButton(busy.has(i._id))} disabled={busy.has(i._id)} onClick={() => cancelIssue(i._id)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary" style={smallButton(busy.has(i._id))} disabled={busy.has(i._id)}
                    onClick={() => updateIssue(i._id, { status: NEXT_STATUS[i.status] }, () => `Moved to ${NEXT_STATUS[i.status]}`)}
                  >
                    {NEXT_LABEL[i.status]}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </ListCard>
      </div >
    </div >
  )
}

export default Dashboard
