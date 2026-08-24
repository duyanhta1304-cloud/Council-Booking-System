import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, tableStyles } from '../../components/ui'
import toast from 'react-hot-toast'

function StaffSchedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/schedule')
      .then(({ data }) => setSchedule(data))
      .catch(() => toast.error('Could not load schedule'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <PageHeader
        title="Schedule"
        description="Your shifts and assignments for the week."
      />

      {schedule.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-lg) 0' }}>
            No schedule has been assigned to you yet. Check back later or contact your manager.
          </p>
        </Card>
      ) : (
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
                {schedule.map((s) => (
                  <tr key={s.id ?? s._id}>
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
      )}
    </div>
  )
}

export default StaffSchedule