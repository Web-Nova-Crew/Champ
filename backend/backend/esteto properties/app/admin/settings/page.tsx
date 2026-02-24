'use client'

import { useState, useEffect } from 'react'
import { 
  Settings,
  Globe,
  Bell,
  Shield,
  Mail,
  Database,
  Palette,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
  Key,
  Server,
  MessageSquare,
  Smartphone,
  FileText
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface SettingsSection {
  id: string
  title: string
  icon: any
  description: string
}

const settingsSections: SettingsSection[] = [
  { id: 'general', title: 'General Settings', icon: Settings, description: 'Basic platform configuration' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Email and push notification settings' },
  { id: 'security', title: 'Security', icon: Shield, description: 'Security and authentication settings' },
  { id: 'email', title: 'Email Settings', icon: Mail, description: 'SMTP and email templates' },
  { id: 'api', title: 'API & Integrations', icon: Server, description: 'Third-party integrations' },
  { id: 'mobile', title: 'Mobile App', icon: Smartphone, description: 'Mobile app settings' },
  { id: 'content', title: 'Content Management', icon: FileText, description: 'Manage static content' },
]

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()
  const [settings, setSettings] = useState({
    // General
    siteName: 'Estato',
    siteDescription: 'Premium Real Estate Platform',
    siteUrl: 'https://estato.com',
    supportEmail: 'support@estato.com',
    supportPhone: '+91 9876543210',
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    maintenanceMode: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newUserNotification: true,
    newPropertyNotification: true,
    newBookingNotification: true,
    newReportNotification: true,
    
    // Security
    requireEmailVerification: true,
    requirePhoneVerification: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    
    
    // Email
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    emailFromName: 'Estato',
    emailFromAddress: 'noreply@estato.com',
    
    // API
    googleMapsApiKey: '',
    firebaseApiKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    
    // Mobile
    androidAppUrl: '',
    iosAppUrl: '',
    forceAppUpdate: false,
    minAndroidVersion: '1.0.0',
    minIosVersion: '1.0.0',
    currentAndroidVersion: '1.0.0',
    currentIosVersion: '1.0.0',
    androidPackageName: 'com.estato.app',
    iosBundleId: 'com.estato.app',
    firebaseServerKey: '',
    oneSignalAppId: '',
    appMaintenanceMode: false,
    appMaintenanceMessage: 'App is under maintenance. Please try again later.',
    enableGuestMode: true,
    enableSocialLogin: true,
    enableGoogleLogin: true,
    enableFacebookLogin: false,
    enableAppleLogin: false,
    enableBiometricLogin: true,
    enablePushNotifications: true,
    enableInAppMessages: true,
    enableDeepLinking: true,
    deepLinkDomain: 'estato.com',
    appRatingPromptDays: 7,
    enableCrashReporting: true,
    enableAnalytics: true,
    
    // Content
    termsOfService: `Terms of Service for Estato

Last Updated: November 30, 2025

Welcome to Estato, a real estate property listing and buying/selling platform. By using our mobile application and website, you agree to these Terms of Service.

1. Acceptance of Terms
By accessing and using Estato, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily use Estato for personal, non-commercial transitory viewing only.

3. User Responsibilities
- Provide accurate and complete information
- Maintain the security of your account
- Comply with all applicable laws
- Respect other users' rights

4. Prohibited Uses
You may not use our service:
- For any unlawful purpose
- To solicit others to perform unlawful acts
- To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances

5. Property Listings
All property listings are provided by users. Estato does not guarantee accuracy, completeness, or availability of any listings.

6. Limitation of Liability
In no event shall Estato be liable for any damages arising out of the use or inability to use our services.

7. Termination
We may terminate or suspend your account immediately for violations of these terms.

8. Governing Law
These terms shall be interpreted and governed by the laws of India.

For questions about these Terms, please contact support@estatoprop.com.`,
    privacyPolicy: `Privacy Policy for Estato

Last Updated: November 30, 2025

Estato ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.

1. Information We Collect
- Personal Information: Name, email, phone number, profile picture
- Usage Data: App usage patterns, device information
- Location Data: If enabled, for property search features (opt-in only)

2. How We Use Your Information
- To provide and maintain our service
- To manage your account and provide customer support
- To communicate with you about updates and features
- To improve our services and develop new features

3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights
- Access: Request access to your personal data
- Rectification: Request correction of inaccurate data
- Deletion: Request deletion of your personal data
- Portability: Request transfer of your data

6. Children's Privacy
Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

7. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

8. Contact Us
If you have questions about this Privacy Policy, please contact us at support@estatoprop.com.`,
    aboutUs: `About Estato

Estato is India's premier real estate property listing and buying/selling platform. We connect property buyers, sellers, agents, and landlords in a seamless digital marketplace.

Our Mission
To revolutionize the real estate industry by providing transparent, efficient, and user-friendly property transactions.

Our Vision
To become the most trusted real estate platform in India, empowering users with technology and data-driven insights.

What We Offer
- Property listings for sale and rent
- Advanced search and filtering options
- Verified user profiles
- Secure messaging between users
- Property valuation tools
- Market insights and analytics

Contact Information
Email: support@estatoprop.com
Phone: +91 9872364476
Website: https://estatoprop.com`
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) throw error
      if (data && data.length > 0) {
        const dbSettings: Record<string, any> = {}
        data.forEach((row: any) => {
          try {
            dbSettings[row.key] = JSON.parse(row.value)
          } catch {
            dbSettings[row.key] = row.value
          }
        })
        setSettings(prev => ({ ...prev, ...dbSettings }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)

    if (!supabase) { toast.error('Database not connected'); setLoading(false); return }

    try {
      const upserts = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('site_settings')
        .upsert(upserts, { onConflict: 'key' })

      if (error) throw error
      toast.success('Settings saved successfully')
    } catch (error: any) {
      console.error('Failed to save settings:', error)
      toast.error(error.message || 'Failed to save settings')
    }
    setLoading(false)
  }

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleChange('siteName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => handleChange('siteUrl', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => handleChange('siteDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
          <input
            type="tel"
            value={settings.supportPhone}
            onChange={(e) => handleChange('supportPhone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
          </select>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
            <p className="text-sm text-gray-500">Temporarily disable the website for maintenance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Notification Channels</h4>
        
        {[
          { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
          { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send push notifications to mobile app' },
          { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send notifications via SMS' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key as keyof typeof settings] as boolean}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <h4 className="font-medium text-gray-900">Admin Notifications</h4>
        
        {[
          { key: 'newUserNotification', label: 'New User Registration', desc: 'Get notified when a new user registers' },
          { key: 'newPropertyNotification', label: 'New Property Listing', desc: 'Get notified when a new property is listed' },
          { key: 'newBookingNotification', label: 'New Booking', desc: 'Get notified when a new booking is made' },
          { key: 'newReportNotification', label: 'New Report', desc: 'Get notified when a new report is submitted' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key as keyof typeof settings] as boolean}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Authentication</h4>
        
        {[
          { key: 'requireEmailVerification', label: 'Require Email Verification', desc: 'Users must verify their email before accessing the platform' },
          { key: 'requirePhoneVerification', label: 'Require Phone Verification', desc: 'Users must verify their phone number' },
          { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Enable 2FA for admin accounts' },
          { key: 'requireStrongPassword', label: 'Require Strong Password', desc: 'Enforce strong password requirements' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key as keyof typeof settings] as boolean}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )


  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => handleChange('smtpHost', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
          <input
            type="number"
            value={settings.smtpPort}
            onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
          <input
            type="text"
            value={settings.smtpUser}
            onChange={(e) => handleChange('smtpUser', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
          <input
            type="password"
            value={settings.smtpPassword}
            onChange={(e) => handleChange('smtpPassword', e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
          <input
            type="text"
            value={settings.emailFromName}
            onChange={(e) => handleChange('emailFromName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
          <input
            type="email"
            value={settings.emailFromAddress}
            onChange={(e) => handleChange('emailFromAddress', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Send Test Email
        </Button>
      </div>
    </div>
  )

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-800 font-medium">Sensitive Information</p>
          <p className="text-yellow-700 text-sm">API keys are sensitive. Never share them publicly.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps API Key</label>
          <input
            type="password"
            value={settings.googleMapsApiKey}
            onChange={(e) => handleChange('googleMapsApiKey', e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Firebase API Key</label>
          <input
            type="password"
            value={settings.firebaseApiKey}
            onChange={(e) => handleChange('firebaseApiKey', e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supabase URL</label>
          <input
            type="text"
            value={settings.supabaseUrl}
            onChange={(e) => handleChange('supabaseUrl', e.target.value)}
            placeholder="https://xxx.supabase.co"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supabase Anon Key</label>
          <input
            type="password"
            value={settings.supabaseAnonKey}
            onChange={(e) => handleChange('supabaseAnonKey', e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )

  const renderMobileSettings = () => (
    <div className="space-y-6">
      {/* App Store Links */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">App Store Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Android App URL (Play Store)</label>
            <input
              type="url"
              value={settings.androidAppUrl}
              onChange={(e) => handleChange('androidAppUrl', e.target.value)}
              placeholder="https://play.google.com/store/apps/..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">iOS App URL (App Store)</label>
            <input
              type="url"
              value={settings.iosAppUrl}
              onChange={(e) => handleChange('iosAppUrl', e.target.value)}
              placeholder="https://apps.apple.com/app/..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Android Package Name</label>
            <input
              type="text"
              value={settings.androidPackageName}
              onChange={(e) => handleChange('androidPackageName', e.target.value)}
              placeholder="com.estato.app"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">iOS Bundle ID</label>
            <input
              type="text"
              value={settings.iosBundleId}
              onChange={(e) => handleChange('iosBundleId', e.target.value)}
              placeholder="com.estato.app"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Version Control */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Version Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Android Version</label>
            <input
              type="text"
              value={settings.currentAndroidVersion}
              onChange={(e) => handleChange('currentAndroidVersion', e.target.value)}
              placeholder="1.0.0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current iOS Version</label>
            <input
              type="text"
              value={settings.currentIosVersion}
              onChange={(e) => handleChange('currentIosVersion', e.target.value)}
              placeholder="1.0.0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Android Version (Required)</label>
            <input
              type="text"
              value={settings.minAndroidVersion}
              onChange={(e) => handleChange('minAndroidVersion', e.target.value)}
              placeholder="1.0.0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min iOS Version (Required)</label>
            <input
              type="text"
              value={settings.minIosVersion}
              onChange={(e) => handleChange('minIosVersion', e.target.value)}
              placeholder="1.0.0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-between py-4 mt-4 border-t border-gray-100">
          <div>
            <p className="font-medium text-gray-900">Force App Update</p>
            <p className="text-sm text-gray-500">Require users to update to the latest version</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.forceAppUpdate}
              onChange={(e) => handleChange('forceAppUpdate', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Firebase Server Key</label>
            <input
              type="password"
              value={settings.firebaseServerKey}
              onChange={(e) => handleChange('firebaseServerKey', e.target.value)}
              placeholder="Enter Firebase server key"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OneSignal App ID</label>
            <input
              type="text"
              value={settings.oneSignalAppId}
              onChange={(e) => handleChange('oneSignalAppId', e.target.value)}
              placeholder="Enter OneSignal App ID"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* App Maintenance */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">App Maintenance</h3>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">App Maintenance Mode</p>
            <p className="text-sm text-gray-500">Disable app access for all users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.appMaintenanceMode}
              onChange={(e) => handleChange('appMaintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
        {settings.appMaintenanceMode && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
            <textarea
              value={settings.appMaintenanceMessage}
              onChange={(e) => handleChange('appMaintenanceMessage', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Authentication Features */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Guest Mode</p>
              <p className="text-sm text-gray-500">Allow users to browse without login</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableGuestMode} onChange={(e) => handleChange('enableGuestMode', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Google Login</p>
              <p className="text-sm text-gray-500">Allow sign in with Google</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableGoogleLogin} onChange={(e) => handleChange('enableGoogleLogin', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Facebook Login</p>
              <p className="text-sm text-gray-500">Allow sign in with Facebook</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableFacebookLogin} onChange={(e) => handleChange('enableFacebookLogin', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Apple Login (iOS)</p>
              <p className="text-sm text-gray-500">Allow sign in with Apple</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableAppleLogin} onChange={(e) => handleChange('enableAppleLogin', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Biometric Login</p>
              <p className="text-sm text-gray-500">Allow fingerprint/face unlock</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableBiometricLogin} onChange={(e) => handleChange('enableBiometricLogin', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* App Features */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">App Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-500">Send push notifications to users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enablePushNotifications} onChange={(e) => handleChange('enablePushNotifications', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">In-App Messages</p>
              <p className="text-sm text-gray-500">Show promotional messages in app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableInAppMessages} onChange={(e) => handleChange('enableInAppMessages', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Deep Linking</p>
              <p className="text-sm text-gray-500">Enable deep links to open app pages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableDeepLinking} onChange={(e) => handleChange('enableDeepLinking', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
        {settings.enableDeepLinking && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deep Link Domain</label>
            <input
              type="text"
              value={settings.deepLinkDomain}
              onChange={(e) => handleChange('deepLinkDomain', e.target.value)}
              placeholder="estato.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Analytics & Monitoring */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Crash Reporting</p>
              <p className="text-sm text-gray-500">Collect crash reports via Firebase Crashlytics</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableCrashReporting} onChange={(e) => handleChange('enableCrashReporting', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">App Analytics</p>
              <p className="text-sm text-gray-500">Track user behavior and app usage</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.enableAnalytics} onChange={(e) => handleChange('enableAnalytics', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Rating Prompt (days after install)</label>
            <input
              type="number"
              value={settings.appRatingPromptDays}
              onChange={(e) => handleChange('appRatingPromptDays', parseInt(e.target.value))}
              min={1}
              max={30}
              className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Service</label>
        <textarea
          value={settings.termsOfService}
          onChange={(e) => handleChange('termsOfService', e.target.value)}
          rows={6}
          placeholder="Enter your terms of service..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
        <textarea
          value={settings.privacyPolicy}
          onChange={(e) => handleChange('privacyPolicy', e.target.value)}
          rows={6}
          placeholder="Enter your privacy policy..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">About Us</label>
        <textarea
          value={settings.aboutUs}
          onChange={(e) => handleChange('aboutUs', e.target.value)}
          rows={6}
          placeholder="Enter about us content..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings()
      case 'notifications': return renderNotificationSettings()
      case 'security': return renderSecuritySettings()
      case 'email': return renderEmailSettings()
      case 'api': return renderApiSettings()
      case 'mobile': return renderMobileSettings()
      case 'content': return renderContentSettings()
      default: return renderGeneralSettings()
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="p-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-sm text-gray-500">
                {settingsSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
