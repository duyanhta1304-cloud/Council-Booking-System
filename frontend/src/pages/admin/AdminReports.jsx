import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card } from '../../components/ui'
import { ChartCard, RankedBarChart, BookingHeatmap, CHART_COLORS } from '../../components/charts'
import toast from 'react-hot-toast'

const RANGES = [7, 30, 90]

function toMonthInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function rangeButtonStyle(active) {
  return {
    padding: '6px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
    border: '1px solid var(--color-border-strong)', fontSize: 'var(--font-size-sm)',
    backgroundColor: active ? 'var(--color-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text)',
    transition: 'all var(--transition-fast)',
  }
}

function UtilizationReports() {
  const [range, setRange] = useState(30)
  const [month, setMonth] = useState(() => toMonthInputValue(new Date()))
  const [utilisation, setUtilisation] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [heatmap, setHeatmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heatmapLoading, setHeatmapLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.get(`/reports/utilisation?range=${range}`),
      api.get(`/reports/maintenance-time?range=${range}`),
    ])
      .then(([utilRes, maintRes]) => {
        if (cancelled) return
        setUtilisation(utilRes.data.utilisation || [])
        setMaintenance(maintRes.data.maintenance || [])
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Could not load reports')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [range])

  useEffect(() => {
    let cancelled = false

    api.get(`/reports/booking-heatmap?month=${month}`)
      .then(({ data }) => {
        if (!cancelled) setHeatmap(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load booking heatmap')
      })
      .finally(() => {
        if (!cancelled) setHeatmapLoading(false)
      })

    return () => { cancelled = true }
  }, [month])

  // Recharts wants a flat {name, value}; the API speaks in its own terms.
  const utilisationData = utilisation.map((u) => ({ name: u.facility, value: u.rate, booked: u.booked }))
  const maintenanceData = maintenance.map((m) => ({ name: m.facility, value: m.hours, tasks: m.tasks, open: m.open }))

  const totalMaintenanceHours = maintenance.reduce((sum, m) => sum + m.hours, 0)
  const stillOpen = maintenance.reduce((sum, m) => sum + m.open, 0)

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Booking demand and maintenance load across Council facilities."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} style={rangeButtonStyle(range === r)}>
                {r}d
              </button>
            ))}
          </div>
        }
      />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
      }}>
        <ChartCard
          title="Facility utilisation"
          subtitle={`Share of available hours booked over the last ${range} days`}
          height={Math.max(220, utilisationData.length * 38)}
          empty={loading ? 'Loading…' : utilisationData.length === 0 ? 'No utilisation data for this period.' : null}
        >
          <RankedBarChart data={utilisationData} unit="%" color={CHART_COLORS.primary} />
        </ChartCard>

        <ChartCard
          title="Time under maintenance"
          subtitle={`Hours each facility spent with an open issue in the last ${range} days`}
          height={Math.max(220, maintenanceData.length * 38)}
          empty={loading ? 'Loading…' : maintenanceData.length === 0 ? 'No maintenance recorded for this period.' : null}
        >
          <RankedBarChart data={maintenanceData} unit="h" color={CHART_COLORS.secondary} />
        </ChartCard>
      </div>

      {!loading && maintenanceData.length > 0 && (
        <Card style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            <strong style={{ color: 'var(--color-text)' }}>{totalMaintenanceHours}h</strong> of maintenance
            across {maintenance.length} {maintenance.length === 1 ? 'facility' : 'facilities'} in the last {range} days
            {stillOpen > 0 && (
              <> — <strong style={{ color: 'var(--color-danger-text)' }}>{stillOpen}</strong> still open, and counting.</>
            )}
          </p>
        </Card>
      )}

      <Card>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-md)',
        }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: 0 }}>
              When people book
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              Booked hours by weekday and time of day. Darker means busier.
            </p>
          </div>
          <input
            type="month"
            value={month}
            max={toMonthInputValue(new Date())}
            onChange={(e) => { setHeatmapLoading(true); setMonth(e.target.value) }}
            style={{
              padding: '6px 10px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)',
              fontFamily: 'inherit', color: 'var(--color-text)',
            }}
          />
        </div>

        {heatmapLoading ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading…</p>
        ) : !heatmap || heatmap.total === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No bookings in this month.
          </p>
        ) : (
          <BookingHeatmap cells={heatmap.cells} peak={heatmap.peak} />
        )}
      </Card>

      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
        Utilisation assumes 8 available hours/day per facility. Maintenance time counts an issue from when it was
        reported until it was completed, or until now if it is still open.
      </p>
    </div>
  )
}

export default UtilizationReports
