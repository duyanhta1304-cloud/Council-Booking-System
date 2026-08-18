import { useState } from 'react'
import { PageHeader, Card, Button, EmptyState, inputStyle, labelStyle } from '../../components/ui'

// TODO: replace with GET /api/facilities (for the select options)
const FACILITIES = ['Community Hall A', 'Meeting Room B', 'Sports Court 2']

function FacilityClosures() {
  const [facility, setFacility] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [affectedBookings, setAffectedBookings] = useState([])

  const handleSchedule = (e) => {
    e.preventDefault()
    // TODO: POST /api/closures { facility, startDate, endDate, reason }
    // Backend should return the bookings that fall inside the closure window —
    // this mock stands in for that response so the panel isn't empty in the demo.
    setAffectedBookings([
      { id: 1, requester: 'J. Tan', date: '23 Aug, 2:00 PM' },
      { id: 2, requester: 'M. Lopez', date: '24 Aug, 4:00 PM' },
    ])
  }

  return (
    <div>
      <PageHeader title="Facility closures" description="Schedule a temporary closure and manage any affected bookings." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Schedule a closure
          </h2>
          <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <label style={labelStyle}>
              Facility
              <select value={facility} onChange={(e) => setFacility(e.target.value)} style={inputStyle} required>
                <option value="">Select facility</option>
                {FACILITIES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                Start date
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} required />
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                End date
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} required />
              </label>
            </div>

            <label style={labelStyle}>
              Reason
              <textarea
                value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                placeholder="e.g. Roof repairs" style={{ ...inputStyle, resize: 'vertical' }} required
              />
            </label>

            <Button type="submit" variant="danger">Schedule closure</Button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Affected bookings
          </h2>
          {affectedBookings.length === 0 ? (
            <EmptyState message="Schedule a closure to see affected bookings here." />
          ) : (
            affectedBookings.map((b) => (
              <div key={b.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
              }}>
                <div>
                  <div style={{ color: 'var(--color-text)' }}>{b.requester}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{b.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" style={{ padding: '6px 12px' }}>Rebook</Button>
                  <Button variant="secondary" style={{ padding: '6px 12px' }}>Cancel</Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}

export default FacilityClosures
