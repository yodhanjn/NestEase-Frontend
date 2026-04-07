import { useEffect, useMemo, useState } from 'react'
import { getOwnerBookings, updateBookingStatus } from '../../services/bookingService'
import toast from 'react-hot-toast'
import { CalendarDays, IndianRupee, MapPin, User } from 'lucide-react'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

const statusBadge: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-green-50 text-green-700',
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all')

  const analytics = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === 'pending').length
    const confirmed = bookings.filter((booking) => booking.status === 'confirmed').length
    const completed = bookings.filter((booking) => booking.status === 'completed').length
    const cancelled = bookings.filter((booking) => booking.status === 'cancelled').length
    const cancellationRate = bookings.length > 0 ? (cancelled / bookings.length) * 100 : 0

    return {
      pending,
      confirmed,
      completed,
      cancelled,
      cancellationRate: Number(cancellationRate.toFixed(1)),
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings
    return bookings.filter((booking) => booking.status === filter)
  }, [bookings, filter])

  const fetchOwnerBookings = async () => {
    try {
      const res = await getOwnerBookings()
      setBookings(res.data.bookings || [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load booking requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    setUpdatingId(bookingId)
    try {
      await updateBookingStatus(bookingId, status)
      setBookings((prev) => prev.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking)))
      toast.success(`Booking marked as ${status}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update booking status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Booking Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Manage resident booking requests for your PG listings.</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filter === status
                    ? 'border-[#1A6B6B] text-[#1A6B6B] bg-[#E8F4F4]'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{analytics.pending}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{analytics.confirmed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{analytics.completed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Cancellation Rate</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{analytics.cancellationRate}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {analytics.cancelled} cancelled out of {bookings.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-36" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
            No booking requests found for this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#2D2D2D]">{booking.pg?.pgName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {booking.pg?.location?.address}, {booking.pg?.location?.city}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <IndianRupee size={14} />
                      {booking.pg?.price?.toLocaleString('en-IN')}/month
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <User size={14} />
                      {booking.user?.name} ({booking.user?.email})
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <CalendarDays size={14} />
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[booking.status as BookingStatus]}`}>
                      {booking.status}
                    </span>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                      <button
                        disabled={updatingId === booking._id || booking.status === 'confirmed'}
                        onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 w-full sm:w-auto"
                      >
                        Confirm
                      </button>
                      <button
                        disabled={updatingId === booking._id || booking.status === 'completed'}
                        onClick={() => handleUpdateStatus(booking._id, 'completed')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 w-full sm:w-auto"
                      >
                        Complete
                      </button>
                      <button
                        disabled={updatingId === booking._id || booking.status === 'cancelled'}
                        onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
