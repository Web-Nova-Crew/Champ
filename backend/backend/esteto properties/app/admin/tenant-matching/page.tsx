'use client'

import { useState, useEffect } from 'react'
import {
  Users, Search, Eye, ChevronLeft, ChevronRight, RefreshCw,
  Home, MapPin, IndianRupee, Calendar, X, Check, Filter, Download
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface TenantRequirement {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  user_phone?: string
  property_type: string
  listing_type: 'rent' | 'buy'
  budget_min: number
  budget_max: number
  bedrooms: number
  city: string
  preferred_areas: string[]
  move_in_date?: string
  amenities: string[]
  notes?: string
  status: 'active' | 'matched' | 'closed'
  matched_properties?: number
  created_at: string
}

export default function AdminTenantMatchingPage() {
  const [requirements, setRequirements] = useState<TenantRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReq, setSelectedReq] = useState<TenantRequirement | null>(null)
  const [showModal, setShowModal] = useState(false)
  const itemsPerPage = 15
  const supabase = createSupabaseClient()

  useEffect(() => { fetchRequirements() }, [])

  const fetchRequirements = async () => {
    setLoading(true)

    if (supabase) {
      try {
      const { data, error } = await supabase
        .from('tenant_requirements')
        .select(`*, users:user_id(name, email, phone)`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequirements((data || []).map((r: any) => ({
        ...r,
        user_name: r.users?.name,
        user_email: r.users?.email,
        user_phone: r.users?.phone,
      })))
      } catch (error) {
        console.error('Failed to fetch requirements:', error)
      }
    }
    setRequirements([])
    setLoading(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('tenant_requirements').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) throw error
      } catch (error: any) {
        toast.error(error.message || 'Failed to update')
        return
      }
    }
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as TenantRequirement['status'] } : r))
    toast.success(`Status updated to ${newStatus}`)
  }

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Listing', 'Budget', 'Bedrooms', 'City', 'Areas', 'Status', 'Date']
    const rows = filteredReqs.map(r => [
      r.user_name, r.user_email, r.user_phone, r.property_type, r.listing_type,
      `${formatBudget(r.budget_min)} - ${formatBudget(r.budget_max)}`, r.bedrooms.toString(),
      r.city, r.preferred_areas.join('; '), r.status, new Date(r.created_at).toLocaleDateString()
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `tenant_requirements_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    toast.success('CSV exported')
  }

  const filteredReqs = requirements.filter(r => {
    const matchSearch = !searchQuery || r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) || r.city.toLowerCase().includes(searchQuery.toLowerCase()) || r.property_type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchType = typeFilter === 'all' || r.listing_type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const totalPages = Math.ceil(filteredReqs.length / itemsPerPage)
  const paginated = filteredReqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: requirements.length,
    active: requirements.filter(r => r.status === 'active').length,
    matched: requirements.filter(r => r.status === 'matched').length,
    rentSeekers: requirements.filter(r => r.listing_type === 'rent').length,
    buySeekers: requirements.filter(r => r.listing_type === 'buy').length,
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Matching</h1>
          <p className="text-gray-600 mt-1">Match tenants/buyers with available properties</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRequirements}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Active', value: stats.active, color: 'green' },
          { label: 'Matched', value: stats.matched, color: 'purple' },
          { label: 'Rent Seekers', value: stats.rentSeekers, color: 'yellow' },
          { label: 'Buy Seekers', value: stats.buySeekers, color: 'emerald' },
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
            <input type="text" placeholder="Search by name, email, city, type..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
            <option value="closed">Closed</option>
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }} className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Types</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tenant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Looking For</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Budget</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{req.user_name || req.user_id}</p>
                    <p className="text-xs text-gray-500">{req.user_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${req.listing_type === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {req.listing_type === 'rent' ? 'Rent' : 'Buy'}
                      </span>
                      <span className="text-sm text-gray-900">{req.property_type}</span>
                      {req.bedrooms > 0 && <span className="text-xs text-gray-500">• {req.bedrooms}BHK</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatBudget(req.budget_min)} - {formatBudget(req.budget_max)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{req.city}</p>
                    <p className="text-xs text-gray-500">{req.preferred_areas.slice(0, 2).join(', ')}{req.preferred_areas.length > 2 ? ` +${req.preferred_areas.length - 2}` : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select value={req.status} onChange={(e) => handleStatusChange(req.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                        req.status === 'active' ? 'bg-green-100 text-green-700' :
                        req.status === 'matched' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      <option value="active">Active</option>
                      <option value="matched">Matched</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedReq(req); setShowModal(true) }}
                      className="p-2 hover:bg-gray-100 rounded-lg" title="View Details">
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
            <p className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReqs.length)} of {filteredReqs.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {filteredReqs.length === 0 && (
          <div className="text-center py-12"><Users className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No tenant requirements found</p></div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Requirement Details</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{selectedReq.user_name}</p>
                <p className="text-sm text-gray-600">{selectedReq.user_email} • {selectedReq.user_phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Property Type</p>
                  <p className="font-medium">{selectedReq.property_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Listing Type</p>
                  <p className="font-medium capitalize">{selectedReq.listing_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Budget Range</p>
                  <p className="font-medium">{formatBudget(selectedReq.budget_min)} - {formatBudget(selectedReq.budget_max)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Bedrooms</p>
                  <p className="font-medium">{selectedReq.bedrooms > 0 ? `${selectedReq.bedrooms} BHK` : 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Location Preferences</p>
                <p className="text-gray-900">{selectedReq.city}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedReq.preferred_areas.map(area => (
                    <span key={area} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{area}</span>
                  ))}
                </div>
              </div>

              {selectedReq.move_in_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Move-in Date</p>
                  <p className="text-gray-900 flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(selectedReq.move_in_date).toLocaleDateString()}</p>
                </div>
              )}

              {selectedReq.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Required Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedReq.amenities.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReq.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selectedReq.notes}</p>
                </div>
              )}

              {selectedReq.matched_properties !== undefined && (
                <div className="bg-primary-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary-700">{selectedReq.matched_properties}</p>
                  <p className="text-sm text-primary-600">Matching Properties Found</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
