'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, Home, Building2, Building } from 'lucide-react'
import Input from '@/components/ui/Input'
import { createSupabaseClient } from '@/lib/supabase/client'
import { shouldUseMockData } from '@/lib/mock-api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createSupabaseClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (shouldUseMockData()) {
      toast('Please configure Supabase to reset password', { icon: 'ℹ️' })
      return
    }

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        toast.error('Authentication service not available')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setEmailSent(true)
      toast.success('Password reset email sent! Please check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Icons - Many Small Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Icons */}
        <Home className="absolute top-20 left-10 w-32 h-32 text-primary-100 opacity-30" />
        <Building2 className="absolute top-40 right-20 w-40 h-40 text-primary-100 opacity-20" />
        <Building className="absolute bottom-20 right-10 w-36 h-36 text-primary-100 opacity-25" />
        <Building2 className="absolute bottom-32 left-20 w-44 h-44 text-primary-100 opacity-20" />
        
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
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            {emailSent ? 'Check Your Email' : 'Forgot Password'}
          </h3>
          <p className="text-sm text-gray-600">
            {emailSent 
              ? 'We\'ve sent a password reset link to your email'
              : 'Enter your email address and we\'ll send you a reset link'
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {!emailSent ? (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-sm text-gray-600">
                If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <p className="text-xs text-gray-500">
                Please check your spam folder if you don't see it in your inbox.
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-4 text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-xs text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Sign in
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Home className="w-3 h-3" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

