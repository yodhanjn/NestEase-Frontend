import { MapPin, Star, IndianRupee, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PGCardProps {
  pg: {
    _id: string
    pgName: string
    location: { address: string; city: string }
    price: number
    overallRating: number
    totalReviews: number
    images: string[]
    genderAllowed: string
    availableRooms: number
    amenities: string[]
    isVerified: boolean
  }
}

export default function PGCard({ pg }: PGCardProps) {
  const genderLabel = pg.genderAllowed === 'male' ? 'Boys' : pg.genderAllowed === 'female' ? 'Girls' : 'Co-ed'
  const genderColor = pg.genderAllowed === 'male' ? 'bg-blue-50 text-blue-600' : pg.genderAllowed === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-green-50 text-green-600'

  return (
    <Link to={`/pg/${pg._id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {pg.images.length > 0 ? (
          <img
            src={pg.images[0]}
            alt={pg.pgName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <span className="text-gray-300 text-4xl">🏠</span>
          </div>
        )}
        {pg.isVerified && (
          <span className="absolute top-3 left-3 bg-[#1A6B6B] text-white text-xs font-semibold px-2 py-1 rounded-full">
            Verified
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${genderColor}`}>
          {genderLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#2D2D2D] text-base truncate group-hover:text-[#1A6B6B] transition-colors">
          {pg.pgName}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
          <MapPin size={13} />
          <span className="truncate">{pg.location.address}, {pg.location.city}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star size={14} fill="#F5A623" color="#F5A623" />
            <span className="text-sm font-semibold text-[#2D2D2D]">
              {pg.overallRating > 0 ? pg.overallRating.toFixed(1) : 'New'}
            </span>
            {pg.totalReviews > 0 && (
              <span className="text-xs text-gray-400">({pg.totalReviews})</span>
            )}
          </div>
          <div className="flex items-center gap-0.5 text-[#1A6B6B] font-bold text-base">
            <IndianRupee size={14} />
            <span>{pg.price.toLocaleString('en-IN')}</span>
            <span className="text-xs font-normal text-gray-400">/mo</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            <span>{pg.availableRooms} rooms available</span>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {pg.amenities.slice(0, 2).map((a) => (
              <span key={a} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{a}</span>
            ))}
            {pg.amenities.length > 2 && (
              <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">+{pg.amenities.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
