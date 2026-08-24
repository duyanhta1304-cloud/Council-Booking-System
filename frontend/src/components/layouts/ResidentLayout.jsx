import GeneralLayout from './GeneralLayout'

const NAV_ITEMS = [
    { to: '/resident', label: 'Home', end: true },
    { to: '/resident/facilities', label: 'Book a Facility' },
    { to: '/resident/bookings', label: 'My Bookings' },
    { to: '/resident/maintenance', label: "Report Maintenance"}
]

function ResidentLayout() {
    return (
        <GeneralLayout
            role="resident"
            navItems={NAV_ITEMS}
        />
    )
}

export default ResidentLayout