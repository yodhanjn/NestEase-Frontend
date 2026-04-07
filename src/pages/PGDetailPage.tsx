import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, IndianRupee, Users, Wifi, Shield, Phone, Mail, ChevronLeft, MessageCircle, Flag } from 'lucide-react'
import { getPGById } from '../services/pgService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { submitFraudReport } from '../services/reportService'

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function PGDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pg, setPG] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reportForm, setReportForm] = useState({ reason: '', details: '' })

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const res = await getPGById(id!)
        setPG(res.data.pg)
      } catch {
        toast.error('PG not found')
        navigate('/search')
      } finally {
        setLoading(false)
      }
    }
    fetchPG()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1A6B6B] border-t-transparent" />
      </div>
    )
  }

  if (!pg) return null

  const genderLabel = pg.genderAllowed === 'male' ? 'Boys Only' : pg.genderAllowed === 'female' ? 'Girls Only' : 'Co-ed'

  const handleReportListing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportForm.reason) {
      toast.error('Please select a report reason')
      return
    }
    setReporting(true)
    try {
      await submitFraudReport({
        reportedPgId: pg._id,
        reason: reportForm.reason,
        details: reportForm.details,
      })
      toast.success('Report submitted. Admin will review it.')
      setShowReportForm(false)
      setReportForm({ reason: '', details: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit report')
    } finally {
      setReporting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A6B6B] transition-colors mb-6">
          <ChevronLeft size={16} />
          Back to search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-72 md:h-96 bg-gray-100 relative">
                {pg.images.length > 0 ? (
                  <img src={pg.images[activeImage]} alt={pg.pgName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
                )}
                {pg.isVerified && (
                  <span className="absolute top-4 left-4 bg-[#1A6B6B] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              {pg.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {pg.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-[#1A6B6B]' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#2D2D2D]">{pg.pgName}</h1>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                    <MapPin size={14} />
                    <span>{pg.location.address}, {pg.location.city}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-0.5 text-[#1A6B6B] font-bold text-xl">
                    <IndianRupee size={16} />
                    <span>{pg.price.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-xs text-gray-400">per month</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <span className="flex items-center gap-1.5 text-sm bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">
                  <Star size={13} fill="#F5A623" color="#F5A623" />
                  {pg.overallRating > 0 ? pg.overallRating.toFixed(1) : 'No ratings yet'}
                  {pg.totalReviews > 0 && ` (${pg.totalReviews} reviews)`}
                </span>
                <span className="text-sm bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full">{genderLabel}</span>
                <span className="flex items-center gap-1.5 text-sm bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full">
                  <Users size={13} />
                  {pg.availableRooms} rooms available
                </span>
              </div>

              {pg.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{pg.description}</p>
              )}

              {/* Amenities */}
              {pg.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#2D2D2D] mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {pg.amenities.map((a: string) => (
                      <span key={a} className="flex items-center gap-1.5 text-sm bg-[#E8F4F4] text-[#1A6B6B] px-3 py-1.5 rounded-full">
                        {a === 'WiFi' ? <Wifi size={13} /> : a === 'CCTV' ? <Shield size={13} /> : null}
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            {pg.location.lat && pg.location.lng && (
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="font-semibold text-[#2D2D2D]">Location</h3>
                </div>
                <div className="h-56 sm:h-64">
                  <MapContainer
                    center={[pg.location.lat, pg.location.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[pg.location.lat, pg.location.lng]}>
                      <Popup>{pg.pgName}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Owner Card + Booking */}
          <div className="space-y-5">
            {/* Book Now */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:sticky lg:top-24">
              <div className="flex items-center gap-0.5 text-[#1A6B6B] font-bold text-2xl mb-1">
                <IndianRupee size={18} />
                <span>{pg.price.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-gray-400 text-sm mb-5">per month, all inclusive</p>

              {user ? (
                user.role === 'resident' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/booking/${pg._id}`)}
                      className="w-full text-white font-semibold py-3 rounded-xl transition-colors"
                      style={{ backgroundColor: '#1A6B6B' }}
                    >
                      Book Now
                    </button>
                    {pg.owner?._id && (
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/resident/chat?pgId=${pg._id}&userId=${pg.owner._id}&name=${encodeURIComponent(
                              pg.owner.name || 'Owner'
                            )}&pgName=${encodeURIComponent(pg.pgName)}`
                          )
                        }
                        className="w-full font-semibold py-3 rounded-xl transition-colors border border-[#1A6B6B] text-[#1A6B6B] flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Chat with Owner
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center">Only residents can book PGs</p>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-white font-semibold py-3 rounded-xl transition-colors"
                  style={{ backgroundColor: '#1A6B6B' }}
                >
                  Login to Book
                </button>
              )}

              <div className="mt-4 pt-4 border-t border-gray-50 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[#1A6B6B]" />
                  <span>Verified & secure booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-[#F5A623]" />
                  <span>Honest resident reviews</span>
                </div>
              </div>

              {user && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowReportForm((prev) => !prev)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <Flag size={14} />
                    {showReportForm ? 'Cancel Report' : 'Report this listing'}
                  </button>
                </div>
              )}

              {showReportForm && user && (
                <form onSubmit={handleReportListing} className="mt-3 p-3 rounded-xl border border-red-100 bg-red-50/40 space-y-2">
                  <select
                    value={reportForm.reason}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full border border-red-100 rounded-lg px-3 py-2 text-xs outline-none bg-white"
                  >
                    <option value="">Select reason</option>
                    <option value="Fake photos">Fake photos</option>
                    <option value="Wrong location details">Wrong location details</option>
                    <option value="Price mismatch">Price mismatch</option>
                    <option value="Safety concerns">Safety concerns</option>
                    <option value="Owner misconduct">Owner misconduct</option>
                    <option value="Possible fraud or scam">Possible fraud or scam</option>
                  </select>
                  <textarea
                    value={reportForm.details}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, details: e.target.value }))}
                    rows={2}
                    placeholder="Optional details for admin review..."
                    className="w-full border border-red-100 rounded-lg px-3 py-2 text-xs outline-none resize-none bg-white"
                  />
                  <button
                    type="submit"
                    disabled={reporting}
                    className="w-full text-white text-xs font-medium py-2 rounded-lg disabled:opacity-60"
                    style={{ backgroundColor: '#CC2D2D' }}
                  >
                    {reporting ? 'Submitting...' : 'Submit Fraud Report'}
                  </button>
                </form>
              )}
            </div>

            {/* Owner Info */}
            {pg.owner && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-[#2D2D2D] mb-4">PG Owner</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A6B6B] flex items-center justify-center text-white font-semibold">
                    {pg.owner.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[#2D2D2D] text-sm">{pg.owner.name}</p>
                    <p className="text-xs text-gray-400">PG Owner</p>
                  </div>
                </div>
                {user && (
                  <div className="space-y-2">
                    {pg.owner.phone && (
                      <a href={`tel:${pg.owner.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1A6B6B] transition-colors">
                        <Phone size={14} />
                        {pg.owner.phone}
                      </a>
                    )}
                    <a href={`mailto:${pg.owner.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1A6B6B] transition-colors">
                      <Mail size={14} />
                      {pg.owner.email}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
