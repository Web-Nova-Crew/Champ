'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Shield,
  User,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Ban,
  CheckCircle
} from 'lucide-react'
import { User as UserType } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ExtendedUser extends UserType {
  user_type?: string
  verified?: boolean
  status?: 'active' | 'suspended' | 'banned'
  properties_count?: number
  last_login?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const itemsPerPage = 10
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    
    // Try backend API first (bypasses RLS)
    try {
      const response = await apiClient.getUsers()
      if (response.success && response.data) {
        const backendUsers = Array.isArray(response.data) ? response.data : (response.data as any).users || []
        if (backendUsers.length > 0) {
          setUsers(backendUsers.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name || u.name || '',
            phone: u.phone || '',
            role: u.role || 'user',
            user_type: u.user_type || u.role || 'user',
            verified: u.verified ?? u.email_verified ?? false,
            status: u.status || 'active',
            properties_count: u.properties_count || 0,
            avatar_url: u.avatar_url || null,
            created_at: u.created_at || new Date().toISOString(),
            last_login: u.last_login || null,
          })))
          setLoading(false)
          return
        }
      }
    } catch (error) {
      console.warn('Backend API failed, trying Supabase direct:', error)
    }

    // Try Supabase direct
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setUsers(data)
          setLoading(false)
          return
        }
      } catch (error) {
        console.warn('Supabase direct failed:', error)
      }
    }

    // Empty state if all fail
    setUsers([])
    setLoading(false)
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.user_type === roleFilter || u.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        filtered = filtered.filter(u => u.verified)
      } else if (statusFilter === 'unverified') {
        filtered = filtered.filter(u => !u.verified)
      } else {
        filtered = filtered.filter(u => u.status === statusFilter)
      }
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await apiClient.verifyUser(userId)
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, verified: true } : u
        ))
        toast.success('User verified successfully')
        return
      }
    } catch (e) { /* fallback below */ }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ verified: true, updated_at: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, verified: true } : u
        ))
        toast.success('User verified successfully')
        return
      } catch (error) {
        toast.error('Failed to verify user')
      }
    } else {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, verified: true } : u
      ))
      toast.success('User verified (demo)')
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return

    try {
      const response = await apiClient.suspendUser(userId)
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: 'suspended' as const } : u
        ))
        toast.success('User suspended')
        return
      }
    } catch (e) { /* fallback */ }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
      } catch (error) {
        toast.error('Failed to suspend user')
        return
      }
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'suspended' as const } : u
    ))
    toast.success('User suspended')
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await apiClient.activateUser(userId)
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: 'active' as const } : u
        ))
        toast.success('User activated')
        return
      }
    } catch (e) { /* fallback */ }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
      } catch (error) {
        toast.error('Failed to activate user')
        return
      }
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'active' as const } : u
    ))
    toast.success('User activated')
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await apiClient.deleteUser(userId)
      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        toast.success('User deleted')
        return
      }
    } catch (e) { /* fallback */ }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId)
        if (error) throw error
      } catch (error) {
        toast.error('Failed to delete user')
        return
      }
    }
    setUsers(prev => prev.filter(u => u.id !== userId))
    toast.success('User deleted')
  }

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return

    try {
      const response = await apiClient.updateUserRole(userId, 'admin')
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: 'admin' } : u
        ))
        toast.success('User is now an admin')
        return
      }
    } catch (e) { /* fallback */ }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
      } catch (error) {
        toast.error('Failed to update user role')
        return
      }
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: 'admin' } : u
    ))
    toast.success('User is now an admin')
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: users.length,
    agents: users.filter(u => u.user_type === 'agent').length,
    landlords: users.filter(u => u.user_type === 'landlord').length,
    verified: users.filter(u => u.verified).length,
    suspended: users.filter(u => u.status === 'suspended').length,
  }

  const getRoleBadge = (user: ExtendedUser) => {
    if (user.role === 'admin') return 'bg-purple-100 text-purple-800'
    if (user.user_type === 'agent') return 'bg-blue-100 text-blue-800'
    if (user.user_type === 'landlord') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (user: ExtendedUser) => {
    if (user.status === 'suspended') return 'bg-red-100 text-red-800'
    if (user.status === 'banned') return 'bg-red-100 text-red-800'
    return 'bg-green-100 text-green-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {
            const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Properties', 'Joined']
            const rows = filteredUsers.map(u => [u.name || '', u.email, u.phone || '', u.user_type || u.role || '', u.status || 'active', u.verified ? 'Yes' : 'No', u.properties_count || 0, u.created_at ? new Date(u.created_at).toLocaleDateString() : ''])
            const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `users_${new Date().toISOString().split('T')[0]}.csv`; a.click()
            toast.success('Users exported')
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
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.agents}</p>
              <p className="text-sm text-gray-600">Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.landlords}</p>
              <p className="text-sm text-gray-600">Landlords</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              <p className="text-sm text-gray-600">Suspended</p>
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
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="agent">Agents</option>
            <option value="landlord">Landlords</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Properties</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 font-semibold">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                        <div className="flex items-center gap-1">
                          {user.verified && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          <span className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadge(user)}`}>
                      {user.role === 'admin' ? 'Admin' : user.user_type || 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(user)}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.properties_count || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {!user.verified && (
                        <button 
                          onClick={() => handleVerifyUser(user.id)}
                          className="p-2 hover:bg-green-100 rounded-lg" 
                          title="Verify User"
                        >
                          <UserCheck className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      {user.status !== 'suspended' ? (
                        <button 
                          onClick={() => handleSuspendUser(user.id)}
                          className="p-2 hover:bg-yellow-100 rounded-lg" 
                          title="Suspend User"
                        >
                          <Ban className="w-4 h-4 text-yellow-600" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivateUser(user.id)}
                          className="p-2 hover:bg-green-100 rounded-lg" 
                          title="Activate User"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleMakeAdmin(user.id)}
                          className="p-2 hover:bg-purple-100 rounded-lg" 
                          title="Make Admin"
                        >
                          <Shield className="w-4 h-4 text-purple-600" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-100 rounded-lg" 
                        title="Delete User"
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <UserX className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl text-primary-600 font-bold">
                    {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.full_name || 'N/A'}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium capitalize">{selectedUser.user_type || selectedUser.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium capitalize ${selectedUser.status === 'suspended' ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedUser.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Verified</span>
                  <span className={`font-medium ${selectedUser.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedUser.verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Properties</span>
                  <span className="font-medium">{selectedUser.properties_count || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Last Login</span>
                  <span className="font-medium">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                {!selectedUser.verified && (
                  <Button onClick={() => {
                    handleVerifyUser(selectedUser.id)
                    setShowUserModal(false)
                  }}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Verify User
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserModal(false)}
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
