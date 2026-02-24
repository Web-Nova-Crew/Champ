'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Home, 
  TrendingUp, 
  Clock,
  DollarSign,
  UserCheck,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Check,
  X,
  Building2,
  Activity,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { Property } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    pendingListings: 0,
    totalRevenue: 0,
    pendingAgents: 0,
    todayBookings: 0,
    openReports: 0,
  })
  const [recentProperties, setRecentProperties] = useState<Property[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchDashboardData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    let statsLoaded = false
    let propertiesLoaded = false

    // Strategy 1: Always try Supabase direct for real-time counts
    if (supabase) {
      try {
        const [usersRes, propsRes, bookingsRes, reportsRes, logsRes] = await Promise.all([
          supabase.from('users').select('id, role, user_type, verified, status', { count: 'exact', head: false }),
          supabase.from('properties').select('id, status, is_featured', { count: 'exact', head: false }),
          supabase.from('bookings').select('id, created_at', { count: 'exact', head: false }),
          supabase.from('reports').select('id, status', { count: 'exact', head: false }),
          supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(10),
        ])

        const users = usersRes.data || []
        const props = propsRes.data || []
        const bookings = bookingsRes.data || []
        const reports = reportsRes.data || []

        const today = new Date().toISOString().split('T')[0]
        const todayBookings = bookings.filter((b: any) => b.created_at?.startsWith(today))

        if (users.length > 0 || props.length > 0) {
          setStats({
            totalUsers: users.length,
            totalProperties: props.length,
            activeListings: props.filter((p: any) => p.status === 'active' || p.status === 'approved').length,
            pendingListings: props.filter((p: any) => p.status === 'pending').length,
            totalRevenue: 0,
            pendingAgents: users.filter((u: any) => (u.user_type === 'agent' || u.role === 'agent') && !u.verified).length,
            todayBookings: todayBookings.length,
            openReports: reports.filter((r: any) => r.status === 'open' || r.status === 'pending').length,
          })
          statsLoaded = true
        }

        if (props.length > 0) {
          // Fetch full property data for pending approvals
          const { data: fullProps } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)
          if (fullProps) {
            setRecentProperties(fullProps.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              type: p.property_type || p.type || 'flat',
              listing_type: (p.transaction_type === 'Buy' ? 'sale' : 'rent') as 'sale' | 'rent',
              price: p.price,
              location: p.location || '',
              city: p.city || p.area || '',
              area: p.area || '',
              bedrooms: p.bedrooms || 0,
              bathrooms: p.bathrooms || 0,
              sqft: p.size || p.sqft || 0,
              images: p.images || [],
              amenities: p.amenities || [],
              owner_id: p.owner_id || '',
              owner_name: p.owner_name || '',
              owner_phone: p.owner_phone || '',
              owner_email: p.owner_email || '',
              status: p.status || 'pending',
              admin_comment: p.admin_comment,
              featured: p.is_featured || p.featured,
              created_at: p.created_at,
              updated_at: p.updated_at,
            })))
            propertiesLoaded = true
          }
        }

        // Set recent activities from system_logs
        if (logsRes.data && logsRes.data.length > 0) {
          setRecentActivities(logsRes.data.map((log: any, i: number) => ({
            id: log.id || i,
            type: log.source || 'system',
            message: log.message,
            time: new Date(log.created_at).toLocaleString(),
          })))
        }
      } catch (error) {
        console.warn('Supabase dashboard fetch failed:', error)
      }
    }

    // Strategy 2: Try backend API as fallback
    if (!statsLoaded) {
      try {
        const [statsResponse, propertiesResponse] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getProperties(),
        ])

        if (statsResponse.success && statsResponse.data) {
          setStats({
            totalUsers: statsResponse.data.totalUsers || 0,
            totalProperties: statsResponse.data.totalProperties || 0,
            activeListings: statsResponse.data.activeProperties || 0,
            pendingListings: statsResponse.data.pendingProperties || 0,
            totalRevenue: statsResponse.data.totalRevenue || 0,
            pendingAgents: statsResponse.data.pendingAgents || 0,
            todayBookings: statsResponse.data.todayBookings || 0,
            openReports: statsResponse.data.openReports || 0,
          })
          statsLoaded = true
        }

        if (!propertiesLoaded && propertiesResponse.success && propertiesResponse.data && Array.isArray(propertiesResponse.data)) {
          const mappedProperties = (propertiesResponse.data as any[]).map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            type: p.property_type || 'flat',
            listing_type: (p.transaction_type === 'Buy' ? 'sale' : 'rent') as 'sale' | 'rent',
            price: p.price,
            location: p.location || '',
            city: p.area || 'Lucknow',
            area: p.area || '',
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            sqft: p.size || 0,
            images: p.images || [],
            amenities: p.amenities || [],
            owner_id: p.owner_id || '',
            owner_name: p.owner_name || '',
            owner_phone: p.owner_phone || '',
            owner_email: '',
            status: p.status || 'pending',
            admin_comment: p.admin_comment,
            featured: p.is_featured,
            created_at: p.created_at,
            updated_at: p.updated_at,
          })) as Property[]
          setRecentProperties(mappedProperties.slice(0, 10))
        }
      } catch (error) {
        console.warn('Backend API dashboard fetch failed:', error)
      }
    }

    // Build dynamic recent activities if none from logs
    if (recentActivities.length === 0 || !recentActivities.some((a: any) => a.type !== 'system')) {
      setRecentActivities(prev => {
        const dynamic = [
          { id: 'live-1', type: 'user', message: `${stats.totalUsers || 0} total users on platform`, time: 'Live' },
          { id: 'live-2', type: 'property', message: `${stats.pendingListings || 0} properties awaiting approval`, time: 'Live' },
          { id: 'live-3', type: 'booking', message: `${stats.todayBookings || 0} bookings today`, time: 'Live' },
          { id: 'live-4', type: 'property', message: `${stats.activeListings || 0} active listings`, time: 'Live' },
        ]
        return prev.length > 0 && prev[0].type !== 'user' ? [...prev.slice(0, 6), ...dynamic] : dynamic
      })
    }

    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Dashboard refreshed!');
  }

  const handleQuickAction = async (propertyId: string, action: 'approve' | 'reject') => {
    try {
      let response;
      if (action === 'approve') {
        response = await apiClient.approveProperty(propertyId);
      } else {
        response = await apiClient.rejectProperty(propertyId);
      }

      if (response.success) {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        setRecentProperties(prev => prev.map(p => 
          p.id === propertyId ? { ...p, status: newStatus } as Property : p
        ));
        toast.success(`Property ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        // Refresh stats
        fetchDashboardData();
      } else {
        toast.error(response.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Quick action error:', error);
      toast.error('Failed to update property');
    }
  }

  const handleAddComment = async (propertyId: string) => {
    const comment = prompt('Enter feedback/comment for the property owner:');
    if (!comment) return;

    try {
      const response = await apiClient.addPropertyComment(propertyId, comment, 'needs_revision');
      if (response.success) {
        toast.success('Comment added! Property marked for revision.');
        fetchDashboardData();
      } else {
        toast.error(response.error || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const pendingProperties = recentProperties.filter(p => p.status === 'pending')

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time data from your backend. Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              12%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              8%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
          <p className="text-sm text-gray-600">Total Properties</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            {stats.pendingListings > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                Action Required
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingListings}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              24%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link href="/admin/properties" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.activeListings}</p>
              <p className="text-xs text-gray-600">Active Listings</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/agents" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.pendingAgents}</p>
              <p className="text-xs text-gray-600">Pending Agents</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/bookings" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.todayBookings}</p>
              <p className="text-xs text-gray-600">Today's Bookings</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/reports" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.openReports}</p>
              <p className="text-xs text-gray-600">Open Reports</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
              <p className="text-sm text-gray-500">Properties waiting for review</p>
            </div>
            <Link href="/admin/properties?status=pending">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingProperties.length > 0 ? (
              pendingProperties.slice(0, 5).map((property) => (
                <div key={property.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
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
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{property.title}</p>
                      <p className="text-sm text-gray-500">{property.location}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(property.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/properties/${property.id}`}>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Property">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleAddComment(property.id)}
                      className="p-2 hover:bg-yellow-100 rounded-lg" 
                      title="Add Comment/Feedback"
                    >
                      <MessageSquare className="w-4 h-4 text-yellow-600" />
                    </button>
                    <button 
                      onClick={() => handleQuickAction(property.id, 'approve')}
                      className="p-2 hover:bg-green-100 rounded-lg" 
                      title="Approve Property"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button 
                      onClick={() => handleQuickAction(property.id, 'reject')}
                      className="p-2 hover:bg-red-100 rounded-lg" 
                      title="Reject Property"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">All caught up! No pending approvals.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest platform activities</p>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'property' ? 'bg-green-100' :
                  activity.type === 'booking' ? 'bg-purple-100' :
                  activity.type === 'agent' ? 'bg-indigo-100' :
                  'bg-red-100'
                }`}>
                  <Activity className={`w-4 h-4 ${
                    activity.type === 'user' ? 'text-blue-600' :
                    activity.type === 'property' ? 'text-green-600' :
                    activity.type === 'booking' ? 'text-purple-600' :
                    activity.type === 'agent' ? 'text-indigo-600' :
                    'text-red-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-2">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/properties">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <Home className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Properties</h3>
              <p className="text-sm text-gray-500">View and manage all listings</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <Users className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View and manage all users</p>
            </div>
          </Link>
          <Link href="/admin/agents">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <UserCheck className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Verify Agents</h3>
              <p className="text-sm text-gray-500">Approve agent applications</p>
            </div>
          </Link>
          <Link href="/admin/settings">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <Activity className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Configure platform settings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
