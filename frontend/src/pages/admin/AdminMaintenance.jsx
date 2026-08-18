import { useState } from 'react'
import { PageHeader, Card, StatusBadge, Button } from '../../components/ui'

// TODO: replace with GET /api/maintenance
const INITIAL_TASKS = [
  { id: 1, facility: 'Sports Court 2', issue: 'Lighting fault', assignee: 'Unassigned', column: 'Reported' },
  { id: 2, facility: 'Meeting Room B', issue: 'AC not cooling', assignee: 'D. Park', column: 'Assigned' },
  { id: 3, facility: 'Community Hall C', issue: 'Broken door hinge', assignee: 'D. Park', column: 'In progress' },
  { id: 4, facility: 'Meeting Room D', issue: 'Flickering light', assignee: 'R. Silva', column: 'Resolved' },
]

const COLUMNS = ['Reported', 'Assigned', 'In progress', 'Resolved']
const COLUMN_TONE = { Reported: 'danger', Assigned: 'warning', 'In progress': 'info', Resolved: 'success' }

function MaintenanceBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)

  const advance = (id) => {
    // TODO: PATCH /api/maintenance/:id { status: nextColumn }
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const idx = COLUMNS.indexOf(t.column)
      return idx < COLUMNS.length - 1 ? { ...t, column: COLUMNS[idx + 1] } : t
    }))
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track reported issues from first report through to resolution."
        action={<Button variant="primary">+ Report issue</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
        {COLUMNS.map((col) => (
          <div key={col}>
            <div style={{
              fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)', marginBottom: 'var(--space-sm)',
            }}>
              {col}{' '}
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' }}>
                ({tasks.filter((t) => t.column === col).length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {tasks.filter((t) => t.column === col).map((t) => (
                <Card key={t.id} style={{ padding: 'var(--space-sm)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)', color: 'var(--color-text)',
                    fontWeight: 'var(--font-weight-medium)', marginBottom: '4px',
                  }}>
                    {t.facility}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {t.issue}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge label={t.assignee} tone={COLUMN_TONE[col]} />
                    {col !== 'Resolved' && (
                      <button
                        onClick={() => advance(t.id)}
                        style={{
                          background: 'none', border: 'none', color: 'var(--color-primary)',
                          fontSize: 'var(--font-size-xs)', cursor: 'pointer', padding: 0,
                        }}
                      >
                        Move →
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MaintenanceBoard
