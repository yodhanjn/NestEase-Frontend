import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, IndianRupee, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRecommendations } from '../../services/recommendationService'

export default function ResidentRecommendationsPage() {
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await getRecommendations()
        setRecommendations(res.data.recommendations || [])
        setSummary(res.data.preferenceSummary || null)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load recommendations')
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#E8F4F4] text-[#1A6B6B] px-3 py-1.5 rounded-full text-xs font-medium mb-3">
            <Sparkles size={14} />
            AI Suggestions
          </div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Recommended PGs for you</h1>
          <p className="text-gray-500 text-sm mt-1">
            Personalized suggestions based on your booking history and preferences.
          </p>
        </div>

        {summary && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <p className="text-sm text-gray-500 mb-2">Preference Summary</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600">
                Avg Budget: {summary.averageBudget ? `₹${summary.averageBudget}` : 'Not enough data'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600">
                Preferred Gender: {summary.preferredGender || 'any'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600">
                Cities: {summary.cities?.length ? summary.cities.join(', ') : 'Not enough data'}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500 text-sm">
              We need a bit more activity to personalize results. Explore listings and complete a booking to improve recommendations.
            </p>
            <Link to="/search" className="inline-block mt-4 text-sm font-medium text-[#1A6B6B]">
              Browse PG Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recommendations.map((item) => {
              const pg = item.pg
              return (
                <div key={pg._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2D2D2D]">{pg.pgName}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={13} /> {pg.location?.city}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F4F4] text-[#1A6B6B] font-medium">
                      Score {item.recommendationScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm mb-3">
                    <p className="text-[#1A6B6B] font-semibold flex items-center gap-0.5">
                      <IndianRupee size={13} />
                      {pg.price}
                    </p>
                    <p className="text-amber-600 flex items-center gap-1">
                      <Star size={13} fill="#F5A623" color="#F5A623" />
                      {pg.overallRating > 0 ? pg.overallRating.toFixed(1) : 'New'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(item.reasons || []).map((reason: string) => (
                      <span key={reason} className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-600">
                        {reason}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/pg/${pg._id}`}
                    className="inline-flex text-sm font-medium text-[#1A6B6B] hover:underline"
                  >
                    View PG Details
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
