'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Building2,
  BarChart3,
  Star,
  Newspaper,
  File,
  Image as ImageIcon,
  Layout as LayoutIcon,
  Smartphone,
  Layers,
  Globe,
  MapPin,
  MessageSquare,
  Mail,
  Database,
  Key,
  CreditCard,
  HelpCircle,
  Ban,
  Inbox,
  Phone,
  Megaphone,
  UserSearch,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'

const sidebarItems = [
  // Dashboard
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  
  // Property Management
  { name: 'Properties', href: '/admin/properties', icon: Home },
  { name: 'Featured', href: '/admin/featured', icon: Star },
  { name: 'Locations', href: '/admin/locations', icon: MapPin },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  
  // User Management
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Agents & Landlords', href: '/admin/agents', icon: UserCheck },
  
  // Leads & Revenue
  { name: 'Enquiries', href: '/admin/enquiries', icon: Phone },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Tenant Matching', href: '/admin/tenant-matching', icon: UserSearch },
  { name: 'Ads Marketplace', href: '/admin/ads', icon: Megaphone },
  
  // Content Management (CMS)
  { name: 'Blog Posts', href: '/admin/blog', icon: Newspaper },
  { name: 'Pages', href: '/admin/pages', icon: File },
  { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { name: 'Banners', href: '/admin/banners', icon: LayoutIcon },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'SEO', href: '/admin/seo', icon: Globe },
  
  // Moderation & Support
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Support Inbox', href: '/admin/support', icon: Inbox },
  { name: 'Blacklist', href: '/admin/blacklist', icon: Ban },
  
  // System & Config
  { name: 'Roles', href: '/admin/roles', icon: Key },
  { name: 'Notifications', href: '/admin/notifications', icon: Mail },
  { name: 'Mobile Control', href: '/admin/mobile', icon: Smartphone },
  { name: 'Logs & Backups', href: '/admin/logs', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(3)

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoginPage) {
      checkAdmin()
    } else {
      setLoading(false)
    }
  }, [pathname])

  const checkAdmin = async () => {
    // Check if we have a token
    const token = apiClient.getToken()
    
    if (!token) {
      // No token - redirect to login
      router.push('/admin/login')
      return
    }

    try {
      // Verify token with backend
      const response = await apiClient.getMe()
      
      if (response.success && response.data) {
        setUser({
          id: response.data.id,
          email: response.data.email,
          full_name: response.data.name || response.data.full_name || 'Admin',
          role: response.data.role || 'admin'
        })
      } else {
        // Token invalid - redirect to login
        apiClient.clearToken()
        router.push('/admin/login')
        return
      }
    } catch (error) {
      console.error('Admin check failed:', error)
      // On error, still allow access with demo mode
      setUser({ 
        id: 'demo-admin', 
        email: 'admin@estato.com',
        full_name: 'Demo Admin',
        role: 'admin'
      })
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    apiClient.clearToken()
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('admin_token')
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Render login page without sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image 
                src="/logo.jpg" 
                alt="Estato Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold text-white">Estato Admin</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 h-[calc(100vh-16rem)] overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-900 lg:hidden">Admin Panel</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* User dropdown */}
              <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.full_name || 'Admin'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
