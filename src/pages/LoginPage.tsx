import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      const storedUser = localStorage.getItem('nestease_user')
      const user = storedUser ? JSON.parse(storedUser) : null
      if (user?.role === 'admin') navigate('/dashboard/admin')
      else if (user?.role === 'owner') navigate('/dashboard/owner')
      else navigate('/dashboard/resident')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed'
      if (err.response?.data?.userId) {
        toast.error('Please verify your email first')
        navigate(`/verify-otp?userId=${err.response.data.userId}&email=${form.email}`)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: '#1A6B6B' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Home size={16} color="white" />
          </div>
          <span className="text-xl font-bold text-white">NestEase</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back to NestEase
          </h2>
          <p className="text-white/70 text-lg">
            Your trusted platform for finding and managing PG accommodations.
          </p>
        </div>
        <div className="flex gap-6 text-white/60 text-sm">
          <span>500+ Verified PGs</span>
          <span>10K+ Happy Residents</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#2D2D2D' }}>Sign in to your account</h1>
            <p className="text-gray-500 text-sm mb-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium" style={{ color: '#1A6B6B' }}>Create one</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B] transition-colors pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 mt-2"
                style={{ backgroundColor: '#1A6B6B' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
