import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, inputStyle, buttonStyle, tableStyles } from '../../components/ui'
import toast from 'react-hot-toast'

function availabilityTone(status) {
  if (status === 'Active') return 'success'
  if (status === 'Under Maintenance') return 'warning'
  return 'danger'
}

const DAY_MS = 1000 * 60 * 60 * 24

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

// Whole days from today to `date`, so "closes tomorrow" doesn't read as
// "closes in 0 days" just because the clock hasn't come round yet.
function daysUntil(date) {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - startOfToday()) / DAY_MS)
}

function inDays(count) {
  if (count <= 0) return 'today'
  if (count === 1) return 'tomorrow'
  return `in ${count} days`
}

const formatDay = (d) =>
  new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

// The closure that matters to someone looking at this card right now: the one
// running today, or failing that the next one coming.
function relevantClosure(closures) {
  const now = new Date()
  const live = closures.filter((c) => new Date(c.endDate) >= now)
  if (live.length === 0) return null

  const active = live.find((c) => new Date(c.startDate) <= now)
  if (active) return { closure: active, active: true }

  const next = live.reduce((soonest, c) =>
    new Date(c.startDate) < new Date(soonest.startDate) ? c : soonest
  )
  return { closure: next, active: false }
}

// The first day this facility is open again. Walks forward rather than just
// adding a day to the closure end, so back-to-back closures don't land the
// resident on a day that is still shut. Midday sidesteps the boundary
// ambiguity of a closure that starts or ends exactly at midnight.
function firstOpenDate(closures, from = startOfToday()) {
  const cursor = new Date(from)
  cursor.setHours(12, 0, 0, 0)

  for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
    const shut = closures.some(
      (c) => new Date(c.startDate) <= cursor && new Date(c.endDate) >= cursor
    )
    if (!shut) return new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
  }
  // Closed for the whole booking window — nothing to suggest.
  return null
}

function ClosureNotice({ closures }) {
  const relevant = relevantClosure(closures)
  if (!relevant) return null

  const { closure, active } = relevant
  // Inclusive of the last day: a closure ending today still shuts today.
  const reopensIn = daysUntil(closure.endDate) + 1
  const startsIn = daysUntil(closure.startDate)

  return (
    <div style={{
      marginTop: 'var(--space-sm)',
      backgroundColor: active ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
      color: active ? 'var(--color-danger-text)' : 'var(--color-warning-text)',
      padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-xs)',
    }}>
      {active ? (
        <>
          <strong>Closed for {reopensIn} more {reopensIn === 1 ? 'day' : 'days'}</strong>
          {' '}— reopens {formatDay(new Date(closure.endDate).getTime() + DAY_MS)}<br/><br/>Reason: {closure.reason}
        </>
      ) : (
        <>
          <strong>Closing {inDays(startsIn)}</strong>
          {' '}— {formatDay(closure.startDate)} to {formatDay(closure.endDate)}. {closure.reason}
        </>
      )}
    </div>
  )
}

function FacilityCard({ facility, closures = [], onRequestBooking }) {
  const closedNow = relevantClosure(closures)?.active ?? false
  const openFrom = firstOpenDate(closures)

  // A closure has a known end date, so booking past it is fine — only the
  // facility's own status (which has no end date) takes it off the market.
  // The one exception is a closure running past the whole booking horizon,
  // where there is no open day left to offer.
  const isClosed = facility.status !== 'Active' || openFrom === null

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {facility.image ? (
        <img
          src={facility.image}
          alt=""
          style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          height: '150px', backgroundColor: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary)', fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--font-size-2xl)',
        }}>
          {facility.name.charAt(0)}
        </div>
      )}

      <div style={{ padding: 'var(--space-lg)' }}>
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

        <ClosureNotice closures={closures} />

        <div style={{ marginTop: 'var(--space-md)' }}>
          <button
            style={{ ...buttonStyle, opacity: isClosed ? 0.5 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
            disabled={isClosed}
            onClick={() => onRequestBooking(facility, openFrom)}
          >
            {isClosed ? 'Unavailable' : closedNow ? 'Book a later date' : 'Request booking'}
          </button>
        </div>
      </div>
    </Card>
  )
}

const MAX_DAYS_AHEAD = 90

function toDateInputValue(date) {
  // Local-date ISO slice — toISOString() would shift the day in +/- timezones.
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function formatRange(slots) {
  if (slots.length === 0) return null
  const first = slots[0]
  const last = slots[slots.length - 1]
  const endLabel = `${String(last.hour + 1).padStart(2, '0')}:00`
  return `${first.label} – ${endLabel} (${slots.length} hour${slots.length > 1 ? 's' : ''})`
}

function Swatch({ bg, border }) {
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px',
      backgroundColor: bg, border: `1px solid ${border}`, marginRight: '4px',
    }} />
  )
}

function SlotButton({ slot, state, onClick }) {
  const palette = {
    selected: { bg: 'var(--color-primary)', border: 'var(--color-primary)', text: 'var(--color-text-on-dark)' },
    available: { bg: 'var(--color-surface)', border: 'var(--color-border-strong)', text: 'var(--color-text)' },
    taken: { bg: 'var(--color-bg)', border: 'var(--color-border)', text: 'var(--color-text-muted)' },
  }[state]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'taken'}
      title={slot.available ? `Book ${slot.label}` : slot.reason}
      style={{
        padding: '10px 4px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.bg,
        color: palette.text,
        fontSize: 'var(--font-size-sm)',
        fontWeight: state === 'selected' ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
        cursor: state === 'taken' ? 'not-allowed' : 'pointer',
        textDecoration: state === 'taken' && slot.reason === 'Booked' ? 'line-through' : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      }}
    >
      {slot.label}
      {state === 'taken' && (
        <span style={{ fontSize: 'var(--font-size-xs)' }}>{slot.reason}</span>
      )}
    </button>
  )
}

function BookingRequestModal({ facility, openFrom, onClose, onSubmit }) {
  const today = new Date()
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD)

  // Open on the first date the facility is actually free. During a closure
  // that is a later date, so the grid isn't a wall of "Closed" on arrival.
  const suggested = openFrom ?? today
  const openedOnLaterDate = toDateInputValue(suggested) !== toDateInputValue(today)

  const [date, setDate] = useState(toDateInputValue(suggested))
  // null means "still loading" — avoids a separate loading flag the effect
  // would have to set synchronously.
  const [slots, setSlots] = useState(null)
  const [closureReason, setClosureReason] = useState(null)
  const [selectedHours, setSelectedHours] = useState([])
  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadingSlots = slots === null

  useEffect(() => {
    let cancelled = false

    api.get('/bookings/availability', { params: { facility: facility._id, date } })
      .then(({ data }) => {
        if (cancelled) return
        setSlots(data.slots)
        setClosureReason(data.closureReason)
      })
      .catch(() => {
        if (cancelled) return
        setSlots([])
        toast.error('Could not load available times')
      })

    return () => { cancelled = true }
  }, [facility._id, date, refreshKey])

  // Changing the day clears the grid and any choice made on the old day.
  function changeDate(nextDate) {
    setDate(nextDate)
    setSlots(null)
    setSelectedHours([])
  }

  function reloadSlots() {
    setSlots(null)
    setSelectedHours([])
    setRefreshKey((n) => n + 1)
  }

  const selectedSlots = (slots ?? []).filter((s) => selectedHours.includes(s.hour))

  // First click picks a block; a second click extends the range, as long as
  // every block in between is still free.
  function toggleSlot(slot) {
    setSelectedHours((prev) => {
      if (prev.length === 0) return [slot.hour]
      if (prev.length === 1 && prev[0] === slot.hour) return []

      const anchor = prev[0]
      const [from, to] = anchor <= slot.hour ? [anchor, slot.hour] : [slot.hour, anchor]
      const range = slots.filter((s) => s.hour >= from && s.hour <= to)

      if (range.some((s) => !s.available)) {
        toast.error('That range includes an unavailable hour')
        return [slot.hour]
      }

      return range.map((s) => s.hour)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selectedSlots.length === 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        facilityId: facility._id,
        facilityName: facility.name,
        startTime: selectedSlots[0].startTime,
        endTime: selectedSlots[selectedSlots.length - 1].endTime,
        purpose,
      })
    } catch {
      // The parent has already explained what went wrong; reload the grid so
      // a slot someone else just took shows as unavailable.
      reloadSlots()
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
          Request booking — {facility.name}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
          Pick a date, then choose a one-hour block. Click a second block to book a longer run.
        </p>

      

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Date
            <input
              type="date"
              required
              value={date}
              min={toDateInputValue(today)}
              max={toDateInputValue(maxDate)}
              onChange={(e) => changeDate(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
            />
          </label>

          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Available times
            </div>

            {loadingSlots ? (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading times…</p>
            ) : closureReason ? (
              <div style={{
                backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
                padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}>
                Closed on this date — {closureReason}. Try another day.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-xs)' }}>
                {slots.map((slot) => (
                  <SlotButton
                    key={slot.hour}
                    slot={slot}
                    state={selectedHours.includes(slot.hour) ? 'selected' : slot.available ? 'available' : 'taken'}
                    onClick={() => toggleSlot(slot)}
                  />
                ))}
              </div>
            )}

            {!loadingSlots && !closureReason && (
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                <span><Swatch bg="var(--color-surface)" border="var(--color-border-strong)" /> Free</span>
                <span><Swatch bg="var(--color-primary)" border="var(--color-primary)" /> Selected</span>
                <span><Swatch bg="var(--color-bg)" border="var(--color-border)" /> Unavailable</span>
              </div>
            )}

            {!loadingSlots && !closureReason && slots.every((s) => !s.available) && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                Nothing free on this date. Try another day.
              </p>
            )}
          </div>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Purpose
            <input type="text" required placeholder="e.g. Birthday party" value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} />
          </label>

          <div style={{
            backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)',
            color: selectedSlots.length ? 'var(--color-text)' : 'var(--color-text-muted)',
          }}>
            {selectedSlots.length
              ? `${new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatRange(selectedSlots)}`
              : 'No time selected yet'}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedSlots.length === 0 || submitting}
              style={{
                ...buttonStyle,
                opacity: selectedSlots.length === 0 || submitting ? 0.5 : 1,
                cursor: selectedSlots.length === 0 || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Sending…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ResidentFacilities() {
  const [facilities, setFacilities] = useState([])
  const [closuresByFacility, setClosuresByFacility] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  // Holds the facility being booked plus the date to open the picker on, which
  // is later than today when a closure is running.
  const [request, setRequest] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/facilities'),
      api.get('/closures'),
    ])
      .then(([facilitiesRes, closuresRes]) => {
        setFacilities(facilitiesRes.data)

        // Group closures by facility so each card only reads its own.
        const grouped = {}
        for (const closure of closuresRes.data) {
          const id = closure.facility?._id ?? closure.facility
          if (!id) continue
          ;(grouped[id] ??= []).push(closure)
        }
        setClosuresByFacility(grouped)
      })
      .catch(() => toast.error('Could not load facilities'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = facilities.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  )

  async function handleSubmitRequest({ facilityId, facilityName, startTime, endTime, purpose }) {
    try {
      await api.post('/bookings', { facility: facilityId, startTime, endTime, purpose })
      setRequest(null)
      setConfirmation(`Booking request sent for ${facilityName}!`)
      toast.success('Booking request submitted!')
      setTimeout(() => setConfirmation(null), 4000)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not submit booking')
      // Keep the modal open so the resident can pick another block — the
      // message usually says the slot was taken while they were choosing.
      throw err
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

      {/* The card grid scrolls on its own below the header; the right padding
          keeps card edges clear of the scrollbar. */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)',
        ...tableStyles.scrollWrapper('calc(100vh - 110px)'), paddingRight: '4px',
      }}>
        {filtered.map((f) => (
          <FacilityCard
            key={f._id}
            facility={f}
            closures={closuresByFacility[f._id] ?? []}
            onRequestBooking={(facility, openFrom) => setRequest({ facility, openFrom })}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-lg)' }}>
          No facilities match your search.
        </p>
      )}

      {request && (
        <BookingRequestModal
          facility={request.facility}
          openFrom={request.openFrom}
          onClose={() => setRequest(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  )
}

export default ResidentFacilities