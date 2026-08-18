import { PageHeader, Card, StatCard, StatusBadge } from '../../components/ui'

// TODO: replace with GET /api/admin/dashboard
const STATS = [
  { label: 'Pending approvals', value: 5, tone: 'warning' },
  { label: "Today's bookings", value: 12, tone: 'info' },
  { label: 'Open maintenance', value: 3, tone: 'danger' },
  { label: 'Active closures', value: 1, tone: 'neutral' },
]

const RECENT_APPROVALS = [
  { id: 1, facility: 'Community Hall A', requester: 'J. Tan', status: 'Pending' },
  { id: 2, facility: 'Meeting Room D', requester: 'S. Ahmed', status: 'Approved' },
  { id: 3, facility: 'Sports Court 1', requester: 'M. Lopez', status: 'Pending' },
]

const OPEN_ISSUES = [
  { id: 1, facility: 'Sports Court 2', issue: 'Lighting fault', status: 'In progress' },
  { id: 2, facility: 'Meeting Room B', issue: 'AC not cooling', status: 'Reported' },
]

const APPROVAL_TONE = { Pending: 'warning', Approved: 'success' }
const ISSUE_TONE = { 'In progress': 'warning', Reported: 'danger' }

function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of today's activity across CoastLink facilities." />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-md)', marginBottom: 'var(--space-xl)',
      }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Recent approvals
          </h2>
          {RECENT_APPROVALS.map((a) => (
            <div key={a.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
            }}>
              <div>
                <div style={{ color: 'var(--color-text)' }}>{a.facility}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{a.requester}</div>
              </div>
              <StatusBadge label={a.status} tone={APPROVAL_TONE[a.status]} />
            </div>
          ))}
        </Card>

        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Open maintenance
          </h2>
          {OPEN_ISSUES.map((i) => (
            <div key={i.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
            }}>
              <div>
                <div style={{ color: 'var(--color-text)' }}>{i.facility}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{i.issue}</div>
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
