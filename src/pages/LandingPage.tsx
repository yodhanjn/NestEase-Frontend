import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Shield, Star, MessageCircle, MapPin, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const [searchCity, setSearchCity] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/search${searchCity ? `?city=${searchCity}` : ''}`)
  }

  const features = [
    { icon: <Shield size={22} />, title: 'Verified Listings', desc: 'Every PG is reviewed and verified by our admin team before going live.' },
    { icon: <Star size={22} />, title: 'Honest Reviews', desc: 'Only verified residents can submit reviews — no fake feedback.' },
    { icon: <MessageCircle size={22} />, title: 'Direct Chat', desc: 'Message PG owners directly before making any booking decision.' },
    { icon: <MapPin size={22} />, title: 'Map View', desc: 'See exact PG locations and nearby landmarks on an interactive map.' },
  ]

  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai']

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4" style={{ backgroundColor: '#E8F4F4', color: '#1A6B6B' }}>
              Where Comfort Meets Convenience
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: '#2D2D2D' }}>
              Find Your Perfect <span style={{ color: '#1A6B6B' }}>PG Accommodation</span> with Confidence
            </h1>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Search verified PGs, read honest daily feedback, and book your room — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm max-w-xl mx-auto">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin size={18} color="#1A6B6B" />
                <input
                  type="text"
                  placeholder="Search by city (e.g. Bangalore)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                style={{ backgroundColor: '#1A6B6B' }}
              >
                <Search size={16} />
                Search
              </button>
            </form>

            {/* Quick city links */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => navigate(`/search?city=${city}`)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#1A6B6B] hover:text-[#1A6B6B] transition-colors bg-white"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: '#1A6B6B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: '500+', label: 'Verified PGs' },
              { value: '10K+', label: 'Happy Residents' },
              { value: '50+', label: 'Cities' },
              { value: '4.8★', label: 'Avg Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-75 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#2D2D2D' }}>Why Choose NestEase?</h2>
            <p className="text-gray-500 mt-3">Everything you need to find a trustworthy PG</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4F4', color: '#1A6B6B' }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#2D2D2D] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#2D2D2D' }}>How It Works</h2>
            <p className="text-gray-500 mt-3">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '01', title: 'Search', desc: 'Enter your city and filter by budget, amenities, and gender preference.' },
              { step: '02', title: 'Compare', desc: 'Read verified reviews, view photos, and check the map location.' },
              { step: '03', title: 'Book', desc: 'Send a booking request and chat directly with the PG owner.' },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white mb-4" style={{ backgroundColor: '#1A6B6B' }}>
                  {item.step}
                </div>
                {i < 2 && <ChevronRight size={20} className="absolute right-0 top-5 text-gray-300 hidden md:block" />}
                <h3 className="font-semibold text-[#2D2D2D] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#2D2D2D' }}>Ready to Find Your New Home?</h2>
          <p className="text-gray-500 mb-8">Join thousands of students and professionals who found their perfect PG on NestEase.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/search')}
              className="text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              Find a PG
            </button>
            <button
              onClick={() => navigate('/register?role=owner')}
              className="font-semibold px-8 py-3 rounded-xl border-2 transition-colors"
              style={{ borderColor: '#1A6B6B', color: '#1A6B6B' }}
            >
              List Your PG
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
