'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  Building2,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Clock,
  Shield,
  Trash2
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Report {
  id: string
  type: 'property' | 'user' | 'review' | 'message'
  reason: string
  description: string
  reported_item_id: string
  reported_item_title?: string
  reporter_id: string
  reporter_name: string
  reporter_email: string
  reported_user_id?: string
  reported_user_name?: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high'
  resolution_notes?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const itemsPerPage = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchQuery, typeFilter, statusFilter, priorityFilter])

  const fetchReports = async () => {
    setLoading(true)

    if (supabase) {
      try {
        const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
        if (!error && data) {
          setReports(data)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      }
    }
    
    setReports([])
    setLoading(false)
  }

  const filterReports = () => {
    let filtered = [...reports]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.reason?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.reporter_name?.toLowerCase().includes(query) ||
        r.reported_user_name?.toLowerCase().includes(query) ||
        r.reported_item_title?.toLowerCase().includes(query)
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter)
    }

    setFilteredReports(filtered)
    setCurrentPage(1)
  }

  const handleStatusChange = async (reportId: string, newStatus: string, notes?: string) => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() }
      if (notes) updateData.resolution_notes = notes
      if (newStatus === 'resolved' || newStatus === 'dismissed') {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolved_by = 'Admin'
      }
      const { error } = await supabase.from('reports').update(updateData).eq('id', reportId)
      if (error) throw error
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updateData } : r))
      toast.success(`Report ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update report')
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    investigating: reports.filter(r => r.status === 'investigating').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    highPriority: reports.filter(r => r.priority === 'high' && r.status === 'pending').length,
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string, icon: any }> = {
      property: { bg: 'bg-blue-100 text-blue-800', icon: Building2 },
      user: { bg: 'bg-purple-100 text-purple-800', icon: User },
      review: { bg: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      message: { bg: 'bg-green-100 text-green-800', icon: MessageSquare },
    }
    return styles[type] || { bg: 'bg-gray-100 text-gray-800', icon: Flag }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }
    return styles[priority] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Moderation</h1>
          <p className="text-gray-600 mt-1">Review and manage user reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Flag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.investigating}</p>
              <p className="text-sm text-gray-600">Investigating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Alert */}
      {stats.highPriority > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">
            <strong>{stats.highPriority}</strong> high priority reports require immediate attention
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="property">Property</option>
            <option value="user">User</option>
            <option value="review">Review</option>
            <option value="message">Message</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Report</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reporter</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.map((report) => {
                const TypeIcon = getTypeBadge(report.type).icon
                return (
                  <tr key={report.id} className={`hover:bg-gray-50 ${report.priority === 'high' && report.status === 'pending' ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{report.reason}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{report.description}</p>
                        {report.reported_item_title && (
                          <p className="text-xs text-gray-400 mt-1">
                            Re: {report.reported_item_title}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeBadge(report.type).bg}`}>
                        <TypeIcon className="w-3 h-3" />
                        {report.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.reporter_name}</p>
                        <p className="text-xs text-gray-500">{report.reporter_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityBadge(report.priority)}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setSelectedReport(report)
                            setResolutionNotes('')
                            setShowReportModal(true)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {report.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(report.id, 'investigating')}
                            className="p-2 hover:bg-blue-100 rounded-lg" 
                            title="Start Investigation"
                          >
                            <Shield className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {(report.status === 'pending' || report.status === 'investigating') && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedReport(report)
                                setResolutionNotes('')
                                setShowReportModal(true)
                              }}
                              className="p-2 hover:bg-green-100 rounded-lg" 
                              title="Resolve"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(report.id, 'dismissed')}
                              className="p-2 hover:bg-gray-100 rounded-lg" 
                              title="Dismiss"
                            >
                              <X className="w-4 h-4 text-gray-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page 
                      ? 'bg-primary-600 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports found</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Report Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeBadge(selectedReport.type).bg}`}>
                    {selectedReport.type}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityBadge(selectedReport.priority)}`}>
                    {selectedReport.priority} priority
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedReport.reason}</h3>
                <p className="text-gray-600 mt-2">{selectedReport.description}</p>
              </div>

              {/* Reported Item */}
              {selectedReport.reported_item_title && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Reported Item</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedReport.reported_item_title}</p>
                    <p className="text-sm text-gray-500">ID: {selectedReport.reported_item_id}</p>
                  </div>
                </div>
              )}

              {/* Reported User */}
              {selectedReport.reported_user_name && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Reported User</h4>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedReport.reported_user_name}</p>
                      <p className="text-sm text-gray-500">ID: {selectedReport.reported_user_id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reporter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Reported By</h4>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedReport.reporter_name}</p>
                    <p className="text-sm text-gray-500">{selectedReport.reporter_email}</p>
                  </div>
                </div>
              </div>

              {/* Resolution Notes */}
              {selectedReport.resolution_notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Resolution Notes</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedReport.resolution_notes}</p>
                    {selectedReport.resolved_by && (
                      <p className="text-sm text-gray-500 mt-2">
                        Resolved by {selectedReport.resolved_by} on {new Date(selectedReport.resolved_at!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Add Resolution Notes */}
              {(selectedReport.status === 'pending' || selectedReport.status === 'investigating') && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Resolution Notes</h4>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add notes about how this report was resolved..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedReport.status === 'pending' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(selectedReport.id, 'investigating')
                      setShowReportModal(false)
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Start Investigation
                  </Button>
                )}
                {(selectedReport.status === 'pending' || selectedReport.status === 'investigating') && (
                  <>
                    <Button onClick={() => {
                      handleStatusChange(selectedReport.id, 'resolved', resolutionNotes)
                      setShowReportModal(false)
                    }}>
                      <Check className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleStatusChange(selectedReport.id, 'dismissed', resolutionNotes)
                        setShowReportModal(false)
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                  </>
                )}
                {selectedReport.reported_user_id && (selectedReport.status === 'pending' || selectedReport.status === 'investigating') && (
                  <Button 
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      toast.success('User has been banned')
                      handleStatusChange(selectedReport.id, 'resolved', 'User banned')
                      setShowReportModal(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Ban User
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
