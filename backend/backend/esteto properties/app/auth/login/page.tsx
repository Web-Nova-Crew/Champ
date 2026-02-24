'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, LogIn, Eye, EyeOff, Home, Building2, Building } from 'lucide-react'
import Input from '@/components/ui/Input'
import { createSupabaseClient } from '@/lib/supabase/client'
import { authApi } from '@/lib/api-service'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createSupabaseClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try backend API first
      const result = await authApi.login(email, password)
      
      if (result.success) {
        toast.success('Login successful! Swagat hai! 🏠')
        router.push('/dashboard')
        return
      }

      // Fallback to Supabase if backend fails
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast.success('Logged in successfully!')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Login failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabase) {
      toast('Google OAuth requires Supabase configuration', { icon: 'ℹ️' })
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E91E63]/10 via-white to-[#1A237E]/10 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Icons - Logo Colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Icons */}
        <Home className="absolute top-20 left-10 w-32 h-32 text-[#E91E63] opacity-10" />
        <Building2 className="absolute top-40 right-20 w-40 h-40 text-[#7B2D8E] opacity-10" />
        <Building className="absolute bottom-20 right-10 w-36 h-36 text-[#1A237E] opacity-10" />
        <Building2 className="absolute bottom-32 left-20 w-44 h-44 text-[#00BCD4] opacity-10" />
        
        {/* Small Icons - Scattered */}
        <Home className="absolute top-16 left-32 w-12 h-12 text-primary-100 opacity-20" />
        <Building2 className="absolute top-28 left-52 w-10 h-10 text-primary-100 opacity-15" />
        <Home className="absolute top-48 left-16 w-14 h-14 text-primary-100 opacity-25" />
        <Building className="absolute top-64 left-44 w-12 h-12 text-primary-100 opacity-20" />
        <Home className="absolute top-80 left-28 w-10 h-10 text-primary-100 opacity-15" />
        
        <Building2 className="absolute top-24 right-32 w-14 h-14 text-primary-100 opacity-25" />
        <Home className="absolute top-44 right-48 w-12 h-12 text-primary-100 opacity-20" />
        <Building className="absolute top-60 right-24 w-10 h-10 text-primary-100 opacity-15" />
        <Home className="absolute top-76 right-40 w-14 h-14 text-primary-100 opacity-25" />
        <Building2 className="absolute top-96 right-28 w-12 h-12 text-primary-100 opacity-20" />
        
        <Home className="absolute top-1/4 left-1/3 w-10 h-10 text-primary-100 opacity-15" />
        <Building2 className="absolute top-1/3 left-2/3 w-12 h-12 text-primary-100 opacity-20" />
        <Building className="absolute top-2/5 left-1/5 w-10 h-10 text-primary-100 opacity-15" />
        <Home className="absolute top-3/5 left-3/4 w-14 h-14 text-primary-100 opacity-25" />
        <Building2 className="absolute top-4/5 left-1/2 w-12 h-12 text-primary-100 opacity-20" />
        
        <Home className="absolute bottom-24 right-16 w-10 h-10 text-primary-100 opacity-15" />
        <Building className="absolute bottom-40 right-36 w-12 h-12 text-primary-100 opacity-20" />
        <Home className="absolute bottom-56 right-20 w-10 h-10 text-primary-100 opacity-15" />
        <Building2 className="absolute bottom-72 right-44 w-14 h-14 text-primary-100 opacity-25" />
        
        <Building className="absolute bottom-28 left-36 w-10 h-10 text-primary-100 opacity-15" />
        <Home className="absolute bottom-44 left-52 w-12 h-12 text-primary-100 opacity-20" />
        <Building2 className="absolute bottom-60 left-28 w-10 h-10 text-primary-100 opacity-15" />
        <Home className="absolute bottom-76 left-44 w-14 h-14 text-primary-100 opacity-25" />
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header - Logo Colors */}
        <div className="text-center mb-6">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E91E63] via-[#7B2D8E] to-[#1A237E] rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#E91E63] via-[#7B2D8E] to-[#1A237E] bg-clip-text text-transparent">
            Welcome Back
          </h3>
          <p className="text-sm text-gray-600">
            Access your Lucknow real estate account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              </div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center cursor-pointer">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <span className="ml-2 block text-gray-700">Keep me signed in</span>
              </label>

              <Link 
                href="/auth/forgot-password" 
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Reset Password
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E91E63] via-[#7B2D8E] to-[#1A237E] text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
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
                  Access Account
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">Alternative Login Method</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>

          {/* Professional Sign Up Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              New to Estato? {' '}
              <Link 
                href="/auth/signup" 
                className="font-semibold text-[#7B2D8E] hover:text-[#E91E63] transition-colors"
              >
                Create Free Account
              </Link>
            </p>
          </div>
        </div>

        {/* Professional Back Link */}
        <div className="mt-4 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs text-gray-600 hover:text-[#7B2D8E] transition-colors"
          >
            <Home className="w-3 h-3" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
