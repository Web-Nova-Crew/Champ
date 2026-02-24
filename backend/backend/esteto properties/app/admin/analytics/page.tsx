'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Home, 
  Eye,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [stats, setStats] = useState({
    totalViews: 0,
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    revenue: 0,
    conversionRate: 0,
  })

  const [chartData, setChartData] = useState({
    userGrowth: [] as { month: string; users: number }[],
    propertyViews: [] as { day: string; views: number }[],
    propertyTypes: [] as { type: string; count: number; percentage: number }[],
    topLocations: [] as { location: string; properties: number; views: number }[],
    recentActivity: [] as { type: string; message: string; time: string }[],
  })

  const supabase = createSupabaseClient()

  const fetchAnalytics = async () => {
    let loaded = false

    // Strategy 1: Try backend API
    try {
      const response = await apiClient.getAnalytics(timeRange);
      if (response.success && response.data) {
        const { stats: apiStats, charts } = response.data;
        setStats({
          totalViews: apiStats.totalViews || 0,
          totalUsers: apiStats.totalUsers || 0,
          totalProperties: apiStats.totalProperties || 0,
          totalBookings: apiStats.totalBookings || 0,
          revenue: apiStats.revenue || 0,
          conversionRate: apiStats.conversionRate || 0,
        });
        setChartData({
          userGrowth: charts.userGrowth || [],
          propertyViews: charts.propertyViews || [],
          propertyTypes: charts.propertyTypes || [],
          topLocations: charts.topLocations || [],
          recentActivity: charts.recentActivity || [],
        });
        loaded = true
      }
    } catch (error) {
      console.warn('Analytics API failed, trying Supabase:', error);
    }

    // Strategy 2: Supabase direct counts
    if (!loaded && supabase) {
      try {
        const [usersRes, propsRes, bookingsRes] = await Promise.all([
          supabase.from('users').select('id, created_at', { count: 'exact', head: false }),
          supabase.from('properties').select('id, property_type, type, city, area, status, created_at', { count: 'exact', head: false }),
          supabase.from('bookings').select('id, created_at', { count: 'exact', head: false }),
        ])

        const users = usersRes.data || []
        const props = propsRes.data || []
        const bookings = bookingsRes.data || []

        setStats({
          totalViews: 0,
          totalUsers: users.length,
          totalProperties: props.length,
          totalBookings: bookings.length,
          revenue: 0,
          conversionRate: users.length > 0 ? Math.round((bookings.length / users.length) * 100) : 0,
        })

        // Build chart data from real data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const usersByMonth: Record<string, number> = {}
        users.forEach((u: any) => {
          const d = new Date(u.created_at)
          const key = monthNames[d.getMonth()]
          usersByMonth[key] = (usersByMonth[key] || 0) + 1
        })

        const typeCount: Record<string, number> = {}
        props.forEach((p: any) => {
          const t = p.property_type || p.type || 'other'
          typeCount[t] = (typeCount[t] || 0) + 1
        })
        const total = props.length || 1

        const locationCount: Record<string, number> = {}
        props.forEach((p: any) => {
          const loc = p.city || p.area || 'Unknown'
          locationCount[loc] = (locationCount[loc] || 0) + 1
        })

        setChartData({
          userGrowth: Object.entries(usersByMonth).map(([month, count]) => ({ month, users: count })),
          propertyViews: [],
          propertyTypes: Object.entries(typeCount).map(([type, count]) => ({ type, count, percentage: Math.round((count / total) * 100) })),
          topLocations: Object.entries(locationCount).slice(0, 10).map(([location, properties]) => ({ location, properties, views: 0 })),
          recentActivity: [],
        })
        loaded = true
      } catch (error) {
        console.warn('Supabase analytics failed:', error)
      }
    }

    if (!loaded) {
      // Strategy 3: Try basic dashboard stats
      try {
        const statsResponse = await apiClient.getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setStats({
            totalViews: 0,
            totalUsers: statsResponse.data.totalUsers || 0,
            totalProperties: statsResponse.data.totalProperties || 0,
            totalBookings: statsResponse.data.totalBookings || 0,
            revenue: statsResponse.data.totalRevenue || 0,
            conversionRate: 0,
          });
        }
      } catch (e) {
        console.error('All analytics sources failed');
      }
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className={`flex items-center text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your platform performance with real-time data</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Views" value={stats.totalViews.toLocaleString()} change={12} icon={Eye} color="bg-blue-500" />
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} change={8} icon={Users} color="bg-green-500" />
        <StatCard title="Properties" value={stats.totalProperties} change={5} icon={Home} color="bg-purple-500" />
        <StatCard title="Bookings" value={stats.totalBookings} change={15} icon={Calendar} color="bg-orange-500" />
        <StatCard title="Revenue" value={`₹${(stats.revenue / 100000).toFixed(1)}L`} change={24} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Conversion" value={`${stats.conversionRate}%`} change={-2} icon={TrendingUp} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">User Growth</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.userGrowth.length > 0 ? (
              chartData.userGrowth.map((item) => {
                const maxUsers = Math.max(...chartData.userGrowth.map(u => u.users), 1);
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
                      style={{ height: `${(item.users / maxUsers) * 200}px`, minHeight: '4px' }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No user data available
              </div>
            )}
          </div>
        </div>

        {/* Property Views Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Weekly Property Views</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {chartData.propertyViews.length > 0 ? (
              chartData.propertyViews.map((item) => {
                const maxViews = Math.max(...chartData.propertyViews.map(v => v.views), 1);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t-sm transition-all hover:bg-green-600"
                      style={{ height: `${(item.views / maxViews) * 200}px`, minHeight: '4px' }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No views data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Property Types</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {chartData.propertyTypes.length > 0 ? (
              chartData.propertyTypes.map((item, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.type}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-400 text-center py-8">No property data available</p>
            )}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Locations</h2>
          </div>
          <div className="space-y-3">
            {chartData.topLocations.length > 0 ? (
              chartData.topLocations.map((item, index) => (
                <div key={item.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.location}</p>
                      <p className="text-xs text-gray-500">{item.properties} properties</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views} views</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No location data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {chartData.recentActivity.length > 0 ? (
              chartData.recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.type === 'booking' ? 'bg-green-100' :
                    item.type === 'user' ? 'bg-blue-100' :
                    item.type === 'property' ? 'bg-purple-100' :
                    'bg-yellow-100'
                  }`}>
                    <Activity className={`w-4 h-4 ${
                      item.type === 'booking' ? 'text-green-600' :
                      item.type === 'user' ? 'text-blue-600' :
                      item.type === 'property' ? 'text-purple-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-1">{item.message}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
