import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { fileToResizedDataUrl } from '../../lib/image'
import { PageHeader, Card, StatusBadge, Button, tableStyles, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function ImagePicker({ image, onChange }) {
  const [busy, setBusy] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBusy(true)
    try {
      onChange(await fileToResizedDataUrl(file))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
      // Let the same file be picked again after a removal.
      e.target.value = ''
    }
  }

  return (
    <div style={labelStyle}>
      Photo
      {image ? (
        <div style={{ marginTop: '4px' }}>
          <img
            src={image}
            alt="Facility preview"
            style={{
              width: '100%', height: '140px', objectFit: 'cover',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'none', border: 'none', color: 'var(--color-danger-text)',
              fontSize: 'var(--font-size-xs)', cursor: 'pointer', padding: '6px 0 0',
            }}
          >
            Remove photo
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={busy}
          style={{ ...inputStyle, marginTop: '4px', padding: '8px', cursor: busy ? 'wait' : 'pointer' }}
        />
      )}
      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'none', letterSpacing: 'normal' }}>
        {busy ? 'Processing…' : 'Resized to 1200px before upload. Optional.'}
      </span>
    </div>
  )
}

function FacilityModal({ facility, onClose, onSaved }) {
  const editing = Boolean(facility)
  const [name, setName] = useState(facility?.name ?? '')
  const [description, setDescription] = useState(facility?.description ?? '')
  const [status, setStatus] = useState(facility?.status ?? 'Active')
  const [image, setImage] = useState(facility?.image ?? '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { name, description, status, image }
      const { data } = editing
        ? await api.patch(`/facilities/${facility._id}`, payload)
        : await api.post('/facilities', payload)

      toast.success(editing ? 'Facility updated!' : 'Facility created!')
      onSaved(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not save facility')
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
        padding: 'var(--space-lg)', width: '400px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)' }}>
          {editing ? `Edit ${facility.name}` : 'Add facility'}
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

          <ImagePicker image={image} onChange={setImage} />

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
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create facility'}
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
  const [modalFor, setModalFor] = useState(null)

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

  const upsert = (saved) =>
    setFacilities((prev) =>
      prev.some((f) => f._id === saved._id)
        ? prev.map((f) => (f._id === saved._id ? saved : f))
        : [...prev, saved]
    )

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Manage the Council's bookable spaces and their details."
        action={<Button variant="primary" onClick={() => setModalFor({})}>+ Add facility</Button>}
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Photo</th>
                <th style={tableStyles.th}>Name</th>
                <th style={tableStyles.th}>Description</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f._id}>
                  <td style={tableStyles.td}>
                    {f.image ? (
                      <img
                        src={f.image}
                        alt=""
                        style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: '56px', height: '40px', borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-bg)', border: '1px dashed var(--color-border)',
                      }} />
                    )}
                  </td>
                  <td style={tableStyles.td}>{f.name}</td>
                  <td style={tableStyles.td}>{f.description}</td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={f.status} tone={f.status === 'Active' ? 'success' : 'neutral'} />
                  </td>
                  <td style={{ ...tableStyles.td, display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => setModalFor(f)}>
                      Edit
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

      {modalFor && (
        <FacilityModal
          facility={modalFor._id ? modalFor : null}
          onClose={() => setModalFor(null)}
          onSaved={upsert}
        />
      )}
    </div>
  )
}

export default FacilityManagement
