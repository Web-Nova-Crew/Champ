'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Clock, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
  Building2,
  MoreVertical,
  Download,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { Property } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'

type PropertyStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'needs_revision' | 'active' | 'sold' | 'rented'

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const itemsPerPage = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    filterProperties()
  }, [properties, searchQuery, statusFilter, typeFilter])

  useEffect(() => {
    setShowBulkActions(selectedProperties.length > 0)
  }, [selectedProperties])

  const mapProperty = (p: any): Property => ({
    id: p.id,
    title: p.title || '',
    description: p.description || '',
    type: p.property_type || p.type || 'flat',
    listing_type: (p.transaction_type === 'Buy' ? 'sale' : p.listing_type || 'rent') as 'sale' | 'rent',
    price: p.price || 0,
    location: p.location || '',
    city: p.city || p.area || 'Lucknow',
    area: p.area || '',
    bedrooms: p.bedrooms || 0,
    bathrooms: p.bathrooms || 0,
    sqft: p.size || p.sqft || 0,
    images: p.images || [],
    amenities: p.amenities || [],
    owner_id: p.owner_id || '',
    owner_name: p.owner_name || '',
    owner_email: p.owner_email || '',
    owner_phone: p.owner_phone || '',
    status: p.status || 'pending',
    admin_comment: p.admin_comment,
    featured: p.is_featured || p.featured,
    created_at: p.created_at,
    updated_at: p.updated_at,
  })

  const fetchProperties = async () => {
    setLoading(true)
    let loaded = false

    // Strategy 1: Try backend API
    try {
      const response = await apiClient.getProperties();
      if (response.success && response.data && Array.isArray(response.data)) {
        setProperties((response.data as any[]).map(mapProperty));
        loaded = true
      }
    } catch (error) {
      console.warn('Backend API properties failed:', error);
    }

    // Strategy 2: Try Supabase direct
    if (!loaded && supabase) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          setProperties(data.map(mapProperty));
          loaded = true
        }
      } catch (error) {
        console.warn('Supabase properties failed:', error);
      }
    }

    if (!loaded) {
      toast.error('Failed to load properties');
    }
    setLoading(false);
  }

  const filterProperties = () => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.owner_name?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter)
    }

    setFilteredProperties(filtered)
    setCurrentPage(1)
  }

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      let response;
      if (newStatus === 'approved') {
        response = await apiClient.approveProperty(propertyId);
      } else if (newStatus === 'rejected') {
        response = await apiClient.rejectProperty(propertyId);
      } else {
        response = await apiClient.updatePropertyStatus(propertyId, newStatus);
      }

      if (response.success) {
        setProperties(prev => prev.map(p => 
          p.id === propertyId ? { ...p, status: newStatus as Property['status'] } : p
        ));
        toast.success(`Property ${newStatus} successfully!`);
      } else {
        toast.error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  }

  const handleAddComment = async (propertyId: string) => {
    const comment = prompt('Enter feedback/comment for the property owner:');
    if (!comment) return;

    try {
      const response = await apiClient.addPropertyComment(propertyId, comment, 'needs_revision');
      if (response.success) {
        toast.success('Comment added! Property marked for revision.');
        fetchProperties();
      } else {
        toast.error(response.error || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedProperties.length === 0) return;

    const actionMap = {
      approve: 'approved',
      reject: 'rejected',
      delete: 'deleted'
    };

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedProperties.length} properties?`)) return;
      
      try {
        // Delete each property
        for (const id of selectedProperties) {
          await apiClient.deleteProperty(id);
        }
        setProperties(prev => prev.filter(p => !selectedProperties.includes(p.id)));
        toast.success(`${selectedProperties.length} properties deleted`);
      } catch (error) {
        toast.error('Failed to delete properties');
      }
    } else {
      try {
        // Update each property status
        for (const id of selectedProperties) {
          if (action === 'approve') {
            await apiClient.approveProperty(id);
          } else {
            await apiClient.rejectProperty(id);
          }
        }
        setProperties(prev => prev.map(p => 
          selectedProperties.includes(p.id) 
            ? { ...p, status: actionMap[action] as Property['status'] } 
            : p
        ));
        toast.success(`${selectedProperties.length} properties ${actionMap[action]}`);
      } catch (error) {
        toast.error(`Failed to ${action} properties`);
      }
    }
    setSelectedProperties([]);
  }

  const handleSelectAll = () => {
    const currentPageIds = paginatedProperties.map(p => p.id)
    if (selectedProperties.length === currentPageIds.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(currentPageIds)
    }
  }

  const handleSelectProperty = (id: string) => {
    setSelectedProperties(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      sold: 'bg-blue-100 text-blue-800',
      rented: 'bg-purple-100 text-purple-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved' || p.status === 'active').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
          <p className="text-gray-600 mt-1">Manage and moderate property listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProperties}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {
            const headers = ['Title', 'Type', 'Status', 'Price', 'Location', 'Bedrooms', 'Bathrooms', 'Area', 'Owner', 'Created']
            const rows = filteredProperties.map((p: any) => [p.title, p.type || p.property_type || '', p.status, p.price, p.location || p.city || '', p.bedrooms || '', p.bathrooms || '', p.area || '', p.owner_name || p.user_id || '', p.created_at ? new Date(p.created_at).toLocaleDateString() : ''])
            const csv = [headers.join(','), ...rows.map((r: any[]) => r.map(c => `"${c || ''}"`).join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `properties_${new Date().toISOString().split('T')[0]}.csv`; a.click()
            toast.success('Properties exported')
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
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
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PropertyStatus)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="flat">Flat</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="office">Office</option>
            <option value="shop">Shop</option>
            <option value="plot">Plot</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <span className="text-primary-800 font-medium">
            {selectedProperties.length} properties selected
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleBulkAction('approve')}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Check className="w-4 h-4 mr-1" />
              Approve All
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleBulkAction('reject')}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Reject All
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleBulkAction('delete')}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete All
            </Button>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === paginatedProperties.length && paginatedProperties.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handleSelectProperty(property.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link 
                          href={`/properties/${property.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 truncate block"
                        >
                          {property.title}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{property.location}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{property.owner_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{property.owner_email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-sm text-gray-700">{property.type}</span>
                    <span className="text-xs text-gray-500 block">{property.listing_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      ₹{property.price?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(property.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/properties/${property.id}`}>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </Link>
                      {property.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAddComment(property.id)}
                            className="p-2 hover:bg-yellow-100 rounded-lg" 
                            title="Add Comment"
                          >
                            <MessageSquare className="w-4 h-4 text-yellow-600" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(property.id, 'approved')}
                            className="p-2 hover:bg-green-100 rounded-lg" 
                            title="Approve"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(property.id, 'rejected')}
                            className="p-2 hover:bg-red-100 rounded-lg" 
                            title="Reject"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={async () => {
                          if (confirm('Delete this property?')) {
                            try {
                              const response = await apiClient.deleteProperty(property.id);
                              if (response.success) {
                                setProperties(prev => prev.filter(p => p.id !== property.id));
                                toast.success('Property deleted successfully');
                              } else {
                                toast.error(response.error || 'Failed to delete property');
                              }
                            } catch (error) {
                              toast.error('Failed to delete property');
                            }
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
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
                )
              })}
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

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No properties found</p>
          </div>
        )}
      </div>
    </div>
  )
}
