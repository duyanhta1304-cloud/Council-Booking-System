import { useState } from 'react'
import { PageHeader, Card, StatusBadge, Button, tableStyles } from '../../components/ui'

// TODO: replace with GET /api/facilities (admin view — includes inactive records)
const INITIAL_FACILITIES = [
  { id: 1, name: 'Community Hall A', category: 'Hall', capacity: 120, active: true },
  { id: 2, name: 'Meeting Room B', category: 'Room', capacity: 12, active: true },
  { id: 3, name: 'Sports Court 2', category: 'Court', capacity: 30, active: false },
]

function FacilityManagement() {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES)

  const toggleActive = (id) => {
    // TODO: PATCH /api/facilities/:id { active }
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)))
  }

  return (
    <div>
      <PageHeader
        title="Facilities & equipment"
        description="Manage the Council's bookable spaces and their details."
        action={<Button variant="primary">+ Add facility</Button>}
      />

      <Card style={{ padding: 0 }}>
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Name</th>
                <th style={tableStyles.th}>Category</th>
                <th style={tableStyles.th}>Capacity</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f.id}>
                  <td style={tableStyles.td}>{f.name}</td>
                  <td style={tableStyles.td}>{f.category}</td>
                  <td style={tableStyles.td}>{f.capacity}</td>
                  <td style={tableStyles.td}>
                    <StatusBadge label={f.active ? 'Active' : 'Inactive'} tone={f.active ? 'success' : 'neutral'} />
                  </td>
                  <td style={{ ...tableStyles.td, display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" style={{ padding: '6px 12px' }}>Edit</Button>
                    <Button variant="secondary" style={{ padding: '6px 12px' }} onClick={() => toggleActive(f.id)}>
                      {f.active ? 'Deactivate' : 'Activate'}
                    </Button>
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

export default FacilityManagement
