import GeneralLayout from './GeneralLayout'

const NAV_ITEMS = [
  { to: '/staff', label: 'Dashboard', end: true },
  { to: '/staff/bookings', label: 'Bookings' },
  { to: '/staff/maintenance', label: 'Maintenance' },
  { to: '/staff/schedule', label: 'Schedule' },
]

function StaffLayout() {
  return (
    <GeneralLayout
      role="staff"
      navItems={NAV_ITEMS}
    />
  )
}

export default StaffLayout