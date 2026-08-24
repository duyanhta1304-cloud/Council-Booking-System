import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, inputStyle, buttonStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function availabilityTone(status) {
  if (status === 'Active') return 'success'
  if (status === 'Under Maintenance') return 'warning'
  return 'danger'
}

function FacilityCard({ facility, onRequestBooking }) {
  const isClosed = facility.status !== 'Active'

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {facility.name}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {facility.description}
          </p>
        </div>
        <Badge tone={availabilityTone(facility.status)}>{facility.status}</Badge>
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <button
          style={{ ...buttonStyle, opacity: isClosed ? 0.5 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
          disabled={isClosed}
          onClick={() => onRequestBooking(facility)}
        >
          {isClosed ? 'Unavailable' : 'Request booking'}
        </button>
      </div>
    </Card>
  )
}

function BookingRequestModal({ facility, onClose, onSubmit }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    if (end <= start) {
      alert('End time must be after start time')
      return
    }
    onSubmit({ facilityId: facility._id, facilityName: facility.name, startTime: start.toISOString(), endTime: end.toISOString(), purpose })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(38, 50, 56, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-modal)',
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)', width: '360px', boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)' }}>
          Request booking — {facility.name}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Date
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} />
          </label>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Start Time
            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} />
          </label>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            End Time
            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} />
          </label>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Purpose
            <input type="text" required placeholder="e.g. Birthday party" value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={buttonStyle}>Submit request</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ResidentFacilities() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    api.get('/facilities')
      .then(({ data }) => setFacilities(data))
      .catch(() => toast.error('Could not load facilities'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = facilities.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  )

  async function handleSubmitRequest({ facilityId, facilityName, startTime, endTime, purpose }) {
    try {
      await api.post('/bookings', { facility: facilityId, startTime, endTime, purpose })
      setSelectedFacility(null)
      setConfirmation(`Booking request sent for ${facilityName}!`)
      toast.success('Booking request submitted!')
      setTimeout(() => setConfirmation(null), 4000)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not submit booking')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Search Council facilities and request a booking."
        action={
          <input
            type="text"
            placeholder="Search facilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
        }
      />

      {confirmation && (
        <div style={{
          backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)',
          padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)',
        }}>
          {confirmation}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
        {filtered.map((f) => (
          <FacilityCard key={f._id} facility={f} onRequestBooking={setSelectedFacility} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-lg)' }}>
          No facilities match your search.
        </p>
      )}

      {selectedFacility && (
        <BookingRequestModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  )
}

export default ResidentFacilities