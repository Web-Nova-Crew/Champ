'use client'

import { useState, useEffect } from 'react'
import { 
  Star, 
  Search,
  Check,
  X,
  Eye,
  Trash2,
  MessageSquare,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  Flag
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Review {
  id: string
  property_id: string
  property_title: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  title: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  reported: boolean
  created_at: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const itemsPerPage = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchQuery, statusFilter])

  const fetchReviews = async () => {
    setLoading(true)
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`*, properties:property_id(title), users:user_id(name, avatar_url)`)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setReviews((data || []).map((r: any) => ({
            ...r,
            property_title: r.properties?.title || r.property_id,
            user_name: r.users?.name || r.user_id,
            user_avatar: r.users?.avatar_url,
          })))
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      }
    }
    
    setReviews([])
    setLoading(false)
  }

  const filterReviews = () => {
    let filtered = [...reviews]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.property_title.toLowerCase().includes(query) ||
        r.user_name.toLowerCase().includes(query) ||
        r.comment.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'reported') {
        filtered = filtered.filter(r => r.reported)
      } else {
        filtered = filtered.filter(r => r.status === statusFilter)
      }
    }

    setFilteredReviews(filtered)
    setCurrentPage(1)
  }

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('reviews').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      toast.success(`Review ${newStatus}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update review')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error
      setReviews(prev => prev.filter(r => r.id !== id))
      toast.success('Review deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review')
    }
  }

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    reported: reviews.filter(r => r.reported).length,
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-600 mt-1">Approve or reject property reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-gray-600">Approved</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-gray-600">Rejected</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-orange-600">{stats.reported}</p>
          <p className="text-sm text-gray-600">Reported</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reported">Reported</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {paginatedReviews.map((review) => (
            <div key={review.id} className={`p-4 hover:bg-gray-50 ${review.reported ? 'bg-red-50/50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user_name}</span>
                    {renderStars(review.rating)}
                    {review.reported && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        Reported
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {review.property_title}
                  </p>
                  <p className="font-medium text-gray-900">{review.title}</p>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(review.id, 'approved')}
                        className="p-2 hover:bg-green-100 rounded-lg"
                        title="Approve"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                        className="p-2 hover:bg-red-100 rounded-lg"
                        title="Reject"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paginatedReviews.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Review Details</h2>
              <button onClick={() => setSelectedReview(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedReview.user_name}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedReview.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Property</p>
                <p className="font-medium text-gray-900">{selectedReview.property_title}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                {renderStars(selectedReview.rating)}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Review</p>
                <p className="font-medium text-gray-900">{selectedReview.title}</p>
                <p className="text-gray-600 mt-1">{selectedReview.comment}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedReview.status === 'approved' ? 'bg-green-100 text-green-700' :
                  selectedReview.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedReview.status}
                </span>
                {selectedReview.reported && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Reported</span>
                )}
              </div>

              <div className="flex gap-2">
                {selectedReview.status === 'pending' && (
                  <>
                    <Button onClick={() => { handleStatusChange(selectedReview.id, 'approved'); setSelectedReview(null); }}>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => { handleStatusChange(selectedReview.id, 'rejected'); setSelectedReview(null); }}>
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { handleDelete(selectedReview.id); setSelectedReview(null); }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
