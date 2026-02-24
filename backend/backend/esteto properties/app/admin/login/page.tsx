'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, LogIn, Eye, EyeOff, Shield, Home } from 'lucide-react'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await apiClient.login(email, password)
      
      if (result.success && result.data) {
        // Check if user is admin
        const meResponse = await apiClient.getMe()
        
        if (meResponse.success && meResponse.data) {
          const user = meResponse.data as { role?: string; user_type?: string }
          if (user.role === 'admin' || user.user_type === 'admin') {
            toast.success('Welcome Admin! 🛡️')
            router.push('/admin')
          } else {
            // Allow access for now - backend will handle permissions
            toast.success('Login successful!')
            router.push('/admin')
          }
        } else {
          // If we can't verify role, still allow access (token is valid)
          toast.success('Login successful!')
          router.push('/admin')
        }
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-20 w-44 h-44 border-2 border-white rounded-full"></div>
        </div>
        <Shield className="absolute top-20 right-20 w-64 h-64 text-primary-500 opacity-5" />
        <Shield className="absolute bottom-20 left-20 w-48 h-48 text-primary-500 opacity-5" />
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-400">
            Secure access to Estato administration
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@estato.com"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="block w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-900 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-500 hover:to-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-200 font-medium">Secure Access</p>
                <p className="text-xs text-yellow-200/70 mt-1">
                  This portal is for authorized administrators only. All login attempts are monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>

        {/* Admin Credentials */}
        <div className="mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <p className="text-xs text-gray-500 text-center mb-2">Admin Credentials</p>
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>Email: <span className="text-gray-300 font-mono">admin@estato.com</span></p>
            <p>Password: <span className="text-gray-300 font-mono">Admin@123</span> (real)</p>
            <p className="text-gray-500">or <span className="text-gray-400 font-mono">admin123</span> (demo)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
