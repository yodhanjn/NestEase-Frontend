import { useEffect, useMemo, useState } from 'react'
import {
  actOnFraudReport,
  approvePG,
  getFraudReports,
  getAdminPGStats,
  getPendingPGs,
  getUnderperformingPGs,
  rejectPG,
  removePG,
} from '../../services/adminService'
import toast from 'react-hot-toast'
import { CheckCircle2, Flag, MapPin, ShieldAlert, Star, Trash2, XCircle } from 'lucide-react'

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
  const [fraudReports, setFraudReports] = useState<any[]>([])
  const [filters, setFilters] = useState({
    ratingThreshold: 3,
    minReviews: 5,
  })
  const [reportFilter, setReportFilter] = useState('open')

  const hasAnyWork = useMemo(
    () => pendingPGs.length > 0 || underperformingPGs.length > 0 || fraudReports.length > 0,
    [pendingPGs, underperformingPGs, fraudReports]
  )

  const fetchAll = async () => {
    try {
      const [statsRes, pendingRes, underperformingRes, reportsRes] = await Promise.all([
        getAdminPGStats(),
        getPendingPGs(),
        getUnderperformingPGs(filters.ratingThreshold, filters.minReviews),
        getFraudReports(reportFilter),
      ])

      setStats(statsRes.data.stats)
      setPendingPGs(pendingRes.data.pgs || [])
      setUnderperformingPGs(underperformingRes.data.pgs || [])
      setFraudReports(reportsRes.data.reports || [])
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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRes = await getFraudReports(reportFilter)
        setFraudReports(reportsRes.data.reports || [])
      } catch {
        // keep existing list and avoid blocking other dashboard sections
      }
    }
    fetchReports()
  }, [reportFilter])

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

  const handleReportAction = async (
    reportId: string,
    status: 'under_review' | 'resolved' | 'dismissed',
    action: 'none' | 'flag_pg' | 'deactivate_pg'
  ) => {
    setActionLoadingId(reportId)
    try {
      const res = await actOnFraudReport(reportId, { status, action })
      const updated = res.data.report
      setFraudReports((prev) => prev.map((item) => (item._id === reportId ? updated : item)))
      toast.success('Fraud report updated')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update report')
    } finally {
      setActionLoadingId(null)
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

            <section className="bg-white border border-gray-100 rounded-2xl p-6 mt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Flag size={18} className="text-red-600" />
                  <h2 className="text-lg font-semibold text-[#2D2D2D]">Fraud Reports</h2>
                </div>
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {fraudReports.length === 0 ? (
                <p className="text-sm text-gray-500">No fraud reports in this filter.</p>
              ) : (
                <div className="space-y-4">
                  {fraudReports.map((report) => (
                    <div key={report._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#2D2D2D]">
                            {report.reportedPg?.pgName || 'Listing removed'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Reason: <span className="font-medium">{report.reason}</span> | Risk Score:{' '}
                            <span className="font-medium">{report.riskScore}</span> | Status:{' '}
                            <span className="font-medium">{report.status}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            By: {report.reportedBy?.name || 'System'} ({report.reportedBy?.email || 'N/A'})
                          </p>
                          {report.details ? (
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5">
                              {report.details}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            disabled={actionLoadingId === report._id}
                            onClick={() => handleReportAction(report._id, 'under_review', 'flag_pg')}
                            className="text-xs px-3 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            Mark Under Review
                          </button>
                          <button
                            disabled={actionLoadingId === report._id}
                            onClick={() => handleReportAction(report._id, 'resolved', 'deactivate_pg')}
                            className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Resolve + Deactivate
                          </button>
                          <button
                            disabled={actionLoadingId === report._id}
                            onClick={() => handleReportAction(report._id, 'dismissed', 'none')}
                            className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </div>
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
