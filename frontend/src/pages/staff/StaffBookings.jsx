import { useState } from 'react'
import { PageHeader, Card, Badge, tableStyles, inputStyle } from '../../components/ui'

// TODO: replace with GET /api/staff/bookings
const BOOKINGS = [
  { id: 1, facility: 'Community Hall A', resident: 'S. Ahmed', date: '18 Aug', time: '9:00 AM', status: 'Confirmed' },
  { id: 2, facility: 'Meeting Room D', resident: 'J. Tan', date: '18 Aug', time: '11:30 AM', status: 'Confirmed' },
  { id: 3, facility: 'Sports Court 2', resident: 'D. Park', date: '18 Aug', time: '2:00 PM', status: 'Pending' },
  { id: 4, facility: 'Sports Court 1', resident: 'M. Lopez', date: '19 Aug', time: '10:00 AM', status: 'Cancelled' },
]

function statusTone(status) {
  if (status === 'Confirmed') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Cancelled') return 'danger'
  return 'default'
}

function StaffBookings() {
  const [query, setQuery] = useState('')

  const filtered = BOOKINGS.filter((b) =>
    `${b.facility} ${b.resident} ${b.status}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage facility bookings."
        action={
          <input
            type="text"
            placeholder="Search bookings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
        }
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Facility</th>
                <th style={tableStyles.th}>Resident</th>
                <th style={tableStyles.th}>Date</th>
                <th style={tableStyles.th}>Time</th>
                <th style={tableStyles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={tableStyles.td}>{b.facility}</td>
                  <td style={tableStyles.td}>{b.resident}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{b.date}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{b.time}</td>
                  <td style={tableStyles.td}>
                    <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default StaffBookings