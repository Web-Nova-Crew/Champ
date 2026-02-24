'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Phone, MessageSquare, Mail, Eye, ChevronLeft, ChevronRight,
  Download, RefreshCw, Calendar, User, Building2, Filter, X, Save
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Enquiry {
  id: string
  property_id: string
  property_title?: string
  user_id?: string
  owner_id?: string
  type: 'general' | 'call_click' | 'whatsapp_click' | 'email' | 'booking' | 'chat'
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'contacted' | 'interested' | 'closed' | 'spam'
  assigned_to?: string
  call_notes?: string
  follow_up_date?: string
  source: string
  created_at: string
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [callNotes, setCallNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const itemsPerPage = 15
  const supabase = createSupabaseClient()

  useEffect(() => { fetchEnquiries() }, [])

  const fetchEnquiries = async () => {
    setLoading(true)

    if (supabase) {
      try {
        const { data, error } = await supabase.from('enquiries').select(`
          *,
          properties:property_id(title)
        `).order('created_at', { ascending: false })

        if (!error && data) {
          setEnquiries((data || []).map((e: any) => ({ ...e, property_title: e.properties?.title })))
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to fetch enquiries:', error)
      }
    }
    
    setEnquiries([])
    setLoading(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('enquiries').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus as Enquiry['status'] } : e))
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('enquiries').update({
        call_notes: callNotes,
        follow_up_date: followUpDate || null,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedEnquiry.id)
      if (error) throw error
      setEnquiries(prev => prev.map(e => e.id === selectedEnquiry.id ? { ...e, call_notes: callNotes, follow_up_date: followUpDate } : e))
      toast.success('Notes saved')
      setShowModal(false)
    } catch (error) {
      toast.error('Failed to save notes')
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Property', 'Type', 'Status', 'Source', 'Date', 'Notes']
    const rows = filteredEnquiries.map(e => [
      e.name, e.email, e.phone, e.property_title || '', e.type, e.status, e.source,
      new Date(e.created_at).toLocaleDateString(), e.call_notes || ''
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `enquiries_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  const filteredEnquiries = enquiries.filter(e => {
    const matchSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase()) || e.phone.includes(searchQuery) || e.property_title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    const matchType = typeFilter === 'all' || e.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage)
  const paginated = filteredEnquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'new').length,
    contacted: enquiries.filter(e => e.status === 'contacted').length,
    interested: enquiries.filter(e => e.status === 'interested').length,
    closed: enquiries.filter(e => e.status === 'closed').length,
    callClicks: enquiries.filter(e => e.type === 'call_click').length,
    whatsappClicks: enquiries.filter(e => e.type === 'whatsapp_click').length,
  }

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700', call_click: 'bg-green-100 text-green-700',
      whatsapp_click: 'bg-emerald-100 text-emerald-700', email: 'bg-blue-100 text-blue-700',
      booking: 'bg-purple-100 text-purple-700', chat: 'bg-yellow-100 text-yellow-700',
    }
    return map[type] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700',
      interested: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700',
      spam: 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries & Leads</h1>
          <p className="text-gray-600 mt-1">Track property enquiries, calls, and WhatsApp clicks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEnquiries}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'New', value: stats.new, color: 'blue' },
          { label: 'Contacted', value: stats.contacted, color: 'yellow' },
          { label: 'Interested', value: stats.interested, color: 'green' },
          { label: 'Closed', value: stats.closed, color: 'gray' },
          { label: 'Call Clicks', value: stats.callClicks, color: 'green' },
          { label: 'WhatsApp', value: stats.whatsappClicks, color: 'emerald' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by name, email, phone, property..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="closed">Closed</option>
            <option value="spam">Spam</option>
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="call_click">Call Click</option>
            <option value="whatsapp_click">WhatsApp Click</option>
            <option value="email">Email</option>
            <option value="booking">Booking</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Lead</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((enq) => (
                <tr key={enq.id} className={`hover:bg-gray-50 ${enq.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{enq.name}</p>
                    <p className="text-xs text-gray-500">{enq.email}</p>
                    <p className="text-xs text-gray-500">{enq.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 line-clamp-1">{enq.property_title || enq.property_id}</p>
                    {enq.message && <p className="text-xs text-gray-400 line-clamp-1 mt-1">{enq.message}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeBadge(enq.type)}`}>
                      {enq.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={enq.status} onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusBadge(enq.status)}`}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="closed">Closed</option>
                      <option value="spam">Spam</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(enq.created_at).toLocaleDateString()}
                    <br /><span className="text-xs">{new Date(enq.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedEnquiry(enq); setCallNotes(enq.call_notes || ''); setFollowUpDate(enq.follow_up_date || ''); setShowModal(true) }}
                      className="p-2 hover:bg-gray-100 rounded-lg" title="View & Add Notes">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEnquiries.length)} of {filteredEnquiries.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {filteredEnquiries.length === 0 && (
          <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No enquiries found</p></div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Enquiry Details</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{selectedEnquiry.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{selectedEnquiry.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{selectedEnquiry.phone}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Property</p>
                <p className="text-gray-900">{selectedEnquiry.property_title || selectedEnquiry.property_id}</p>
              </div>
              {selectedEnquiry.message && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selectedEnquiry.message}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium capitalize">{selectedEnquiry.type.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Source</p>
                  <p className="text-sm font-medium capitalize">{selectedEnquiry.source}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium">{new Date(selectedEnquiry.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Notes / Follow-up</label>
                <textarea value={callNotes} onChange={(e) => setCallNotes(e.target.value)} rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add notes about this lead..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes}><Save className="w-4 h-4 mr-2" />Save Notes</Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
