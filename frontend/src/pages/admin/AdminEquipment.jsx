import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, tableStyles, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

const STATUSES = ['Available', 'Under Maintenance', 'Retired']
const STATUS_TONE = { Available: 'success', 'Under Maintenance': 'warning', Retired: 'neutral' }
function EquipmentModal({ item, facilities, onClose, onSaved }) {
  const editing = Boolean(item)
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [status, setStatus] = useState(item?.status ?? 'Available')
  const [facility, setFacility] = useState(item?.facility?._id ?? '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { name, description, quantity, status, facility }
      const { data } = editing
        ? await api.patch(`/equipment/${item._id}`, payload)
        : await api.post('/equipment', payload)

      toast.success(editing ? 'Equipment updated!' : 'Equipment added!')
      onSaved(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not save equipment')
    } finally {
      setSubmitting(false)
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
        padding: 'var(--space-lg)', width: '420px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          {editing ? `Edit ${item.name}` : 'Add equipment'}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
          Residents borrow these by the hour, so the unit count decides how many bookings can overlap.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={labelStyle}>
            Item name
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} placeholder="e.g. Projector" />
          </label>

          <label style={labelStyle}>
            Description
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} placeholder="Optional" />
          </label>

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              Units held
              <input
                type="number" required min={1} value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                style={{ ...inputStyle, marginTop: '4px' }}
              />
            </label>
            <label style={{ ...labelStyle, flex: 1 }}>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <label style={labelStyle}>
            Collected from
            <select value={facility} onChange={(e) => setFacility(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
              <option value="">No fixed location</option>
              {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'none', letterSpacing: 'normal' }}>
              Optional — equipment exists on its own, this only says where to pick it up.
            </span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Cancel
            </button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add equipment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EquipmentManagement() {
  const [equipment, setEquipment] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalFor, setModalFor] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/equipment'),
      api.get('/facilities'),
    ])
      .then(([equipmentRes, facilitiesRes]) => {
        setEquipment(equipmentRes.data)
        setFacilities(facilitiesRes.data)
      })
      .catch(() => toast.error('Could not load equipment'))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return
    try {
      await api.delete(`/equipment/${item._id}`)
      setEquipment((prev) => prev.filter((e) => e._id !== item._id))
      toast.success('Equipment deleted')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not delete equipment')
    }
  }

  const upsert = (saved) =>
    setEquipment((prev) =>
      prev.some((e) => e._id === saved._id)
        ? prev.map((e) => (e._id === saved._id ? saved : e))
        : [...prev, saved]
    )

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="The Council's bookable equipment. Items exist independently of facilities."
        action={<Button variant="primary" onClick={() => setModalFor({})}>+ Add equipment</Button>}
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.scrollWrapper('calc(100vh - 110px)')}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.stickyTh}>Item</th>
                <th style={tableStyles.stickyTh}>Units</th>
                <th style={tableStyles.stickyTh}>Collected from</th>
                <th style={tableStyles.stickyTh}>Status</th>
                <th style={tableStyles.stickyTh}></th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item._id}>
                  <td style={tableStyles.td}>
                    <div>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td style={tableStyles.td}>{item.quantity}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>
                    {item.facility?.name ?? 'No fixed location'}
                  </td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={item.status} tone={STATUS_TONE[item.status]} />
                  </td>
                  {/* Flex on an inner div, not the cell — see AdminFacilities. */}
                  <td style={{ ...tableStyles.td, width: '1%', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => setModalFor(item)}>
                        Edit
                      </Button>
                      <Button variant="danger" style={{ padding: '6px 12px' }} onClick={() => remove(item)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {equipment.length === 0 && (
            <p style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
              No equipment yet. Add an item to get started — you don't need a facility first.
            </p>
          )}
        </div>
      </Card>

      {modalFor && (
        <EquipmentModal
          item={modalFor._id ? modalFor : null}
          facilities={facilities}
          onClose={() => setModalFor(null)}
          onSaved={upsert}
        />
      )}
    </div>
  )
}

export default EquipmentManagement
