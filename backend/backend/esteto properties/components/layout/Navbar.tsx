'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Heart, Plus, Home, Building2, Settings, ChevronDown, BookOpen, Calculator, MapPin, Phone } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { authApi } from '@/lib/api-service'
import { User as SupabaseUser } from '@supabase/supabase-js'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string>('user')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createSupabaseClient()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check backend API auth first
    if (authApi.isLoggedIn()) {
      const storedUser = authApi.getStoredUser()
      if (storedUser) {
        setUser(storedUser as any)
        setUserRole(storedUser.role || 'user')
        return
      }
    }

    checkUser()
    
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserRole(session.user.id)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const checkUser = async () => {
    if (!supabase) {
      setUser(null)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchUserRole(user.id)
      }
    } catch (error) {
      console.warn('Auth check failed:', error)
      setUser(null)
    }
  }

  const fetchUserRole = async (userId: string) => {
    if (!supabase) {
      setUserRole('user')
      return
    }

    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (data) {
        setUserRole(data.role)
      }
    } catch (error) {
      console.warn('Failed to fetch user role:', error)
      setUserRole('user')
    }
  }

  const handleSignOut = async () => {
    // Clear backend API auth
    authApi.logout()
    
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.warn('Sign out failed:', error)
      }
    }
    
    setUser(null)
    setUserRole('user')
    setUserMenuOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Building2 },
    { href: '/emi-calculator', label: 'EMI Calculator', icon: Calculator },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact', icon: Phone },
  ]

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <Image 
                  src="/logo.jpg" 
                  alt="Estato Logo" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Estato</span>
                <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Real Estate</span>
              </div>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Add Property Button - Always Visible */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/properties/add">
              <Button size="sm" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Plus className="w-4 h-4" />
                Add Property
              </Button>
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {userRole === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{userRole === 'admin' ? 'Administrator' : 'User'}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/dashboard?tab=saved"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Saved Properties
                      </Link>
                      
                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-1" />
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top duration-300">
          <div className="container-custom py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {link.label}
                </Link>
              )
            })}
            
            <div className="border-t border-gray-200 my-2" />
            
            {/* Add Property Button - Mobile */}
            <Link
              href="/properties/add"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Plus className="w-5 h-5" />
              Add Property
            </Link>
            
            {user ? (
              <>
                <div className="border-t border-gray-200 my-2" />
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard?tab=saved"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Saved Properties
                </Link>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      </nav>
    </>
  )
}
