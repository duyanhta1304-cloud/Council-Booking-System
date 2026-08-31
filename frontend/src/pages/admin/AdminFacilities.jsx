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

// Equipment is stocked, so the two things an admin has to be able to change are
// how many units exist and whether the item is currently lendable at all.
function EquipmentModal({ facility, onClose, onUpdated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const items = facility.equipment ?? []

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post(`/facilities/${facility._id}/equipment`, { name, description, quantity })
      onUpdated(data)
      setName('')
      setDescription('')
      setQuantity(1)
      toast.success('Equipment added')
    } catch {
      toast.error('Could not add equipment')
    } finally {
      setSubmitting(false)
    }
  }

  const patchItem = async (itemId, changes) => {
    try {
      const { data } = await api.patch(`/facilities/${facility._id}/equipment/${itemId}`, changes)
      onUpdated(data)
    } catch {
      toast.error('Could not update equipment')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(38, 50, 56, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-modal)',
      padding: 'var(--space-md)',
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)', width: '520px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          Equipment — {facility.name}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
          Residents borrow these by the hour, so the unit count decides how many bookings can overlap.
        </p>

        {items.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No equipment listed at this facility yet.
          </p>
        ) : (
          <table style={{ ...tableStyles.table, marginBottom: 'var(--space-md)' }}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Item</th>
                <th style={tableStyles.th}>Units</th>
                <th style={tableStyles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td style={tableStyles.td}>
                    <div>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td style={tableStyles.td}>
                    <input
                      type="number"
                      min={1}
                      defaultValue={item.quantity}
                      onBlur={(e) => {
                        const next = Math.max(1, Number(e.target.value) || 1)
                        if (next !== item.quantity) patchItem(item._id, { quantity: next })
                      }}
                      style={{ ...inputStyle, width: '72px' }}
                    />
                  </td>
                  <td style={tableStyles.td}>
                    <select
                      value={item.status}
                      onChange={(e) => patchItem(item._id, { status: e.target.value })}
                      style={{ ...inputStyle, width: 'auto' }}
                    >
                      <option value="Available">Available</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <label style={labelStyle}>
            Item name
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} placeholder="e.g. Projector" />
          </label>
          <label style={labelStyle}>
            Description
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} placeholder="Optional" />
          </label>
          <label style={labelStyle}>
            Units held
            <input type="number" required min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} style={{ ...inputStyle, marginTop: '4px' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Done
            </button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Adding...' : '+ Add equipment'}
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
  const [equipmentFor, setEquipmentFor] = useState(null)

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
                <th style={tableStyles.th}>Equipment</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f._id}>
                  <td style={tableStyles.td}>{f.name}</td>
                  <td style={tableStyles.td}>{f.description}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>
                    {(f.equipment ?? []).length} item{(f.equipment ?? []).length === 1 ? '' : 's'}
                  </td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={f.status} tone={f.status === 'Active' ? 'success' : 'neutral'} />
                  </td>
                  <td style={{ ...tableStyles.td, display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => setEquipmentFor(f)}>
                      Equipment
                    </Button>
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

      {equipmentFor && (
        <EquipmentModal
          facility={equipmentFor}
          onClose={() => setEquipmentFor(null)}
          onUpdated={(updated) => {
            setFacilities((prev) => prev.map((f) => (f._id === updated._id ? updated : f)))
            // The modal renders from this facility, so it has to follow too.
            setEquipmentFor(updated)
          }}
        />
      )}
    </div>
  )
}

export default FacilityManagement
