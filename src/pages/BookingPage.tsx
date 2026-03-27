import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPGById } from '../services/pgService'
import { createBooking } from '../services/bookingService'
import toast from 'react-hot-toast'
import { ChevronLeft, IndianRupee, MapPin } from 'lucide-react'

export default function BookingPage() {
  const { pgId } = useParams()
  const navigate = useNavigate()
  const [pg, setPg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    note: '',
  })

  useEffect(() => {
    const fetchPg = async () => {
      try {
        const res = await getPGById(pgId!)
        setPg(res.data.pg)
      } catch {
        toast.error('PG not found')
        navigate('/search')
      } finally {
        setLoading(false)
      }
    }
    if (pgId) fetchPg()
  }, [pgId, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.checkInDate || !form.checkOutDate) {
      toast.error('Please select check-in and check-out dates')
      return
    }
    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) {
      toast.error('Check-out must be after check-in')
      return
    }

    setSubmitting(true)
    try {
      await createBooking({
        pgId: pgId!,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        note: form.note,
      })
      toast.success('Booking request submitted')
      navigate('/dashboard/resident/bookings')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1A6B6B] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A6B6B] transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#2D2D2D] mb-4">Book This PG</h1>
          <div className="flex items-start gap-4">
            <div className="w-28 h-24 rounded-lg overflow-hidden bg-gray-100">
              {pg?.images?.[0] ? (
                <img src={pg.images[0]} alt={pg.pgName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">🏠</div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-[#2D2D2D]">{pg?.pgName}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {pg?.location?.address}, {pg?.location?.city}
              </p>
              <p className="mt-2 text-[#1A6B6B] font-semibold flex items-center gap-1">
                <IndianRupee size={14} />
                {pg?.price?.toLocaleString('en-IN')}/month
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date</label>
              <input
                type="date"
                value={form.checkInDate}
                onChange={(e) => setForm((prev) => ({ ...prev, checkInDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date</label>
              <input
                type="date"
                value={form.checkOutDate}
                onChange={(e) => setForm((prev) => ({ ...prev, checkOutDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Any special request for the owner..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-semibold py-3 rounded-xl disabled:opacity-60"
            style={{ backgroundColor: '#1A6B6B' }}
          >
            {submitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
