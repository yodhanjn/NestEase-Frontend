import { useEffect, useState } from 'react'
import { getMyBookings } from '../../services/bookingService'
import { Link } from 'react-router-dom'
import { CalendarDays, IndianRupee, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  completed: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
}

export default function ResidentBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings()
        setBookings(res.data.bookings || [])
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">My Bookings</h1>
        <p className="text-sm text-gray-500 mb-6">Track your booking requests and stay history.</p>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-gray-500 mb-4">No bookings yet</p>
            <Link to="/search" className="text-sm font-semibold text-[#1A6B6B]">
              Find a PG
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D]">{booking.pg?.pgName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {booking.pg?.location?.address}, {booking.pg?.location?.city}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <IndianRupee size={14} />
                    {booking.pg?.price?.toLocaleString('en-IN')}/month
                  </p>
                  <p className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/pg/${booking.pg?._id}`} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#1A6B6B] hover:text-[#1A6B6B]">
                    View PG
                  </Link>
                  <Link to="/dashboard/resident/reviews" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#1A6B6B] hover:text-[#1A6B6B]">
                    Submit Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
