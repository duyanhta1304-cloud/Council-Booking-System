import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, RadioGroup, PRIORITY_OPTIONS, PRIORITY_TONES, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

const COLUMNS = ['Pending', 'In Progress', 'Completed', 'Cancelled']
const COLUMN_TONE = { Pending: 'danger', 'In Progress': 'warning', Completed: 'success', Cancelled: 'neutral' }
const PRIORITY_TONE = { High: 'danger', Medium: 'warning', Low: 'success' }

// "Move →" walks this order; Cancelled is deliberately not on it, since
// cancelling is a decision, not the next step after finishing.
const PROGRESSION = ['Pending', 'In Progress', 'Completed']

// Shared by the assignee dropdown and its read-only twin on completed tasks,
// so a card keeps the same shape once it stops being editable.
const linkButtonStyle = (color) => ({
  background: 'none', border: 'none', color,
  fontSize: 'var(--font-size-xs)', cursor: 'pointer', padding: 0,
})

const assigneeFieldStyle = (assignedTo) => ({
  ...inputStyle,
  width: '100%',
  padding: '4px 6px',
  marginBottom: '8px',
  fontSize: 'var(--font-size-xs)',
  color: assignedTo ? 'var(--color-text)' : 'var(--color-text-muted)',
})

function ReportIssueModal({ facilities, staff, onClose, onCreated }) {
  const [facilityId, setFacilityId] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/maintenance', {
        facility: facilityId,
        description,
        priority,
        assignedTo: assignedTo || undefined,
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
          <div style={labelStyle}>
            Priority
            <RadioGroup
              name="priority"
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={setPriority}
              tones={PRIORITY_TONES}
            />
          </div>
          <label style={labelStyle}>
            Assign to
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
              <option value="">Unassigned</option>
              {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
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
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/maintenance'),
      api.get('/facilities'),
      api.get('/admin/staff'),
    ])
      .then(([maintenanceRes, facilitiesRes, staffRes]) => {
        setTasks(maintenanceRes.data)
        setFacilities(facilitiesRes.data)
        setStaff(staffRes.data)
      })
      .catch(() => toast.error('Could not load maintenance tasks'))
      .finally(() => setLoading(false))
  }, [])

  const assign = async (id, staffId) => {
    try {
      const { data } = await api.patch(`/maintenance/${id}`, { assignedTo: staffId || null })
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)))
      toast.success(staffId ? `Assigned to ${data.assignedTo?.name}` : 'Assignment cleared')
    } catch {
      toast.error('Could not assign task')
    }
  }

  const setStatus = async (id, nextStatus, message) => {
    try {
      const { data } = await api.patch(`/maintenance/${id}`, { status: nextStatus })
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)))
      toast.success(message)
    } catch {
      toast.error('Could not update task')
    }
  }

  const advance = (id, currentStatus) => {
    const idx = PROGRESSION.indexOf(currentStatus)
    if (idx === -1 || idx >= PROGRESSION.length - 1) return
    const nextStatus = PROGRESSION[idx + 1]
    return setStatus(id, nextStatus, `Moved to ${nextStatus}`)
  }

  const cancel = (id) => {
    if (!window.confirm('Cancel this maintenance task? It will be marked Cancelled, not deleted.')) return
    return setStatus(id, 'Cancelled', 'Maintenance task cancelled')
  }

  const reopen = (id) => setStatus(id, 'Pending', 'Task reopened')

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
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    gap: 'var(--space-xs)', marginBottom: '4px',
                  }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
                      {t.facility?.name ?? 'Unknown facility'}
                    </div>
                    <StatusBadge label={t.priority ?? 'Medium'} tone={PRIORITY_TONE[t.priority ?? 'Medium']} />
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {t.description}
                  </div>

                  {t.status == 'Completed' ? (
                    <div style={assigneeFieldStyle(t.assignedTo)}>
                      {t.assignedTo?.name ?? 'Unassigned'}
                    </div>
                  ) : (
                    <select
                      value={t.assignedTo?._id ?? ''}
                      onChange={(e) => assign(t._id, e.target.value)}
                      style={assigneeFieldStyle(t.assignedTo)}
                    >
                      <option value="">Unassigned</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  )}


                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <StatusBadge label={col} tone={COLUMN_TONE[col]} />
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      {col === 'Cancelled' ? (
                        <button onClick={() => reopen(t._id)} style={linkButtonStyle('var(--color-primary)')}>
                          Reopen
                        </button>
                      ) : (
                        <>
                          {col !== 'Completed' && (
                            <button onClick={() => cancel(t._id)} style={linkButtonStyle('var(--color-danger-text)')}>
                              Cancel
                            </button>
                          )}
                          {col !== 'Completed' && (
                            <button onClick={() => advance(t._id, t.status)} style={linkButtonStyle('var(--color-primary)')}>
                              Move →
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
          staff={staff}
          onClose={() => setShowModal(false)}
          onCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
        />
      )}
    </div>
  )
}

export default MaintenanceBoard
