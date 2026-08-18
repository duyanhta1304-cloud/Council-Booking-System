import { useState } from 'react'
import { PageHeader, Card, tableStyles } from '../../components/ui'

// TODO: replace with GET /api/audit-log
const LOG_ENTRIES = [
  { id: 1, timestamp: '17 Aug, 3:42 PM', user: 'S. Ahmed', action: 'Booking approved', target: 'Community Hall A' },
  { id: 2, timestamp: '17 Aug, 2:10 PM', user: 'J. Tan', action: 'Booking created', target: 'Meeting Room D' },
  { id: 3, timestamp: '16 Aug, 11:05 AM', user: 'D. Park', action: 'Closure scheduled', target: 'Sports Court 2' },
  { id: 4, timestamp: '15 Aug, 9:30 AM', user: 'M. Lopez', action: 'Booking cancelled', target: 'Sports Court 1' },
]

function AuditLog() {
  const [query, setQuery] = useState('')

  const filtered = LOG_ENTRIES.filter((e) =>
    `${e.user} ${e.action} ${e.target}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="A read-only record of key actions across the system."
        action={
          <input
            type="text"
            placeholder="Search log..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-base)', width: '220px',
            }}
          />
        }
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Timestamp</th>
                <th style={tableStyles.th}>User</th>
                <th style={tableStyles.th}>Action</th>
                <th style={tableStyles.th}>Target</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{e.timestamp}</td>
                  <td style={tableStyles.td}>{e.user}</td>
                  <td style={tableStyles.td}>{e.action}</td>
                  <td style={tableStyles.td}>{e.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AuditLog
