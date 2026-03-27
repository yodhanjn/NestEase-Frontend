import { useEffect, useState } from 'react'
import { getEligibleReviewBookings, submitReview } from '../../services/reviewService'
import toast from 'react-hot-toast'

const ratingFields = [
  { key: 'cleanlinessRating', label: 'Cleanliness' },
  { key: 'foodRating', label: 'Food Quality' },
  { key: 'waterRating', label: 'Water Supply' },
  { key: 'electricityRating', label: 'Electricity' },
  { key: 'wifiRating', label: 'WiFi' },
  { key: 'securityRating', label: 'Security' },
] as const

export default function SubmitReviewPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    cleanlinessRating: 4,
    foodRating: 4,
    waterRating: 4,
    electricityRating: 4,
    wifiRating: 4,
    securityRating: 4,
    comment: '',
  })

  useEffect(() => {
    const fetchEligible = async () => {
      try {
        const res = await getEligibleReviewBookings()
        setBookings(res.data.bookings || [])
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load eligible bookings')
      } finally {
        setLoading(false)
      }
    }
    fetchEligible()
  }, [])

  const selectedBooking = bookings.find((b) => b._id === selectedBookingId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) {
      toast.error('Please select a booking')
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        pgId: selectedBooking.pg._id,
        bookingId: selectedBooking._id,
        ...form,
      })
      toast.success('Review submitted successfully')
      setForm({
        cleanlinessRating: 4,
        foodRating: 4,
        waterRating: 4,
        electricityRating: 4,
        wifiRating: 4,
        securityRating: 4,
        comment: '',
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Submit Review</h1>
        <p className="text-sm text-gray-500 mb-6">Only verified residents with valid bookings can review.</p>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-48" />
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
            No eligible bookings found for review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select PG Booking</label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B]"
              >
                <option value="">Choose booking</option>
                {bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.pg?.pgName} ({new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ratingFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <select
                    value={form[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B]"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B] resize-none"
                placeholder="Share your stay experience..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-semibold py-3 rounded-xl disabled:opacity-60"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
