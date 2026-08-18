import { PageHeader, Card, StatCard, Badge, tableStyles } from '../../components/ui'

// TODO: replace with GET /api/staff/dashboard
const STATS = [
  { label: "Today's bookings", value: 8, tone: 'default' },
  { label: 'Pending maintenance', value: 3, tone: 'warning' },
  { label: 'Overdue tasks', value: 1, tone: 'danger' },
  { label: 'Completed this week', value: 12, tone: 'success' },
]

const UPCOMING_BOOKINGS = [
  { id: 1, time: '9:00 AM', facility: 'Community Hall A', resident: 'S. Ahmed', status: 'Confirmed' },
  { id: 2, time: '11:30 AM', facility: 'Meeting Room D', resident: 'J. Tan', status: 'Confirmed' },
  { id: 3, time: '2:00 PM', facility: 'Sports Court 2', resident: 'D. Park', status: 'Pending' },
]

function statusTone(status) {
  if (status === 'Confirmed') return 'success'
  if (status === 'Pending') return 'warning'
  return 'default'
}

function StaffDashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick overview of today's bookings and outstanding tasks."
      />

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
        {STATS.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Today's bookings
          </h2>
        </div>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Time</th>
                <th style={tableStyles.th}>Facility</th>
                <th style={tableStyles.th}>Resident</th>
                <th style={tableStyles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {UPCOMING_BOOKINGS.map((b) => (
                <tr key={b.id}>
                  <td style={tableStyles.td}>{b.time}</td>
                  <td style={tableStyles.td}>{b.facility}</td>
                  <td style={tableStyles.td}>{b.resident}</td>
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

export default StaffDashboard