import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPG, uploadPGImages } from '../../services/pgService'
import toast from 'react-hot-toast'
import { ChevronLeft } from 'lucide-react'

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Parking', 'Laundry', 'Meals', 'CCTV', 'Gym', 'Power Backup', 'Hot Water', 'TV']

export default function AddPGPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [form, setForm] = useState({
    pgName: '', description: '', address: '', city: '', state: '', pincode: '',
    lat: '', lng: '', price: '', genderAllowed: 'any', availableRooms: '', amenities: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleAmenity = (a: string) => {
    setForm({ ...form, amenities: form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.pgName || !form.address || !form.city || !form.price) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const createRes = await createPG({ ...form, amenities: form.amenities })
      const createdPGId = createRes.data?.pg?._id

      if (createdPGId && images.length > 0) {
        const imageForm = new FormData()
        images.forEach((file) => imageForm.append('images', file))
        await uploadPGImages(createdPGId, imageForm)
      }

      toast.success(images.length > 0 ? 'PG listing and images uploaded successfully.' : 'PG listing created! Awaiting admin approval.')
      navigate('/dashboard/owner')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A6B6B] transition-colors mb-6">
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">Add New PG Listing</h1>
          <p className="text-gray-500 text-sm mb-6">Fill in the details. Your listing will be reviewed before going live.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PG Name <span className="text-red-400">*</span></label>
              <input name="pgName" value={form.pgName} onChange={handleChange} placeholder="e.g. Sunrise PG for Boys" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe your PG..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B] resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-400">*</span></label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-400">*</span></label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bangalore" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Karnataka" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="560001" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (optional)</label>
                <input name="lat" value={form.lat} onChange={handleChange} placeholder="12.9716" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (optional)</label>
                <input name="lng" value={form.lng} onChange={handleChange} placeholder="77.5946" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹) <span className="text-red-400">*</span></label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="5000" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Rooms</label>
                <input type="number" name="availableRooms" value={form.availableRooms} onChange={handleChange} placeholder="5" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1A6B6B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender Allowed</label>
                <select name="genderAllowed" value={form.genderAllowed} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-[#1A6B6B]">
                  <option value="any">Co-ed (Any)</option>
                  <option value="male">Boys Only</option>
                  <option value="female">Girls Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${form.amenities.includes(a) ? 'border-[#1A6B6B] text-[#1A6B6B] bg-[#E8F4F4]' : 'border-gray-200 text-gray-600'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PG Images<span className="text-red-400">*</span></label>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1A6B6B] bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">You can upload up to 10 images. Max size 5MB each.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#1A6B6B' }}
            >
              {loading ? 'Creating listing...' : 'Create PG Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
