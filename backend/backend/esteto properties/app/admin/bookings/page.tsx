'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Building2,
  CalendarCheck,
  CalendarX,
  CalendarClock
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  property_id: string
  property_title: string
  property_location: string
  user_id: string
  user_name: string
  user_email: string
  user_phone?: string
  owner_id: string
  owner_name: string
  owner_email: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const itemsPerPage = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchQuery, statusFilter, dateFilter])

  const fetchBookings = async () => {
    setLoading(true)

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            properties (title, location),
            users!bookings_user_id_fkey (full_name, email, phone)
          `)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setBookings(data)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
      }
    }
    
    setBookings([])
    setLoading(false)
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b => 
        b.property_title?.toLowerCase().includes(query) ||
        b.user_name?.toLowerCase().includes(query) ||
        b.user_email?.toLowerCase().includes(query) ||
        b.property_location?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date)
        bookingDate.setHours(0, 0, 0, 0)
        
        switch (dateFilter) {
          case 'today':
            return bookingDate.getTime() === today.getTime()
          case 'upcoming':
            return bookingDate.getTime() > today.getTime()
          case 'past':
            return bookingDate.getTime() < today.getTime()
          default:
            return true
        }
      })
    }

    setFilteredBookings(filtered)
    setCurrentPage(1)
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId)

      if (error) throw error
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus as Booking['status'] } : b
      ))
      toast.success(`Booking ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update booking')
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Manage property visit bookings and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBookings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {
            const headers = ['Property', 'Location', 'Visitor', 'Email', 'Phone', 'Owner', 'Date', 'Time', 'Status', 'Created']
            const rows = filteredBookings.map(b => [b.property_title, b.property_location, b.user_name, b.user_email, b.user_phone || '', b.owner_name, b.date, b.time, b.status, new Date(b.created_at).toLocaleDateString()])
            const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`; a.click()
            toast.success('Bookings exported')
          }}>
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
              <Calendar className="w-5 h-5 text-blue-600" />
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
              <CalendarClock className="w-5 h-5 text-yellow-600" />
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
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <CalendarX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property, user, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Visitor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{booking.property_title}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{booking.property_location}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{booking.user_name}</p>
                      <p className="text-sm text-gray-500">{booking.user_email}</p>
                      {booking.user_phone && (
                        <p className="text-sm text-gray-500">{booking.user_phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500">{booking.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowBookingModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="p-2 hover:bg-green-100 rounded-lg" 
                            title="Confirm"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="p-2 hover:bg-red-100 rounded-lg" 
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          className="p-2 hover:bg-green-100 rounded-lg" 
                          title="Mark Completed"
                        >
                          <CalendarCheck className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
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

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Property Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Property</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{selectedBooking.property_title}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    {selectedBooking.property_location}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Schedule</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">
                      {new Date(selectedBooking.date).toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">{selectedBooking.time}</span>
                  </div>
                </div>
              </div>

              {/* Visitor Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Visitor</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.user_email}</span>
                  </div>
                  {selectedBooking.user_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedBooking.user_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Property Owner</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.owner_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.owner_email}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button onClick={() => {
                      handleStatusChange(selectedBooking.id, 'confirmed')
                      setShowBookingModal(false)
                    }}>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'cancelled')
                        setShowBookingModal(false)
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button onClick={() => {
                    handleStatusChange(selectedBooking.id, 'completed')
                    setShowBookingModal(false)
                  }}>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Mark Completed
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowBookingModal(false)}
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
