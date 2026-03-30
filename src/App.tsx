import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOTPPage from './pages/VerifyOTPPage'
import SearchPage from './pages/SearchPage'
import PGDetailPage from './pages/PGDetailPage'
import BookingPage from './pages/BookingPage'
import ResidentDashboard from './pages/dashboard/ResidentDashboard'
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import AddPGPage from './pages/dashboard/AddPGPage'
import ResidentBookingsPage from './pages/dashboard/ResidentBookingsPage'
import SubmitReviewPage from './pages/dashboard/SubmitReviewPage'
import DailyFeedbackPage from './pages/dashboard/DailyFeedbackPage'
import OwnerBookingsPage from './pages/dashboard/OwnerBookingsPage'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ChatPage from './pages/dashboard/ChatPage'
import ResidentRecommendationsPage from './pages/dashboard/ResidentRecommendationsPage'

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1A6B6B] border-t-transparent" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      <Route path="/pg/:id" element={<Layout><PGDetailPage /></Layout>} />
      <Route path="/booking/:pgId" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><BookingPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/resident" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><ResidentDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/resident/bookings" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><ResidentBookingsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/resident/reviews" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><SubmitReviewPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/resident/feedback" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><DailyFeedbackPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/resident/chat" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><ChatPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/resident/recommendations" element={
        <ProtectedRoute roles={['resident']}>
          <Layout><ResidentRecommendationsPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/owner" element={
        <ProtectedRoute roles={['owner']}>
          <Layout><OwnerDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/owner/add-pg" element={
        <ProtectedRoute roles={['owner']}>
          <Layout><AddPGPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/owner/bookings" element={
        <ProtectedRoute roles={['owner']}>
          <Layout><OwnerBookingsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/owner/chat" element={
        <ProtectedRoute roles={['owner']}>
          <Layout><ChatPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/admin" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
