import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, tableStyles, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function AddFacilityModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Active')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/facilities', { name, description, status })
      toast.success('Facility created!')
      onCreated(data)
      onClose()
    } catch {
      toast.error('Could not create facility')
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
          Add facility
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={labelStyle}>
            Name
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} placeholder="e.g. Community Hall A" />
          </label>
          <label style={labelStyle}>
            Description
            <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px', resize: 'vertical' }} placeholder="Describe the facility..." />
          </label>
          <label style={labelStyle}>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Cancel
            </button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create facility'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FacilityManagement() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/facilities')
      .then(({ data }) => setFacilities(data))
      .catch(() => toast.error('Could not load facilities'))
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    try {
      const { data } = await api.patch(`/facilities/${id}`, { status: newStatus })
      setFacilities((prev) => prev.map((f) => (f._id === id ? data : f)))
      toast.success(`Facility ${newStatus === 'Active' ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Could not update facility')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Facilities & equipment"
        description="Manage the Council's bookable spaces and their details."
        action={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add facility</Button>}
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Name</th>
                <th style={tableStyles.th}>Description</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f._id}>
                  <td style={tableStyles.td}>{f.name}</td>
                  <td style={tableStyles.td}>{f.description}</td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={f.status} tone={f.status === 'Active' ? 'success' : 'neutral'} />
                  </td>
                  <td style={{ ...tableStyles.td, display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => toggleActive(f._id, f.status)}>
                      {f.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {facilities.length === 0 && <p style={{ padding: '16px', color: 'var(--color-text-muted)' }}>No facilities found. Add one to get started!</p>}
        </div>
      </Card>

      {showModal && (
        <AddFacilityModal
          onClose={() => setShowModal(false)}
          onCreated={(newFacility) => setFacilities((prev) => [...prev, newFacility])}
        />
      )}
    </div>
  )
}

export default FacilityManagement
