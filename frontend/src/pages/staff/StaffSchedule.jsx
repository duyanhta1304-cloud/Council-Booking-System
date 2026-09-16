import { PageHeader, Card, Badge, tableStyles } from '../../components/ui'

// Placeholder data — the schedule feature is not part of the assignment
// requirements, so this page renders a fixed sample week.
const SCHEDULE = [
  { id: 1, day: 'Monday', date: '15 Sep 2026', shift: 'Morning (8:00 AM - 4:00 PM)', assignment: 'Front desk — Coastal Community Hall' },
  { id: 2, day: 'Tuesday', date: '16 Sep 2026', shift: 'Morning (8:00 AM - 4:00 PM)', assignment: 'Maintenance rounds — Seaview Sports Centre' },
  { id: 3, day: 'Wednesday', date: '17 Sep 2026', shift: 'Afternoon (12:00 PM - 8:00 PM)', assignment: 'Booking support — Harbour Meeting Rooms' },
  { id: 4, day: 'Thursday', date: '18 Sep 2026', shift: 'Afternoon (12:00 PM - 8:00 PM)', assignment: 'Equipment checkout — Seaview Sports Centre' },
  { id: 5, day: 'Friday', date: '19 Sep 2026', shift: 'Morning (8:00 AM - 4:00 PM)', assignment: 'Front desk — Coastal Community Hall' },
  { id: 6, day: 'Saturday', date: '20 Sep 2026', shift: 'Weekend (9:00 AM - 1:00 PM)', assignment: 'Event setup — Beachside Pavilion' },
  { id: 7, day: 'Sunday', date: '21 Sep 2026', shift: 'Rest day', assignment: '—' },
]

function shiftTone(shift) {
  if (shift.startsWith('Morning')) return 'success'
  if (shift.startsWith('Afternoon')) return 'warning'
  if (shift.startsWith('Weekend')) return 'default'
  return 'default'
}

function StaffSchedule() {
  return (
    <div>
      <PageHeader
        title="Schedule"
        description="Your shifts and assignments for the week."
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.scrollWrapper('calc(100vh - 110px)')}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.stickyTh}>Day</th>
                <th style={tableStyles.stickyTh}>Date</th>
                <th style={tableStyles.stickyTh}>Shift</th>
                <th style={tableStyles.stickyTh}>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((s) => (
                <tr key={s.id}>
                  <td style={{ ...tableStyles.td, fontWeight: 'var(--font-weight-medium)' }}>{s.day}</td>
                  <td style={{ ...tableStyles.td, color: 'var(--color-text-secondary)' }}>{s.date}</td>
                  <td style={tableStyles.td}><Badge tone={shiftTone(s.shift)}>{s.shift}</Badge></td>
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
