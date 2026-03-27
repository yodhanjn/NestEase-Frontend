import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Home } from 'lucide-react'
import { register } from '../services/authService'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') || 'resident'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: defaultRole })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await register(form)
      toast.success('OTP sent to your email!')
      navigate(`/verify-otp?userId=${res.data.userId}&email=${form.email}`)
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      const networkMessage =
        err?.code === 'ERR_NETWORK'
          ? 'Cannot reach server. Make sure backend is running on port 5000.'
          : null
      toast.error(apiMessage || networkMessage || 'Registration failed')
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
            Find your perfect PG accommodation
          </h2>
          <p className="text-white/70 text-lg">
            Join thousands of students and professionals who trust NestEase for verified, transparent PG listings.
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
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#2D2D2D' }}>Create your account</h1>
            <p className="text-gray-500 text-sm mb-6">Already have an account? <Link to="/login" className="font-medium" style={{ color: '#1A6B6B' }}>Sign in</Link></p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl">
                {['resident', 'owner'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${form.role === r ? 'bg-white shadow-sm text-[#1A6B6B]' : 'text-gray-500'}`}
                  >
                    {r === 'resident' ? '🏠 I\'m a Resident' : '🏢 I\'m an Owner'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-400">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
