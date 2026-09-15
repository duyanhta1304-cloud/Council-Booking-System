import { Fragment } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Card } from './ui'

// Recharts writes these into SVG presentation attributes, where a var()
// reference resolves inconsistently across browsers — so the chart palette
// repeats the literal values from global.css rather than referencing tokens.
// Keep these in step with the --color-* block if the brand ever changes.
export const CHART_COLORS = {
  primary: '#0d3b4f',
  secondary: '#a8752a',
  success: '#3e8e5b',
  warning: '#d9a441',
  danger: '#c1443d',
  muted: '#7c8580',
  grid: '#c9c4b4',
  text: '#4d5852',
}

// Ordered so adjacent categories stay distinguishable at a glance.
export const CATEGORICAL = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.muted,
]

// Status names carry meaning, so they get a fixed colour everywhere rather
// than whatever position they happen to fall in.
export const STATUS_COLORS = {
  Pending: CHART_COLORS.warning,
  'In Progress': CHART_COLORS.secondary,
  Approved: CHART_COLORS.success,
  Completed: CHART_COLORS.success,
  Rejected: CHART_COLORS.danger,
  Cancelled: CHART_COLORS.muted,
  High: CHART_COLORS.danger,
  Medium: CHART_COLORS.warning,
  Low: CHART_COLORS.success,
}

const axisProps = {
  stroke: CHART_COLORS.grid,
  tick: { fill: CHART_COLORS.text, fontSize: 11 },
  tickLine: false,
}

const tooltipProps = {
  contentStyle: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
  },
  cursor: { fill: 'rgba(13, 59, 79, 0.06)' },
}

// `action` sits top-right beside the title, for a control like a "View all" toggle.
export function ChartCard({ title, subtitle, children, height = 240, empty, action }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: 0 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div style={{ height, marginTop: 'var(--space-md)' }}>
        {empty ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
          }}>
            {empty}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

// A stacked day-by-day count of bookings, split by what was booked.
export function BookingTrendChart({ data }) {
  return (
    <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
      <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
      <YAxis allowDecimals={false} {...axisProps} />
      <Tooltip {...tooltipProps} cursor={{ stroke: CHART_COLORS.grid }} />
      <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
      <Line type="monotone" dataKey="facility" name="Facility" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="equipment" name="Equipment" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={false} />
    </LineChart>
  )
}

export function GroupedBarChart({ data, series }) {
  return (
    <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
      <XAxis dataKey="date" {...axisProps} />
      <YAxis allowDecimals={false} {...axisProps} />
      <Tooltip {...tooltipProps} />
      <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
      {series.map((s) => (
        <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} />
      ))}
    </BarChart>
  )
}

// Tooltip body for charts that explain a value rather than just repeat it:
// `lines` turns the hovered datum into a list of text rows under its name.
function DetailTooltip({ active, payload, lines }) {
  if (!active || !payload?.length) return null
  const datum = payload[0].payload

  return (
    <div style={{ ...tooltipProps.contentStyle, padding: '8px 10px', maxWidth: '260px' }}>
      <div style={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
        {datum.name}
      </div>
      {lines(datum).map((line, i) => (
        <div key={i} style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
          {line}
        </div>
      ))}
    </div>
  )
}

// Horizontal bars — the right shape when the category is a name of unpredictable
// length, since the label gets a whole row instead of a cramped tick.
// `tooltipLines` (optional): datum => string[] to show the working on hover.
export function RankedBarChart({ data, dataKey = 'value', unit = '', color = CHART_COLORS.primary, tooltipLines }) {
  return (
    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
      <XAxis type="number" allowDecimals={false} {...axisProps} />
      <YAxis type="category" dataKey="name" width={120} {...axisProps} />
      {tooltipLines ? (
        <Tooltip cursor={tooltipProps.cursor} content={<DetailTooltip lines={tooltipLines} />} />
      ) : (
        <Tooltip {...tooltipProps} formatter={(value) => [`${value}${unit}`, '']} />
      )}
      <Bar dataKey={dataKey} fill={color} radius={[0, 3, 3, 0]} />
    </BarChart>
  )
}

export function StatusDonut({ data, colors = STATUS_COLORS }) {
  const withValues = data.filter((d) => d.value > 0)

  return (
    <PieChart>
      <Pie
        data={withValues}
        dataKey="value"
        nameKey="name"
        innerRadius="55%"
        outerRadius="80%"
        paddingAngle={2}
        stroke="none"
      >
        {withValues.map((entry, i) => (
          <Cell key={entry.name} fill={colors[entry.name] ?? CATEGORICAL[i % CATEGORICAL.length]} />
        ))}
      </Pie>
      <Tooltip {...tooltipProps} cursor={false} />
      <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
    </PieChart>
  )
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Not a recharts chart — a plain CSS grid, because a heatmap is a table of
// coloured cells and recharts has no primitive for one.
export function BookingHeatmap({ cells, peak, hours = [8, 20] }) {
  const [openHour, closeHour] = hours
  const shown = Array.from({ length: closeHour - openHour }, (_, i) => openHour + i)

  // Zero stays as the page background so only real demand carries colour.
  const shade = (count) => {
    if (!count) return 'var(--color-bg)'
    const intensity = 0.15 + 0.85 * (count / Math.max(peak, 1))
    return `rgba(13, 59, 79, ${intensity.toFixed(2)})`
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `44px repeat(${shown.length}, minmax(26px, 1fr))`,
        gap: '2px',
        minWidth: '520px',
      }}>
        <div />
        {shown.map((hour) => (
          <div key={hour} style={{
            fontSize: '10px', fontFamily: 'var(--font-family-mono)',
            color: 'var(--color-text-muted)', textAlign: 'center',
          }}>
            {`${String(hour).padStart(2, '0')}00`}
          </div>
        ))}

        {WEEKDAYS.map((day, dayIndex) => (
          <Fragment key={day}>
            <div style={{
              fontSize: '11px', color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center',
            }}>
              {day}
            </div>
            {shown.map((hour) => {
              const count = cells?.[dayIndex]?.[hour] ?? 0
              return (
                <div
                  key={hour}
                  title={`${day} ${String(hour).padStart(2, '0')}:00 — ${count} booked hour${count === 1 ? '' : 's'}`}
                  style={{
                    aspectRatio: '4 / 1', borderRadius: '3px', backgroundColor: shade(count),
                    border: '1px solid var(--color-border)',
                  }}
                />
              )
            })}
          </Fragment>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
      }}>
        <span>Quiet</span>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => (
          <span key={step} style={{
            width: '18px', height: '10px', borderRadius: '2px',
            border: '1px solid var(--color-border)',
            backgroundColor: shade(step * peak),
          }} />
        ))}
        <span>Busy (peak {peak})</span>
      </div>
    </div>
  )
}
