import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card } from '../../components/ui'
import toast from 'react-hot-toast'

const RANGES = [7, 30, 90]

function UtilizationReports() {
  const [range, setRange] = useState(30)
  const [utilisation, setUtilisation] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/reports/utilisation?range=${range}`)
      .then(({ data }) => setUtilisation(data.utilisation || []))
      .catch(() => toast.error('Could not load utilisation report'))
      .finally(() => setLoading(false))
  }, [range])

  return (
    <div>
      <PageHeader
        title="Utilization reports"
        description="Booking activity as a share of available time, per facility."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: '1px solid var(--color-border-strong)', fontSize: 'var(--font-size-sm)',
                  backgroundColor: range === r ? 'var(--color-primary)' : 'transparent',
                  color: range === r ? '#fff' : 'var(--color-text)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      />

      <Card>
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading...</p>
        ) : utilisation.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No utilisation data available for this period.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {utilisation.map((u) => (
              <div key={u.facility}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text)' }}>{u.facility}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{u.rate}% ({u.booked}h booked)</span>
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
        )}
      </Card>

      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
        Showing the last {range} days. Assumes 8 available hours/day per facility.
      </p>
    </div>
  )
}

export default UtilizationReports
