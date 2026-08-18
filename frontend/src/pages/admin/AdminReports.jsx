import { PageHeader, Card } from '../../components/ui'

// TODO: replace with GET /api/reports/utilisation?range=...
const UTILISATION = [
  { facility: 'Community Hall A', rate: 82 },
  { facility: 'Meeting Room B', rate: 45 },
  { facility: 'Sports Court 2', rate: 60 },
  { facility: 'Community Hall C', rate: 38 },
  { facility: 'Meeting Room D', rate: 70 },
]

function UtilizationReports() {
  return (
    <div>
      <PageHeader title="Utilization reports" description="Booking activity as a share of available time, per facility." />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {UTILISATION.map((u) => (
            <div key={u.facility}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text)' }}>{u.facility}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{u.rate}%</span>
              </div>
              <div style={{
                height: '10px', backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-full)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${u.rate}%`, height: '100%', backgroundColor: 'var(--color-secondary)',
                  borderRadius: 'var(--radius-full)', transition: 'width var(--transition-slow)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
        Showing the last 30 days.
        {/* TODO: add a real date-range picker once the backend supports it */}
      </p>
    </div>
  )
}

export default UtilizationReports
