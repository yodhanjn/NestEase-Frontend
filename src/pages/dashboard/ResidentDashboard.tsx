import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { Search, Star, ClipboardCheck, CalendarCheck, MessageCircle, Sparkles } from 'lucide-react'

export default function ResidentDashboard() {
  const { user } = useAuth()

  const quickLinks = [
    { icon: <Search size={20} />, label: 'Find a PG', to: '/search', desc: 'Browse verified PG listings' },
    { icon: <CalendarCheck size={20} />, label: 'My Bookings', to: '/dashboard/resident/bookings', desc: 'View and manage your bookings' },
    { icon: <Star size={20} />, label: 'Submit Review', to: '/dashboard/resident/reviews', desc: 'Rate your current PG' },
    { icon: <ClipboardCheck size={20} />, label: 'Daily Feedback', to: '/dashboard/resident/feedback', desc: 'Submit one structured feedback per day' },
    { icon: <MessageCircle size={20} />, label: 'Messages', to: '/dashboard/resident/chat', desc: 'Chat with PG owners in real-time' },
    { icon: <Sparkles size={20} />, label: 'AI Recommendations', to: '/dashboard/resident/recommendations', desc: 'Get smart PG suggestions based on your stays' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#1A6B6B' }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold text-[#2D2D2D]">Welcome back, {user?.name.split(' ')[0]}!</h1>
              <p className="text-gray-500 text-sm mt-0.5">{user?.email} · Resident</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all group flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#1A6B6B] group-hover:text-white" style={{ backgroundColor: '#E8F4F4', color: '#1A6B6B' }}>
                {link.icon}
              </div>
              <div>
                <p className="font-semibold text-[#2D2D2D] group-hover:text-[#1A6B6B] transition-colors">{link.label}</p>
                <p className="text-sm text-gray-400 mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <p className="text-sm text-gray-400">Phase 2 is live: bookings, reviews, food rating, and smart daily feedback are now active.</p>
        </div>
      </div>
    </div>
  )
}
