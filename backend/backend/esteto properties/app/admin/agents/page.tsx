'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin,
  Building2,
  Star,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  FileText,
  Award,
  Clock
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Agent {
  id: string
  full_name: string
  email: string
  phone?: string
  user_type: 'agent' | 'landlord' | 'owner'
  verified: boolean
  status: 'pending' | 'approved' | 'rejected'
  company_name?: string
  license_number?: string
  experience_years?: number
  specialization?: string[]
  bio?: string
  properties_count: number
  rating?: number
  reviews_count?: number
  documents?: string[]
  created_at: string
  avatar_url?: string
  location?: string
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const itemsPerPage = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    filterAgents()
  }, [agents, searchQuery, typeFilter, statusFilter])

  const fetchAgents = async () => {
    setLoading(true)

    // Try backend API first
    try {
      const response = await apiClient.getAgents()
      if (response.success && response.data) {
        const backendAgents = Array.isArray(response.data) ? response.data : (response.data as any).agents || []
        if (backendAgents.length > 0) {
          setAgents(backendAgents.map((u: any) => ({
            id: u.id,
            full_name: u.full_name || u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            user_type: u.user_type || 'agent',
            verified: u.verified ?? false,
            status: u.status || 'pending',
            company_name: u.company_name || '',
            license_number: u.license_number || '',
            experience_years: u.experience_years || 0,
            specialization: u.specialization || [],
            bio: u.bio || '',
            properties_count: u.properties_count || 0,
            rating: u.rating || 0,
            reviews_count: u.reviews_count || 0,
            avatar_url: u.avatar_url || null,
            created_at: u.created_at || new Date().toISOString(),
            location: u.location || '',
          })))
          setLoading(false)
          return
        }
      }
    } catch (error) {
      console.warn('Backend agents API failed:', error)
    }

    // Try Supabase direct
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .in('user_type', ['agent', 'landlord', 'owner'])
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setAgents(data)
          setLoading(false)
          return
        }
      } catch (error) {
        console.warn('Supabase agents fetch failed:', error)
      }
    }

    // Empty state if all fail
    setAgents([])
    setLoading(false)
  }

  const filterAgents = () => {
    let filtered = [...agents]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.full_name?.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.company_name?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query)
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.user_type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }

    setFilteredAgents(filtered)
    setCurrentPage(1)
  }

  const handleApprove = async (agentId: string) => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('users').update({ status: 'approved', verified: true, updated_at: new Date().toISOString() }).eq('id', agentId)
      if (error) throw error
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'approved' as const, verified: true } : a))
      toast.success('Agent approved successfully')
    } catch (error) {
      toast.error('Failed to approve agent')
    }
  }

  const handleReject = async (agentId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('users').update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() }).eq('id', agentId)
      if (error) throw error
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'rejected' as const } : a))
      toast.success('Agent rejected')
    } catch (error) {
      toast.error('Failed to reject agent')
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: agents.length,
    agents: agents.filter(a => a.user_type === 'agent').length,
    landlords: agents.filter(a => a.user_type === 'landlord').length,
    owners: agents.filter(a => a.user_type === 'owner').length,
    pending: agents.filter(a => a.status === 'pending').length,
    approved: agents.filter(a => a.status === 'approved').length,
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      agent: 'bg-blue-100 text-blue-800',
      landlord: 'bg-green-100 text-green-800',
      owner: 'bg-purple-100 text-purple-800',
    }
    return styles[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
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
          <h1 className="text-2xl font-bold text-gray-900">Agents & Landlords</h1>
          <p className="text-gray-600 mt-1">Manage real estate agents, landlords, and property owners</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAgents}>
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
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.agents}</p>
            <p className="text-sm text-gray-600">Agents</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.landlords}</p>
            <p className="text-sm text-gray-600">Landlords</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.owners}</p>
            <p className="text-sm text-gray-600">Owners</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
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
              placeholder="Search by name, email, company..."
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
            <option value="agent">Agents</option>
            <option value="landlord">Landlords</option>
            <option value="owner">Owners</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {stats.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">
            <strong>{stats.pending}</strong> agents/landlords are waiting for approval
          </span>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Agent/Landlord</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Properties</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedAgents.map((agent) => (
                <tr key={agent.id} className={`hover:bg-gray-50 ${agent.status === 'pending' ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {agent.avatar_url ? (
                          <img 
                            src={agent.avatar_url} 
                            alt={agent.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 font-semibold">
                            {agent.full_name?.charAt(0) || 'A'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{agent.full_name}</p>
                          {agent.verified && (
                            <Award className="w-4 h-4 text-blue-500" title="Verified" />
                          )}
                        </div>
                        {agent.company_name && (
                          <p className="text-xs text-gray-500">{agent.company_name}</p>
                        )}
                        {agent.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {agent.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{agent.email}</span>
                      </div>
                      {agent.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{agent.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeBadge(agent.user_type)}`}>
                      {agent.user_type}
                    </span>
                    {agent.license_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {agent.license_number}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(agent.status)}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{agent.properties_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {agent.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{agent.rating}</span>
                        <span className="text-xs text-gray-500">({agent.reviews_count})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No ratings</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setSelectedAgent(agent)
                          setShowAgentModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {agent.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(agent.id)}
                            className="p-2 hover:bg-green-100 rounded-lg" 
                            title="Approve"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleReject(agent.id)}
                            className="p-2 hover:bg-red-100 rounded-lg" 
                            title="Reject"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of {filteredAgents.length}
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

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No agents or landlords found</p>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {showAgentModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agent Details</h2>
                <button 
                  onClick={() => setShowAgentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-3xl text-primary-600 font-bold">
                    {selectedAgent.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedAgent.full_name}</h3>
                    {selectedAgent.verified && (
                      <Award className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-500">{selectedAgent.email}</p>
                  {selectedAgent.company_name && (
                    <p className="text-sm text-gray-600">{selectedAgent.company_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold capitalize">{selectedAgent.user_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold capitalize ${
                    selectedAgent.status === 'approved' ? 'text-green-600' : 
                    selectedAgent.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{selectedAgent.status}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Properties</p>
                  <p className="font-semibold">{selectedAgent.properties_count}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-semibold flex items-center gap-1">
                    {selectedAgent.rating ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {selectedAgent.rating} ({selectedAgent.reviews_count} reviews)
                      </>
                    ) : 'No ratings'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedAgent.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{selectedAgent.phone}</span>
                  </div>
                )}
                {selectedAgent.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{selectedAgent.location}</span>
                  </div>
                )}
                {selectedAgent.license_number && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span>License: {selectedAgent.license_number}</span>
                  </div>
                )}
                {selectedAgent.experience_years && (
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>{selectedAgent.experience_years} years experience</span>
                  </div>
                )}
                {selectedAgent.bio && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Bio</p>
                    <p className="text-gray-800">{selectedAgent.bio}</p>
                  </div>
                )}
                {selectedAgent.specialization && selectedAgent.specialization.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Specialization</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.specialization.map((spec, i) => (
                        <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                {selectedAgent.status === 'pending' && (
                  <>
                    <Button onClick={() => {
                      handleApprove(selectedAgent.id)
                      setShowAgentModal(false)
                    }}>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleReject(selectedAgent.id)
                        setShowAgentModal(false)
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowAgentModal(false)}
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
