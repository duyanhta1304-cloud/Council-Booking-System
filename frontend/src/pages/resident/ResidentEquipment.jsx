import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, Badge, inputStyle, buttonStyle, tableStyles } from '../../components/ui'
import toast from 'react-hot-toast'

const MAX_DAYS_AHEAD = 90

function availabilityTone(status) {
  if (status === 'Available') return 'success'
  if (status === 'Under Maintenance') return 'warning'
  return 'danger'
}

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

function EquipmentCard({ item, onRequestBooking }) {
  const unavailable = item.status !== 'Available'

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {item.name}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {item.description || 'No description provided.'}
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {item.facility?.name ? `Collect from ${item.facility.name}` : 'No fixed collection point'}
          </p>
        </div>
        <Badge tone={availabilityTone(item.status)}>{item.status}</Badge>
      </div>

      <div style={{
        marginTop: 'var(--space-md)', fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
      }}>
        {item.quantity} unit{item.quantity === 1 ? '' : 's'} in stock
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <button
          style={{ ...buttonStyle, opacity: unavailable ? 0.5 : 1, cursor: unavailable ? 'not-allowed' : 'pointer' }}
          disabled={unavailable}
          onClick={() => onRequestBooking(item)}
        >
          {unavailable ? 'Unavailable' : 'Request booking'}
        </button>
      </div>
    </Card>
  )
}

function Swatch({ bg, border }) {
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px',
      backgroundColor: bg, border: `1px solid ${border}`, marginRight: '4px',
    }} />
  )
}

// Unlike a room slot, a slot here is not simply taken or free — it shows how
// many units are still on the shelf, and greys out only once the resident's
// chosen quantity no longer fits.
function SlotButton({ slot, state, onClick }) {
  const palette = {
    selected: { bg: 'var(--color-primary)', border: 'var(--color-primary)', text: 'var(--color-text-on-dark)' },
    available: { bg: 'var(--color-surface)', border: 'var(--color-border-strong)', text: 'var(--color-text)' },
    taken: { bg: 'var(--color-bg)', border: 'var(--color-border)', text: 'var(--color-text-muted)' },
  }[state]

  const detail = state === 'taken' ? slot.reason ?? 'Not enough' : `${slot.remaining} left`

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'taken'}
      title={state === 'taken' ? detail : `Book ${slot.label} — ${detail}`}
      style={{
        padding: '10px 4px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.bg,
        color: palette.text,
        fontSize: 'var(--font-size-sm)',
        fontWeight: state === 'selected' ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
        cursor: state === 'taken' ? 'not-allowed' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      }}
    >
      {slot.label}
      <span style={{ fontSize: 'var(--font-size-xs)' }}>{detail}</span>
    </button>
  )
}

function EquipmentRequestModal({ item, linkableBookings, onClose, onSubmit }) {
  const today = new Date()
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD)

  const [linkId, setLinkId] = useState('')
  const linked = linkableBookings.find((b) => b._id === linkId) ?? null

  // Linking pins the equipment to that booking's day; unlinked, the resident
  // picks any day themselves.
  const [ownDate, setOwnDate] = useState(toDateInputValue(today))
  const date = linked ? toDateInputValue(new Date(linked.startTime)) : ownDate

  // null means "still loading" — avoids a separate loading flag the effect
  // would have to set synchronously.
  const [slots, setSlots] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedHours, setSelectedHours] = useState([])
  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadingSlots = slots === null

  useEffect(() => {
    let cancelled = false

    api.get('/bookings/equipment-availability', {
      params: { equipment: item._id, date },
    })
      .then(({ data }) => {
        if (cancelled) return
        setSlots(data.slots)
      })
      .catch(() => {
        if (cancelled) return
        setSlots([])
        toast.error('Could not load available times')
      })

    return () => { cancelled = true }
  }, [item._id, date, refreshKey])

  // Hours outside the linked booking are not the resident's to fill.
  const withinLink = (slot) => {
    if (!linked) return true
    return new Date(slot.startTime) >= new Date(linked.startTime)
      && new Date(slot.endTime) <= new Date(linked.endTime)
  }

  function changeLink(nextId) {
    setLinkId(nextId)
    setSlots(null)
    setSelectedHours([])
  }

  // A slot only counts as free if it can cover the quantity being asked for,
  // so raising the quantity can invalidate a selection made at a lower one.
  const fits = (slot) => slot.available && slot.remaining >= quantity && withinLink(slot)

  function changeDate(nextDate) {
    setOwnDate(nextDate)
    setSlots(null)
    setSelectedHours([])
  }

  function changeQuantity(next) {
    setQuantity(next)
    setSelectedHours((prev) => {
      const stillFits = (slots ?? [])
        .filter((s) => prev.includes(s.hour))
        .every((s) => s.available && s.remaining >= next)
      return stillFits ? prev : []
    })
  }

  function reloadSlots() {
    setSlots(null)
    setSelectedHours([])
    setRefreshKey((n) => n + 1)
  }

  const selectedSlots = (slots ?? []).filter((s) => selectedHours.includes(s.hour))

  // First click picks a block; a second click extends the range, as long as
  // every block in between still has enough units left.
  function toggleSlot(slot) {
    setSelectedHours((prev) => {
      if (prev.length === 0) return [slot.hour]
      if (prev.length === 1 && prev[0] === slot.hour) return []

      const anchor = prev[0]
      const [from, to] = anchor <= slot.hour ? [anchor, slot.hour] : [slot.hour, anchor]
      const range = slots.filter((s) => s.hour >= from && s.hour <= to)

      if (range.some((s) => !fits(s))) {
        toast.error(`That range doesn't have ${quantity} free the whole time`)
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
        equipmentId: item._id,
        equipmentName: item.name,
        quantity,
        linkedBooking: linkId || undefined,
        startTime: selectedSlots[0].startTime,
        endTime: selectedSlots[selectedSlots.length - 1].endTime,
        purpose,
      })
    } catch {
      // The parent has already explained what went wrong; reload the grid so
      // units someone else just claimed show up straight away.
      reloadSlots()
    } finally {
      setSubmitting(false)
    }
  }

  const nothingFits = !loadingSlots && slots.every((s) => !fits(s))

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
          Request equipment — {item.name}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
          Choose how many you need, then pick the hours you need them for.
          {item.facility?.name ? ` Collect from ${item.facility.name}.` : ''}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            For one of my bookings <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
            <select
              value={linkId}
              onChange={(e) => changeLink(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
              disabled={linkableBookings.length === 0}
            >
              <option value="">
                {linkableBookings.length === 0 ? 'No approved bookings to link to' : 'Not for a booking — just borrowing'}
              </option>
              {linkableBookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.facility?.name ?? 'Booking'} — {new Date(b.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  {' '}{new Date(b.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
          </label>

          {linked && (
            <div style={{
              backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)',
              padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
            }}>
              Date is set by that booking. You can only pick hours inside it.
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <label style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Date
              <input
                type="date"
                required
                value={date}
                min={toDateInputValue(today)}
                max={toDateInputValue(maxDate)}
                disabled={Boolean(linked)}
                onChange={(e) => changeDate(e.target.value)}
                style={{
                  ...inputStyle, width: '100%', marginTop: '4px',
                  backgroundColor: linked ? 'var(--color-bg)' : undefined,
                  cursor: linked ? 'not-allowed' : undefined,
                }}
              />
            </label>
            <label style={{ width: '110px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              How many
              <input
                type="number"
                required
                min={1}
                max={item.quantity}
                value={quantity}
                onChange={(e) => changeQuantity(Math.max(1, Math.min(item.quantity, Number(e.target.value) || 1)))}
                style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
              />
            </label>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Units free per hour (of {item.quantity})
            </div>

            {loadingSlots ? (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading times…</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-xs)' }}>
                {slots.map((slot) => (
                  <SlotButton
                    key={slot.hour}
                    slot={slot}
                    state={selectedHours.includes(slot.hour) ? 'selected' : fits(slot) ? 'available' : 'taken'}
                    onClick={() => toggleSlot(slot)}
                  />
                ))}
              </div>
            )}

            {!loadingSlots && (
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                <span><Swatch bg="var(--color-surface)" border="var(--color-border-strong)" /> Enough free</span>
                <span><Swatch bg="var(--color-primary)" border="var(--color-primary)" /> Selected</span>
                <span><Swatch bg="var(--color-bg)" border="var(--color-border)" /> Not enough</span>
              </div>
            )}

            {nothingFits && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                {linked
                  ? `No hour inside that booking has ${quantity} free. Ask for fewer, or unlink to borrow at another time.`
                  : `No hour on this date has ${quantity} free. Ask for fewer, or try another day.`}
              </p>
            )}
          </div>

          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Purpose
            <input type="text" required placeholder="e.g. School holiday workshop" value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '4px' }} />
          </label>

          <div style={{
            backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)',
            color: selectedSlots.length ? 'var(--color-text)' : 'var(--color-text-muted)',
          }}>
            {selectedSlots.length
              ? `${quantity} × ${item.name} · ${new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatRange(selectedSlots)}`
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

function ResidentEquipment() {
  const [equipment, setEquipment] = useState([])
  const [linkableBookings, setLinkableBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/equipment'),
      api.get('/resident/bookings'),
    ])
      .then(([equipmentRes, bookingsRes]) => {
        setEquipment(equipmentRes.data)
        // Only a resident's own approved, still-upcoming facility bookings are
        // worth offering as something to attach equipment to.
        setLinkableBookings(
          bookingsRes.data
            .filter((b) => b.bookingType !== 'Equipment' && b.status === 'Approved' && new Date(b.endTime) > new Date())
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        )
      })
      .catch(() => toast.error('Could not load equipment'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = equipment.filter((item) =>
    `${item.name} ${item.facility?.name ?? ''}`.toLowerCase().includes(query.toLowerCase())
  )

  async function handleSubmitRequest({ equipmentId, equipmentName, quantity, linkedBooking, startTime, endTime, purpose }) {
    try {
      await api.post('/bookings', { equipmentId, quantity, linkedBooking, startTime, endTime, purpose })
      setSelectedItem(null)
      setConfirmation(`Request sent for ${quantity} × ${equipmentName}!`)
      toast.success('Equipment request submitted!')
      setTimeout(() => setConfirmation(null), 4000)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not submit request')
      // Keep the modal open — the message usually says how many are actually
      // left, which is exactly what the resident needs to adjust.
      throw err
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="Borrow Council equipment for the hours you need it."
        action={
          <input
            type="text"
            placeholder="Search equipment..."
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

      {/* Same height cap as the table pages, so the catalogue scrolls inside its own area. */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)',
        alignContent: 'start', ...tableStyles.scrollWrapper('calc(100vh - 170px)'), paddingRight: '4px',
      }}>
        {filtered.map((item) => (
          <EquipmentCard key={item._id} item={item} onRequestBooking={setSelectedItem} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-lg)' }}>
          {equipment.length === 0 ? 'No equipment is listed yet.' : 'No equipment matches your search.'}
        </p>
      )}

      {selectedItem && (
        <EquipmentRequestModal
          item={selectedItem}
          linkableBookings={linkableBookings}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  )
}

export default ResidentEquipment
