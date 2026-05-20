import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import { AdminReports, AdminNgoRequests, AdminDonations, AdminHeatmap } from './pages/admin/AdminPages'

// Donor pages
import { DonorDashboard, DonorRequests, DonorMyDonations, DonorHeatmap } from './pages/donor/DonorPages'

// NGO pages
import { NgoDashboard, NgoCreateRequest, NgoMyRequests, NgoDonations, NgoHeatmap } from './pages/ngo/NgoPages'

// Victim pages
import { VictimDashboard, VictimReport, VictimMyReports, VictimHeatmap } from './pages/victim/VictimPages'

function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />
  return children
}

function RootRedirect() {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  const paths = { ADMIN: '/admin/dashboard', DONOR: '/donor/dashboard', NGO: '/ngo/dashboard', VICTIM: '/victim/dashboard' }
  return <Navigate to={paths[role] || '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/ngo-requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNgoRequests /></ProtectedRoute>} />
          <Route path="/admin/donations" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDonations /></ProtectedRoute>} />
          <Route path="/admin/heatmap" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminHeatmap /></ProtectedRoute>} />

          {/* Donor */}
          <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/donor/requests" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorRequests /></ProtectedRoute>} />
          <Route path="/donor/my-donations" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorMyDonations /></ProtectedRoute>} />
          <Route path="/donor/heatmap" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorHeatmap /></ProtectedRoute>} />

          {/* NGO */}
          <Route path="/ngo/dashboard" element={<ProtectedRoute allowedRoles={['NGO']}><NgoDashboard /></ProtectedRoute>} />
          <Route path="/ngo/create-request" element={<ProtectedRoute allowedRoles={['NGO']}><NgoCreateRequest /></ProtectedRoute>} />
          <Route path="/ngo/my-requests" element={<ProtectedRoute allowedRoles={['NGO']}><NgoMyRequests /></ProtectedRoute>} />
          <Route path="/ngo/donations" element={<ProtectedRoute allowedRoles={['NGO']}><NgoDonations /></ProtectedRoute>} />
          <Route path="/ngo/heatmap" element={<ProtectedRoute allowedRoles={['NGO']}><NgoHeatmap /></ProtectedRoute>} />

          {/* Victim */}
          <Route path="/victim/dashboard" element={<ProtectedRoute allowedRoles={['VICTIM']}><VictimDashboard /></ProtectedRoute>} />
          <Route path="/victim/report" element={<ProtectedRoute allowedRoles={['VICTIM']}><VictimReport /></ProtectedRoute>} />
          <Route path="/victim/my-reports" element={<ProtectedRoute allowedRoles={['VICTIM']}><VictimMyReports /></ProtectedRoute>} />
          <Route path="/victim/heatmap" element={<ProtectedRoute allowedRoles={['VICTIM']}><VictimHeatmap /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
