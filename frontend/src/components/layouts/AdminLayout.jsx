import GeneralLayout from './GeneralLayout'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/facilities', label: 'Facilities' },
  { to: '/admin/equipment', label: 'Equipment' },
  { to: '/admin/approvals', label: 'Approvals' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/maintenance', label: 'Maintenance' },
  { to: '/admin/closures', label: 'Closures' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/audit', label: 'Audit' },
]

function AdminLayout() {
  return (
    <GeneralLayout
      role="admin"
      navItems={NAV_ITEMS}
    />
  )
}

export default AdminLayout