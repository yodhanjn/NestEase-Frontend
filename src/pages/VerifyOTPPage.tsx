import { useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { verifyOTP, resendOTP } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Home } from 'lucide-react'

export default function VerifyOTPPage() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId') || ''
  const email = searchParams.get('email') || ''
  const navigate = useNavigate()
  const { setAuthData } = useAuth()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [fetchingOtp, setFetchingOtp] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await verifyOTP({ userId, otp: otpString })
      setAuthData(res.data.token, res.data.user)
      toast.success('Email verified! Welcome to NestEase 🎉')
      const role = res.data.user.role
      navigate(role === 'owner' ? '/dashboard/owner' : '/dashboard/resident')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendOTP({ userId })
      toast.success('New OTP sent to your email')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const handleFetchOTP = async () => {
    setFetchingOtp(true)
    try {
      const res = await api.get(`/auth/dev/otp/${userId}`)
      const fetchedOtp = res.data.otp
      const digits = fetchedOtp.split('')
      setOtp(digits)
      toast.success(`OTP fetched: ${fetchedOtp}`)
    } catch {
      toast.error('Could not fetch OTP')
    } finally {
      setFetchingOtp(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1A6B6B' }}>
              <Home size={18} color="white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1A6B6B' }}>NestEase</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F4F4' }}>
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2D2D2D' }}>Verify your email</h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a 6-digit OTP to <span className="font-medium text-[#2D2D2D]">{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-colors focus:border-[#1A6B6B]"
                  style={{ borderColor: digit ? '#1A6B6B' : '#E5E7EB' }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            Didn't receive the OTP?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-medium disabled:opacity-50"
              style={{ color: '#1A6B6B' }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Email not arriving? (Dev mode)</p>
            <button
              onClick={handleFetchOTP}
              disabled={fetchingOtp}
              className="text-xs font-medium px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-[#1A6B6B] hover:text-[#1A6B6B] transition-colors disabled:opacity-50"
            >
              {fetchingOtp ? 'Fetching...' : 'Auto-fill OTP (Dev)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
