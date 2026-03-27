import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A6B6B' }}>
              <Home size={14} color="white" />
            </div>
            <span className="text-lg font-bold" style={{ color: '#1A6B6B' }}>NestEase</span>
          </Link>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} NestEase. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-gray-500">
            <Link to="/search" className="hover:text-[#1A6B6B] transition-colors">Find PG</Link>
            <Link to="/register" className="hover:text-[#1A6B6B] transition-colors">List Your PG</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
