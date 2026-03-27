import { useEffect, useMemo, useState } from 'react'
import {
  approvePG,
  getAdminPGStats,
  getPendingPGs,
  getUnderperformingPGs,
  rejectPG,
  removePG,
} from '../../services/adminService'
import toast from 'react-hot-toast'
import { CheckCircle2, MapPin, ShieldAlert, Star, Trash2, XCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [stats, setStats] = useState({
    pending: 0,
    verifiedActive: 0,
    removed: 0,
    total: 0,
  })

  const [pendingPGs, setPendingPGs] = useState<any[]>([])
  const [underperformingPGs, setUnderperformingPGs] = useState<any[]>([])
  const [filters, setFilters] = useState({
    ratingThreshold: 3,
    minReviews: 5,
  })

  const hasAnyWork = useMemo(
    () => pendingPGs.length > 0 || underperformingPGs.length > 0,
    [pendingPGs, underperformingPGs]
  )

  const fetchAll = async () => {
    try {
      const [statsRes, pendingRes, underperformingRes] = await Promise.all([
        getAdminPGStats(),
        getPendingPGs(),
        getUnderperformingPGs(filters.ratingThreshold, filters.minReviews),
      ])

      setStats(statsRes.data.stats)
      setPendingPGs(pendingRes.data.pgs || [])
      setUnderperformingPGs(underperformingRes.data.pgs || [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load admin dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApprove = async (id: string) => {
    setActionLoadingId(id)
    try {
      await approvePG(id)
      toast.success('PG approved successfully')
      setPendingPGs((prev) => prev.filter((pg) => pg._id !== id))
      setStats((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        verifiedActive: prev.verifiedActive + 1,
      }))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve PG')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoadingId(id)
    try {
      await rejectPG(id)
      toast.success('PG rejected and removed from listings')
      setPendingPGs((prev) => prev.filter((pg) => pg._id !== id))
      setStats((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        removed: prev.removed + 1,
      }))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject PG')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRemoveUnderperforming = async (id: string) => {
    setActionLoadingId(id)
    try {
      await removePG(id)
      toast.success('Underperforming PG removed')
      setUnderperformingPGs((prev) => prev.filter((pg) => pg._id !== id))
      setStats((prev) => ({
        ...prev,
        verifiedActive: Math.max(prev.verifiedActive - 1, 0),
        removed: prev.removed + 1,
      }))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove PG')
    } finally {
      setActionLoadingId(null)
    }
  }

  const refreshUnderperforming = async () => {
    try {
      const res = await getUnderperformingPGs(filters.ratingThreshold, filters.minReviews)
      setUnderperformingPGs(res.data.pgs || [])
      toast.success('Performance filter applied')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to filter underperforming PGs')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Approve new PG listings and remove poorly performing PGs.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Pending Approval</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Verified Active</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.verifiedActive}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Removed</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.removed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Total PGs</p>
            <p className="text-3xl font-bold text-[#1A6B6B] mt-1">{stats.total}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-40 animate-pulse" />
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-40 animate-pulse" />
          </div>
        ) : (
          <>
            <section className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={18} className="text-amber-600" />
                <h2 className="text-lg font-semibold text-[#2D2D2D]">Pending PG Approvals</h2>
              </div>

              {pendingPGs.length === 0 ? (
                <p className="text-sm text-gray-500">No pending listings to approve.</p>
              ) : (
                <div className="space-y-4">
                  {pendingPGs.map((pg) => (
                    <div key={pg._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#2D2D2D]">{pg.pgName}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {pg.location?.address}, {pg.location?.city}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Owner: {pg.owner?.name} ({pg.owner?.email})
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoadingId === pg._id}
                            onClick={() => handleApprove(pg._id)}
                            className="text-xs px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            disabled={actionLoadingId === pg._id}
                            onClick={() => handleReject(pg._id)}
                            className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-red-600" />
                  <h2 className="text-lg font-semibold text-[#2D2D2D]">Underperforming PGs</h2>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={filters.ratingThreshold}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, ratingThreshold: Number(e.target.value) || 3 }))
                    }
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none"
                    title="Rating threshold"
                  />
                  <input
                    type="number"
                    min={1}
                    value={filters.minReviews}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, minReviews: Number(e.target.value) || 5 }))
                    }
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none"
                    title="Minimum reviews"
                  />
                  <button
                    onClick={refreshUnderperforming}
                    className="text-xs px-3 py-2 rounded-lg border border-[#1A6B6B] text-[#1A6B6B] hover:bg-[#E8F4F4]"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {underperformingPGs.length === 0 ? (
                <p className="text-sm text-gray-500">No underperforming PGs for current criteria.</p>
              ) : (
                <div className="space-y-4">
                  {underperformingPGs.map((pg) => (
                    <div key={pg._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#2D2D2D]">{pg.pgName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Rating: <span className="font-medium">{pg.overallRating?.toFixed?.(1) || 0}</span> | Reviews:{' '}
                            <span className="font-medium">{pg.totalReviews || 0}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Owner: {pg.owner?.name} ({pg.owner?.email})
                          </p>
                        </div>
                        <button
                          disabled={actionLoadingId === pg._id}
                          onClick={() => handleRemoveUnderperforming(pg._id)}
                          className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove Listing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {!hasAnyWork && (
              <div className="text-center text-sm text-gray-400 mt-6">
                No moderation actions needed right now.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
