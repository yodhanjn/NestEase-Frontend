import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, MapPin, IndianRupee, Star, Eye, CalendarCheck, MessageCircle } from 'lucide-react'
import { getMyPGs, deletePG } from '../../services/pgService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pgs, setPGs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyPGs = async () => {
    try {
      const res = await getMyPGs()
      setPGs(res.data.pgs)
    } catch {
      toast.error('Failed to load your listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMyPGs() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deletePG(id)
      toast.success('Listing deleted')
      setPGs(pgs.filter((p) => p._id !== id))
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Owner Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name.split(' ')[0]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/dashboard/owner/chat"
              className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl border border-[#1A6B6B] text-[#1A6B6B] text-sm w-full sm:w-auto"
            >
              <MessageCircle size={16} />
              Messages
            </Link>
            <Link
              to="/dashboard/owner/bookings"
              className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl border border-[#1A6B6B] text-[#1A6B6B] text-sm w-full sm:w-auto"
            >
              <CalendarCheck size={16} />
              Booking Requests
            </Link>
            <Link
              to="/dashboard/owner/add-pg"
              className="flex items-center justify-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm w-full sm:w-auto"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              <Plus size={16} />
              Add New PG
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: pgs.length },
            { label: 'Verified', value: pgs.filter((p) => p.isVerified).length },
            { label: 'Pending Approval', value: pgs.filter((p) => !p.isVerified).length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <div className="text-3xl font-bold" style={{ color: '#1A6B6B' }}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-4">My Listings</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-24" />
            ))}
          </div>
        ) : pgs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="font-semibold text-gray-700 mb-2">No listings yet</h3>
            <p className="text-gray-400 text-sm mb-5">Add your first PG listing to start receiving bookings</p>
            <Link
              to="/dashboard/owner/add-pg"
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              <Plus size={15} />
              Add PG Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pgs.map((pg) => (
              <div key={pg._id} className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {pg.images.length > 0 ? (
                    <img src={pg.images[0]} alt={pg.pgName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#2D2D2D] truncate">{pg.pgName}</h3>
                    {pg.isVerified ? (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full shrink-0">Verified</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full shrink-0">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} />{pg.location.city}</span>
                    <span className="flex items-center gap-1"><IndianRupee size={12} />{pg.price.toLocaleString('en-IN')}/mo</span>
                    {pg.overallRating > 0 && (
                      <span className="flex items-center gap-1"><Star size={12} fill="#F5A623" color="#F5A623" />{pg.overallRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button onClick={() => navigate(`/pg/${pg._id}`)} className="p-2 rounded-lg text-gray-400 hover:text-[#1A6B6B] hover:bg-[#E8F4F4] transition-colors">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => navigate(`/dashboard/owner/edit-pg/${pg._id}`)} className="p-2 rounded-lg text-gray-400 hover:text-[#1A6B6B] hover:bg-[#E8F4F4] transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(pg._id, pg.pgName)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
