import { useState } from 'react'
import { PageHeader, Card, Badge, inputStyle, buttonStyle } from '../../components/ui'

// TODO: replace with GET /api/facilities?search=&type=
const FACILITIES = [
  { id: 1, name: 'Community Hall A', type: 'Hall', capacity: 150, availability: 'Available', closureNote: null },
  { id: 2, name: 'Meeting Room D', type: 'Meeting Room', capacity: 12, availability: 'Available', closureNote: null },
  { id: 3, name: 'Sports Court 1', type: 'Sports Court', capacity: 20, availability: 'Limited', closureNote: null },
  { id: 4, name: 'Sports Court 2', type: 'Sports Court', capacity: 20, availability: 'Closed', closureNote: 'Closed for resurfacing until 25 Aug' },
  { id: 5, name: 'BBQ Pavilion', type: 'Outdoor', capacity: 40, availability: 'Available', closureNote: null },
]

function availabilityTone(status) {
  if (status === 'Available') return 'success'
  if (status === 'Limited') return 'warning'
  return 'danger'
}

function FacilityCard({ facility, onRequestBooking }) {
  const isClosed = facility.availability === 'Closed'

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {facility.name}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {facility.type} · Capacity {facility.capacity}
          </p>
        </div>
        <Badge tone={availabilityTone(facility.availability)}>{facility.availability}</Badge>
      </div>

      {facility.closureNote && (
        <p style={{
          fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-text)',
          backgroundColor: 'var(--color-danger-bg)', padding: 'var(--space-xs) var(--space-sm)',
          borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-sm)',
        }}>
          {facility.closureNote}
        </p>
      )}

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
  const [time, setTime] = useState('')
  const [purpose, setPurpose] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ facilityId: facility.id, facilityName: facility.name, date, time, purpose })
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
            <input
              type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Time
            <input
              type="time" required value={time} onChange={(e) => setTime(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Purpose
            <input
              type="text" required placeholder="e.g. Birthday party"
              value={purpose} onChange={(e) => setPurpose(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)',
              backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer',
            }}>
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
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  const types = ['All', ...new Set(FACILITIES.map((f) => f.type))]

  const filtered = FACILITIES.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase())
    const matchesType = typeFilter === 'All' || f.type === typeFilter
    return matchesQuery && matchesType
  })

  function handleSubmitRequest(request) {
    // TODO: POST /api/bookings
    console.log('Booking request submitted:', request)
    setSelectedFacility(null)
    setConfirmation(`Booking request sent for ${request.facilityName} on ${request.date}.`)
    setTimeout(() => setConfirmation(null), 4000)
  }

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Search Council facilities and request a booking."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ ...inputStyle, width: '160px' }}
            >
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search facilities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={inputStyle}
            />
          </div>
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

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)',
      }}>
        {filtered.map((f) => (
          <FacilityCard key={f.id} facility={f} onRequestBooking={setSelectedFacility} />
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