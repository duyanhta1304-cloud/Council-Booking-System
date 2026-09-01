import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, tableStyles, inputStyle, labelStyle } from '../../components/ui'
import toast from 'react-hot-toast'

function FacilityClosures() {
  const [facilities, setFacilities] = useState([])
  const [closures, setClosures] = useState([])
  const [facility, setFacility] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/facilities'),
      api.get('/closures'),
    ])
      .then(([facilitiesRes, closuresRes]) => {
        setFacilities(facilitiesRes.data)
        setClosures(closuresRes.data)
      })
      .catch(() => toast.error('Could not load data'))
  }, [])

  const handleSchedule = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/closures', { facility, startDate, endDate, reason })
      setClosures((prev) => [data, ...prev])
      toast.success('Closure scheduled successfully!')
      setFacility('')
      setStartDate('')
      setEndDate('')
      setReason('')
    } catch {
      toast.error('Could not schedule closure')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (closure) => {
    const name = closure.facility?.name ?? 'this facility'
    if (!window.confirm(
      `Call off the closure for ${name}?\n\nThe facility reopens for those dates, but bookings already cancelled by this closure stay cancelled — those residents were notified.`
    )) return

    try {
      await api.delete(`/closures/${closure._id}`)
      setClosures((prev) => prev.filter((c) => c._id !== closure._id))
      toast.success('Closure cancelled — the facility is open again')
    } catch {
      toast.error('Could not cancel closure')
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  // A closure whose end date has passed is history — reopening it means nothing.
  const isPast = (closure) => new Date(closure.endDate) < new Date()

  return (
    <div>
      <PageHeader title="Facility closures" description="Schedule temporary closures and view all scheduled periods." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <Card>
          <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Schedule a closure
          </h2>
          <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <label style={labelStyle}>
              Facility
              <select value={facility} onChange={(e) => setFacility(e.target.value)} style={inputStyle} required>
                <option value="">Select facility</option>
                {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
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

            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule closure'}
            </Button>
          </form>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text)', margin: 0 }}>
              Scheduled closures
            </h2>
          </div>
          {closures.length === 0 ? (
            <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No closures scheduled.
            </p>
          ) : (
            <div style={tableStyles.wrapper}>
              <table style={tableStyles.table}>
                <thead>
                  <tr>
                    <th style={tableStyles.th}>Facility</th>
                    <th style={tableStyles.th}>From</th>
                    <th style={tableStyles.th}>To</th>
                    <th style={tableStyles.th}>Reason</th>
                    <th style={tableStyles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {closures.map((c) => (
                    <tr key={c._id}>
                      <td style={tableStyles.td}>{c.facility?.name ?? '—'}</td>
                      <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{formatDate(c.startDate)}</td>
                      <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{formatDate(c.endDate)}</td>
                      <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{c.reason}</td>
                      <td style={tableStyles.td}>
                        {isPast(c) ? (
                          <StatusBadge label="Ended" tone="neutral" />
                        ) : (
                          <Button variant="secondary" style={{ padding: '4px 10px' }} onClick={() => handleCancel(c)}>
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default FacilityClosures
