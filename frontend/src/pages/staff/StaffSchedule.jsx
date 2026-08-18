import { PageHeader, Card, tableStyles } from '../../components/ui'

// TODO: replace with GET /api/staff/schedule
const SCHEDULE = [
  { id: 1, day: 'Monday', date: '18 Aug', shift: '8:00 AM – 4:00 PM', assignment: 'Front desk + bookings' },
  { id: 2, day: 'Tuesday', date: '19 Aug', shift: '8:00 AM – 4:00 PM', assignment: 'Maintenance rounds' },
  { id: 3, day: 'Wednesday', date: '20 Aug', shift: 'Off', assignment: '—' },
  { id: 4, day: 'Thursday', date: '21 Aug', shift: '10:00 AM – 6:00 PM', assignment: 'Facility inspections' },
  { id: 5, day: 'Friday', date: '22 Aug', shift: '8:00 AM – 4:00 PM', assignment: 'Front desk + bookings' },
]

function StaffSchedule() {
  return (
    <div>
      <PageHeader
        title="Schedule"
        description="Your shifts and assignments for the week."
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Day</th>
                <th style={tableStyles.th}>Date</th>
                <th style={tableStyles.th}>Shift</th>
                <th style={tableStyles.th}>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((s) => (
                <tr key={s.id}>
                  <td style={{ ...tableStyles.td, fontWeight: 'var(--font-weight-medium)' }}>{s.day}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{s.date}</td>
                  <td style={tableStyles.td}>{s.shift}</td>
                  <td style={tableStyles.td}>{s.assignment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default StaffSchedule