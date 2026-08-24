import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, tableStyles, inputStyle, buttonStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function priorityTone(priority) {
  if (priority === 'High') return 'danger'
  if (priority === 'Medium') return 'warning'
  return 'default'
}

function statusTone(status) {
  if (status === 'Completed') return 'success'
  if (status === 'In Progress') return 'warning'
  return 'default'
}

function StaffMaintenance() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.get('/staff/maintenance-tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error('Could not load maintenance tasks'))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id, newStatus) {
    try {
      const { data } = await api.patch(`/maintenance/${id}`, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)))
      toast.success(`Task marked as ${newStatus}`)
    } catch {
      toast.error('Could not update task status')
    }
  }

  const filtered = tasks.filter((t) =>
    `${t.facility?.name} ${t.description} ${t.priority} ${t.status}`.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Tasks assigned to you. Update status as work progresses."
        action={
          <input
            type="text"
            placeholder="Search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
        }
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Facility</th>
                <th style={tableStyles.th}>Issue</th>
                <th style={tableStyles.th}>Priority</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tableStyles.td, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No tasks assigned to you.
                  </td>
                </tr>
              ) : filtered.map((t) => (
                <tr key={t._id}>
                  <td style={tableStyles.td}>{t.facility?.name ?? '—'}</td>
                  <td style={tableStyles.td}>{t.description}</td>
                  <td style={tableStyles.td}>
                    <Badge tone={priorityTone(t.priority)}>{t.priority ?? 'Medium'}</Badge>
                  </td>
                  <td style={tableStyles.td}>
                    <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  </td>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                      {t.status === 'Pending' && (
                        <button style={buttonStyle} onClick={() => updateStatus(t._id, 'In Progress')}>
                          Start
                        </button>
                      )}
                      {(t.status === 'Pending' || t.status === 'In Progress') && (
                        <button
                          style={{ ...buttonStyle, backgroundColor: 'var(--color-secondary)' }}
                          onClick={() => updateStatus(t._id, 'Completed')}
                        >
                          Complete
                        </button>
                      )}
                    </div>
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

export default StaffMaintenance