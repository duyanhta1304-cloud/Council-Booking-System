import { Routes, Route } from 'react-router'
import { googleLogout } from '@react-oauth/google'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { useAuth } from './context/authContext'
import { useRef, useState, useEffect } from 'react'
import { Outlet } from 'react-router'
import "./global.css"

import ProtectedRoute from './components/protectedRoute'
import PublicOnlyRoute from './components/publicRoute'

import Login from './pages/landing/login'
import LandingPage from './pages/landing/landingPage'

import AdminLayout from './components/layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminFacilities from './pages/admin/AdminFacilities'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminBookings from './pages/admin/AdminBookings'
import AdminMaintenance from './pages/admin/AdminMaintenance'
import AdminClosures from './pages/admin/AdminClosures'
import AdminReports from './pages/admin/AdminReports'
import AdminAudit from './pages/admin/AdminAudit'

import ResidentLayout from './components/layouts/ResidentLayout'
import StaffLayout from './components/layouts/StaffLayout'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffBookings from './pages/staff/StaffBookings'
import StaffMaintenance from './pages/staff/StaffMaintenance'
import StaffSchedule from './pages/staff/StaffSchedule'

import ResidentHome from './pages/resident/ResidentHome'
import ResidentFacilities from './pages/resident/ResidentFacilities'
import ResidentBookings from './pages/resident/ResidentBookings'

function App() {

  return (
    <Routes>
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
      
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Any authenticated user, no role restriction */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleNotFound />} />
      </Route>

      {/* Admin-only */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/facilities" element={<AdminFacilities />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/maintenance" element={<AdminMaintenance />} />
          <Route path="/admin/closures" element={<AdminClosures />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
        </Route>
      </Route>

      {/* Staff-only */}
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/bookings" element={<StaffBookings />} />
          <Route path="/staff/maintenance" element={<StaffMaintenance />} />
          <Route path="/staff/schedule" element={<StaffSchedule />} />
        </Route>
      </Route>

      {/* Resident-only */}
      <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
        <Route element={<ResidentLayout />}>
          <Route path="/resident" element={<ResidentHome />} />
          <Route path="/resident/facilities" element={<ResidentFacilities />} />
          <Route path="/resident/bookings" element={<ResidentBookings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App


function NotFound() {
  return (
    <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--color-text)' }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Check the URL, or head back to the home page.</p>
    </div>
  )
}
function RoleNotFound() {
  return (
    <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--color-text)' }}>Role not found</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Please contact admin to resolve this issue </p>
      <p style={{ color: 'var(--color-text-secondary)' }}>coastalcouncil974@gmail.com</p>
    </div>
  )
}
