import GeneralLayout from './GeneralLayout'

const NAV_ITEMS = [
    { to: '/resident', label: 'Home', end: true },
    { to: '/resident/facilities', label: 'Facilities' },
    { to: '/resident/bookings', label: 'My Bookings' }
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