import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { PageHeader, Card, StatusBadge, Button, EmptyState } from '../../components/ui'
import toast from 'react-hot-toast'

function ApprovalsQueue() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings?status=Pending')
      .then(({ data }) => setRequests(data))
      .catch(() => toast.error('Could not load pending bookings'))
      .finally(() => setLoading(false))
  }, [])

  const respond = async (id, action) => {
    try {
      await api.post(`/bookings/${id}/${action}`, { status: action === 'approve' ? 'Approved' : 'Rejected' })
      setRequests((prev) => prev.filter((r) => r._id !== id))
      toast.success(`Booking ${action}d successfully`)
    } catch {
      toast.error(`Could not ${action} booking`)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <PageHeader title="Approvals queue" description="Review and respond to pending booking requests." />

      <Card style={{ padding: 'var(--space-md)' }}>
        {requests.length === 0 && <EmptyState message="No pending requests — you're all caught up." />}

        {requests.map((r) => (
          <div key={r._id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)',
            padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: '200px' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
                {r.facility?.name ?? 'Unknown facility'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {r.user?.name ?? 'Unknown user'} · {new Date(r.startTime).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Button variant="secondary" onClick={() => respond(r._id, 'reject')}>Reject</Button>
              <Button variant="primary" onClick={() => respond(r._id, 'approve')}>Approve</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

export default ApprovalsQueue
