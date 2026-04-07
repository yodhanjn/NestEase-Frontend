import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getAllPGs } from '../services/pgService'
import PGCard from '../components/ui/PGCard'
import toast from 'react-hot-toast'

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Parking', 'Laundry', 'Meals', 'CCTV', 'Gym', 'Power Backup']

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pgs, setPGs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    gender: '',
    amenities: '',
    rating: '',
    sort: '',
    page: 1,
  })

  const fetchPGs = async (f = filters) => {
    setLoading(true)
    try {
      const res = await getAllPGs({ ...f, minPrice: f.minPrice ? Number(f.minPrice) : undefined, maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined, rating: f.rating ? Number(f.rating) : undefined })
      setPGs(res.data.pgs)
      setTotal(res.data.total)
    } catch {
      toast.error('Failed to load PG listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPGs()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, page: 1 }
    setFilters(newFilters)
    fetchPGs(newFilters)
    setSearchParams(filters.city ? { city: filters.city } : {})
  }

  const clearFilters = () => {
    const reset = { city: '', minPrice: '', maxPrice: '', gender: '', amenities: '', rating: '', sort: '', page: 1 }
    setFilters(reset)
    fetchPGs(reset)
    setSearchParams({})
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by city..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              {filters.city && (
                <button type="button" onClick={() => setFilters({ ...filters, city: '' })}>
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white text-gray-600 w-full sm:w-auto"
            >
              <option value="">Sort: Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors w-full sm:w-auto ${showFilters ? 'border-[#1A6B6B] text-[#1A6B6B] bg-[#E8F4F4]' : 'border-gray-200 text-gray-600'}`}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>

            <button
              type="submit"
              className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              Search
            </button>
          </form>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Min Price (₹/mo)</label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1A6B6B]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Max Price (₹/mo)</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1A6B6B]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#1A6B6B]"
                >
                  <option value="">Any</option>
                  <option value="male">Boys</option>
                  <option value="female">Girls</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Min Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#1A6B6B]"
                >
                  <option value="">Any</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-4">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => {
                    const selected = filters.amenities.split(',').includes(a)
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          const list = filters.amenities ? filters.amenities.split(',') : []
                          const updated = selected ? list.filter((x) => x !== a) : [...list, a]
                          setFilters({ ...filters, amenities: updated.join(',') })
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected ? 'border-[#1A6B6B] text-[#1A6B6B] bg-[#E8F4F4]' : 'border-gray-200 text-gray-600'}`}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="col-span-2 md:col-span-4 flex justify-end">
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${total} PG${total !== 1 ? 's' : ''} found${filters.city ? ` in ${filters.city}` : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : pgs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No PGs found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search a different city</p>
            <button onClick={clearFilters} className="mt-4 text-sm font-medium" style={{ color: '#1A6B6B' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pgs.map((pg) => <PGCard key={pg._id} pg={pg} />)}
          </div>
        )}
      </div>
    </div>
  )
}
