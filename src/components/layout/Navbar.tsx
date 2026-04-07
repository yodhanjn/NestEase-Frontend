import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Home, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'owner' ? '/dashboard/owner' :
    user?.role === 'admin' ? '/dashboard/admin' :
    '/dashboard/resident'

  const loadNotificationCount = async () => {
    if (!user) return
    try {
      const res = await getUnreadNotificationCount()
      setUnreadCount(res.data.unreadCount || 0)
    } catch {
      // silently ignore to avoid noisy UI
    }
  }

  const loadNotifications = async () => {
    if (!user) return
    setLoadingNotifications(true)
    try {
      const res = await getNotifications(1, 12)
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadNotificationCount()
    const timer = setInterval(() => {
      loadNotificationCount()
    }, 30000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!notificationRef.current) return
      if (!notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleOpenNotifications = async () => {
    const nextOpen = !notificationsOpen
    setNotificationsOpen(nextOpen)
    if (nextOpen) {
      await loadNotifications()
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification?.isRead) {
      await markNotificationRead(notification._id)
      setNotifications((prev) =>
        prev.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
      )
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    }
    const route = notification?.meta?.route
    if (route) navigate(route)
    setNotificationsOpen(false)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    setUnreadCount(0)
  }

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
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleOpenNotifications}
                      className="relative p-2 rounded-lg text-gray-500 hover:text-[#1A6B6B] hover:bg-[#E8F4F4] transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell size={17} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center font-semibold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-1rem))] bg-white border border-gray-100 rounded-xl shadow-lg z-50">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-[#2D2D2D]">Notifications</p>
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-[#1A6B6B] font-medium disabled:opacity-50"
                            disabled={unreadCount === 0}
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {loadingNotifications ? (
                            <p className="text-xs text-gray-400 px-3 py-4">Loading...</p>
                          ) : notifications.length === 0 ? (
                            <p className="text-xs text-gray-400 px-3 py-4">No notifications yet.</p>
                          ) : (
                            notifications.map((notification) => (
                              <button
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 ${
                                  !notification.isRead ? 'bg-[#F8FCFC]' : ''
                                }`}
                              >
                                <p className="text-xs font-semibold text-[#2D2D2D]">{notification.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
              <button
                onClick={() => {
                  navigate(dashboardPath)
                  setMenuOpen(false)
                }}
                className="block text-left text-sm font-medium text-gray-600"
              >
                Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
              </button>
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
