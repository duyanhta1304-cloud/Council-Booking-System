import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

const COLUMNS = ['Pending', 'In Progress', 'Completed', 'Cancelled']
const COLUMN_TONE = { Pending: 'danger', 'In Progress': 'warning', Completed: 'success', Cancelled: 'neutral' }

function ReportIssueModal({ facilities, onClose, onCreated }) {
  const [facilityId, setFacilityId] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/maintenance', {
        facility: facilityId,
        description,
        priority,
        date: new Date().toISOString(),
      })
      toast.success('Maintenance issue reported!')
      onCreated(data)
      onClose()
    } catch {
      toast.error('Could not report issue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(38, 50, 56, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-modal)',
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)', width: '400px', boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)' }}>
          Report maintenance issue
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={labelStyle}>
            Facility
            <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} required>
              <option value="">Select facility</option>
              {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Description
            <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px', resize: 'vertical' }} placeholder="Describe the issue..." />
          </label>
          <label style={labelStyle}>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Cancel
            </button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Reporting...' : 'Report issue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MaintenanceBoard() {
  const [tasks, setTasks] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/maintenance'),
      api.get('/facilities'),
    ])
      .then(([maintenanceRes, facilitiesRes]) => {
        setTasks(maintenanceRes.data)
        setFacilities(facilitiesRes.data)
      })
      .catch(() => toast.error('Could not load maintenance tasks'))
      .finally(() => setLoading(false))
  }, [])

  const advance = async (id, currentStatus) => {
    const idx = COLUMNS.indexOf(currentStatus)
    if (idx >= COLUMNS.length - 1) return
    const nextStatus = COLUMNS[idx + 1]
    try {
      const { data } = await api.patch(`/maintenance/${id}`, { status: nextStatus })
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)))
      toast.success(`Moved to ${nextStatus}`)
    } catch {
      toast.error('Could not update task')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track reported issues from first report through to resolution."
        action={<Button variant="primary" onClick={() => setShowModal(true)}>+ Report issue</Button>}
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
                ({tasks.filter((t) => t.status === col).length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {tasks.filter((t) => t.status === col).map((t) => (
                <Card key={t._id} style={{ padding: 'var(--space-sm)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                    {t.facility?.name ?? 'Unknown facility'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {t.description}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge label={t.assignedTo?.name ?? 'Unassigned'} tone={COLUMN_TONE[col]} />
                    {col !== 'Completed' && col !== 'Cancelled' && (
                      <button
                        onClick={() => advance(t._id, t.status)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)', cursor: 'pointer', padding: 0 }}
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

      {showModal && (
        <ReportIssueModal
          facilities={facilities}
          onClose={() => setShowModal(false)}
          onCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
        />
      )}
    </div>
  )
}

export default MaintenanceBoard
