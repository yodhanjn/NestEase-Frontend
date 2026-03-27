import { useEffect, useState } from 'react'
import { getEligibleFeedbackBookings, submitDailyFeedback } from '../../services/feedbackService'
import toast from 'react-hot-toast'

const fields = [
  { key: 'foodQuality', label: 'Food Quality' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'safety', label: 'Safety & Security' },
  { key: 'internet', label: 'Internet Connectivity' },
] as const

export default function DailyFeedbackPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    foodQuality: 4,
    cleanliness: 4,
    safety: 4,
    internet: 4,
    comment: '',
  })

  useEffect(() => {
    const fetchEligible = async () => {
      try {
        const res = await getEligibleFeedbackBookings()
        setBookings(res.data.bookings || [])
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load active bookings')
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
      toast.error('Please choose an active booking')
      return
    }

    setSubmitting(true)
    try {
      await submitDailyFeedback({
        pgId: selectedBooking.pg._id,
        bookingId: selectedBooking._id,
        ...form,
      })
      toast.success('Daily feedback submitted')
      setForm((prev) => ({ ...prev, comment: '' }))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit daily feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Daily Feedback</h1>
        <p className="text-sm text-gray-500 mb-6">
          Submit one feedback entry per day while you are staying in the PG.
        </p>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-48" />
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
            No active confirmed booking found for daily feedback.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Booking</label>
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
              {fields.map((field) => (
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
                placeholder="Any issue noticed today? Share details..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-semibold py-3 rounded-xl disabled:opacity-60"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              {submitting ? 'Submitting...' : 'Submit Daily Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
