import { useState } from 'react'
import { PageHeader, Card, Badge, tableStyles, inputStyle, buttonStyle } from '../../components/ui'

// TODO: replace with GET /api/staff/maintenance-tasks
const INITIAL_TASKS = [
  { id: 1, facility: 'Sports Court 2', issue: 'Cracked flooring near net', priority: 'High', status: 'Open' },
  { id: 2, facility: 'Community Hall A', issue: 'Flickering lights in hallway', priority: 'Medium', status: 'In progress' },
  { id: 3, facility: 'Meeting Room D', issue: 'Projector not turning on', priority: 'Low', status: 'Open' },
]

function priorityTone(priority) {
  if (priority === 'High') return 'danger'
  if (priority === 'Medium') return 'warning'
  return 'default'
}

function statusTone(status) {
  if (status === 'Completed') return 'success'
  if (status === 'In progress') return 'warning'
  return 'default'
}

function StaffMaintenance() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [query, setQuery] = useState('')

  function markInProgress(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'In progress' } : t)))
  }

  function markCompleted(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Completed' } : t)))
  }

  const filtered = tasks.filter((t) =>
    `${t.facility} ${t.issue} ${t.priority} ${t.status}`.toLowerCase().includes(query.toLowerCase())
  )

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
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={tableStyles.td}>{t.facility}</td>
                  <td style={tableStyles.td}>{t.issue}</td>
                  <td style={tableStyles.td}>
                    <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                  </td>
                  <td style={tableStyles.td}>
                    <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  </td>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                      {t.status === 'Open' && (
                        <button style={buttonStyle} onClick={() => markInProgress(t.id)}>
                          Start
                        </button>
                      )}
                      {t.status !== 'Completed' && (
                        <button
                          style={{ ...buttonStyle, backgroundColor: 'var(--color-secondary)' }}
                          onClick={() => markCompleted(t.id)}
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