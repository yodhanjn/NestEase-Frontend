import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Home, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'owner' ? '/dashboard/owner' :
    user?.role === 'admin' ? '/dashboard/admin' :
    '/dashboard/resident'

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A6B6B' }}>
              <Home size={16} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#1A6B6B' }}>NestEase</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-[#1A6B6B] transition-colors">
              Find PG
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#1A6B6B] transition-colors">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A6B6B] flex items-center justify-center text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#1A6B6B] transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#1A6B6B' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/search" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Find PG</Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block text-sm text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block text-sm font-semibold text-[#1A6B6B]" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
