import { useState } from 'react'
import { PageHeader, Card, StatusBadge, Button, EmptyState } from '../../components/ui'

// TODO: replace with GET /api/bookings?status=pending
const INITIAL_REQUESTS = [
  { id: 1, facility: 'Community Hall A', requester: 'J. Tan', date: '22 Aug, 2:00 PM', conflict: false },
  { id: 2, facility: 'Meeting Room D', requester: 'S. Ahmed', date: '23 Aug, 9:00 AM', conflict: true },
  { id: 3, facility: 'Sports Court 1', requester: 'M. Lopez', date: '24 Aug, 4:00 PM', conflict: false },
]

function ApprovalsQueue() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS)

  const respond = (id) => {
    // TODO: POST /api/bookings/:id/approve  or  /api/bookings/:id/reject
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div>
      <PageHeader title="Approvals queue" description="Review and respond to pending booking requests." />

      <Card style={{ padding: 'var(--space-md)' }}>
        {requests.length === 0 && <EmptyState message="No pending requests — you're all caught up." />}

        {requests.map((r) => (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)',
            padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: '200px' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
                {r.facility}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {r.requester} · {r.date}
              </div>
            </div>

            {r.conflict && <StatusBadge label="Conflict" tone="danger" />}

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Button variant="secondary" onClick={() => respond(r.id)}>Reject</Button>
              <Button
                variant="primary"
                onClick={() => respond(r.id)}
                disabled={r.conflict}
                style={{ opacity: r.conflict ? 0.5 : 1, cursor: r.conflict ? 'not-allowed' : 'pointer' }}
              >
                Approve
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

export default ApprovalsQueue
