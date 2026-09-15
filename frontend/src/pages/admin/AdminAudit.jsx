import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, tableStyles } from '../../components/ui'
import toast from 'react-hot-toast'

function AuditLog() {
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit-log')
      .then(({ data }) => setLogs(data))
      .catch(() => toast.error('Could not load audit log'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter((e) =>
    `${e.principal?.name ?? ''} ${e.action} ${e.details ?? ''}`.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return <p>Loading...</p>

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
        <div style={tableStyles.scrollWrapper('calc(100vh - 110px)')}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.stickyTh}>Timestamp</th>
                <th style={tableStyles.stickyTh}>User</th>
                <th style={tableStyles.stickyTh}>Action</th>
                <th style={tableStyles.stickyTh}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e._id}>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td style={tableStyles.td}>{e.principal?.name ?? '—'}</td>
                  <td style={tableStyles.td}>{e.action}</td>
                  <td style={tableStyles.td}>{e.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ padding: '16px', color: 'var(--color-text-muted)' }}>No log entries found.</p>}
        </div>
      </Card>
    </div>
  )
}

export default AuditLog
