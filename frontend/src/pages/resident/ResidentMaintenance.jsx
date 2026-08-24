import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Button, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function ResidentMaintenance() {
  const [facilities, setFacilities] = useState([])
  const [facilityId, setFacilityId] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/facilities')
      .then(({ data }) => setFacilities(data))
      .catch(() => toast.error('Could not load facilities'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/maintenance', {
        facility: facilityId,
        description,
        priority,
        date: new Date().toISOString(),
      })
      toast.success('Maintenance issue reported successfully!')
      setFacilityId('')
      setDescription('')
      setPriority('Medium')
    } catch {
      toast.error('Could not report issue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Report Maintenance Issue"
        description="Notice a problem at a Council facility? Let us know so we can fix it."
      />

      <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={labelStyle}>
            Facility
            <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} required>
              <option value="">Select facility</option>
              {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Issue Description
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px', resize: 'vertical' }}
              placeholder="e.g. The air conditioning in Room A is not working..."
            />
          </label>
          <label style={labelStyle}>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ResidentMaintenance
