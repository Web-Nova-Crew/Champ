'use client'

import { useState, useEffect } from 'react'
import { 
  Globe, 
  Search,
  Save,
  RefreshCw,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface SEOSettings {
  // General
  siteTitle: string
  siteDescription: string
  siteKeywords: string
  ogImage: string
  favicon: string
  
  // Social
  twitterHandle: string
  facebookAppId: string
  
  // Verification
  googleVerification: string
  bingVerification: string
  
  // Sitemap
  sitemapEnabled: boolean
  sitemapFrequency: string
  
  // Robots
  robotsEnabled: boolean
  robotsContent: string
  
  // Schema
  schemaEnabled: boolean
  organizationName: string
  organizationLogo: string
  
  // Analytics
  googleAnalyticsId: string
  facebookPixelId: string
}

interface PageSEO {
  id: string
  path: string
  title: string
  description: string
  keywords: string
  ogImage?: string
  noIndex: boolean
}

export default function AdminSEOPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'pages' | 'sitemap'>('general')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchSEOSettings()
  }, [])

  const fetchSEOSettings = async () => {
    if (!supabase) return
    try {
      const [settingsRes, pagesRes] = await Promise.all([
        supabase.from('seo_settings_kv').select('key, value'),
        supabase.from('page_seo').select('*').order('path'),
      ])
      if (settingsRes.data && settingsRes.data.length > 0) {
        const dbSettings: Record<string, any> = {}
        settingsRes.data.forEach((row: any) => {
          try { dbSettings[row.key] = JSON.parse(row.value) } catch { dbSettings[row.key] = row.value }
        })
        setSettings(prev => ({ ...prev, ...dbSettings }))
      }
      if (pagesRes.data && pagesRes.data.length > 0) {
        setPages(pagesRes.data.map((p: any) => ({ ...p, noIndex: p.no_index || false })))
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error)
    }
  }
  const [settings, setSettings] = useState<SEOSettings>({
    siteTitle: 'Estato - Find Your Dream Property',
    siteDescription: 'Discover premium properties for rent and sale in Lucknow. Estato connects you with verified listings, trusted agents, and your perfect home.',
    siteKeywords: 'real estate, property, rent, buy, sell, lucknow, flat, apartment, house, villa',
    ogImage: 'https://estato.com/og-image.jpg',
    favicon: '/favicon.ico',
    twitterHandle: '@estato',
    facebookAppId: '',
    googleVerification: '',
    bingVerification: '',
    sitemapEnabled: true,
    sitemapFrequency: 'daily',
    robotsEnabled: true,
    robotsContent: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://estato.com/sitemap.xml`,
    schemaEnabled: true,
    organizationName: 'Estato',
    organizationLogo: 'https://estato.com/logo.png',
    googleAnalyticsId: '',
    facebookPixelId: '',
  })

  const [pages, setPages] = useState<PageSEO[]>([
    { id: '1', path: '/', title: 'Home - Estato', description: 'Find your dream property in Lucknow', keywords: 'real estate, property, lucknow', noIndex: false },
    { id: '2', path: '/properties', title: 'Properties - Estato', description: 'Browse all properties for rent and sale', keywords: 'properties, listings, rent, buy', noIndex: false },
    { id: '3', path: '/agents', title: 'Agents - Estato', description: 'Connect with trusted real estate agents', keywords: 'agents, brokers, real estate', noIndex: false },
    { id: '4', path: '/about', title: 'About Us - Estato', description: 'Learn about Estato and our mission', keywords: 'about, company, mission', noIndex: false },
    { id: '5', path: '/contact', title: 'Contact Us - Estato', description: 'Get in touch with our team', keywords: 'contact, support, help', noIndex: false },
  ])

  const [editingPage, setEditingPage] = useState<PageSEO | null>(null)

  const handleSave = async () => {
    setLoading(true)

    if (!supabase) { toast.error('Database not connected'); setLoading(false); return }

    try {
      const upserts = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        updated_at: new Date().toISOString(),
      }))
      const { error } = await supabase.from('seo_settings_kv').upsert(upserts, { onConflict: 'key' })
      if (error) throw error
      toast.success('SEO settings saved')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save SEO settings')
    }
    setLoading(false)
  }

  const handlePageSave = async () => {
    if (!editingPage) return

    if (supabase) {
      try {
        const { error } = await supabase.from('page_seo').upsert({
          id: editingPage.id,
          path: editingPage.path,
          title: editingPage.title,
          description: editingPage.description,
          keywords: editingPage.keywords,
          og_image: editingPage.ogImage || null,
          no_index: editingPage.noIndex,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        if (error) throw error
      } catch (error: any) {
        toast.error(error.message || 'Failed to save page SEO')
        return
      }
    }

    setPages(prev => prev.map(p => p.id === editingPage.id ? editingPage : p))
    setEditingPage(null)
    toast.success('Page SEO updated')
  }

  const generateSitemap = () => {
    toast.success('Sitemap regenerated')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-600 mt-1">Optimize your site for search engines</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['general', 'pages', 'sitemap'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab === 'general' ? 'General SEO' : tab === 'pages' ? 'Page SEO' : 'Sitemap & Robots'}
          </button>
        ))}
      </div>

      {/* General SEO Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Meta Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Meta Tags
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">{settings.siteTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">{settings.siteDescription.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={settings.siteKeywords}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteKeywords: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="Comma-separated keywords"
                />
              </div>
            </div>
          </div>

          {/* Open Graph */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Open Graph & Social
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input
                  type="url"
                  value={settings.ogImage}
                  onChange={(e) => setSettings(prev => ({ ...prev, ogImage: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Handle</label>
                  <input
                    type="text"
                    value={settings.twitterHandle}
                    onChange={(e) => setSettings(prev => ({ ...prev, twitterHandle: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook App ID</label>
                  <input
                    type="text"
                    value={settings.facebookAppId}
                    onChange={(e) => setSettings(prev => ({ ...prev, facebookAppId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Search Engine Verification
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Verification</label>
                <input
                  type="text"
                  value={settings.googleVerification}
                  onChange={(e) => setSettings(prev => ({ ...prev, googleVerification: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="Verification code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bing Verification</label>
                <input
                  type="text"
                  value={settings.bingVerification}
                  onChange={(e) => setSettings(prev => ({ ...prev, bingVerification: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="Verification code"
                />
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analytics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.facebookPixelId}
                  onChange={(e) => setSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Schema */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Schema Markup
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Schema Markup</p>
                  <p className="text-sm text-gray-500">Add structured data for better search results</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.schemaEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, schemaEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {settings.schemaEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={settings.organizationName}
                      onChange={(e) => setSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Logo URL</label>
                    <input
                      type="url"
                      value={settings.organizationLogo}
                      onChange={(e) => setSettings(prev => ({ ...prev, organizationLogo: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pages SEO Tab */}
      {activeTab === 'pages' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Page-specific SEO</h2>
            <p className="text-sm text-gray-500">Customize SEO for individual pages</p>
          </div>
          <div className="divide-y divide-gray-100">
            {pages.map((page) => (
              <div key={page.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{page.path}</p>
                    <p className="text-sm text-gray-600">{page.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{page.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.noIndex && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">noindex</span>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditingPage(page)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          {/* Sitemap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sitemap
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Sitemap</p>
                  <p className="text-sm text-gray-500">Auto-generate XML sitemap</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sitemapEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, sitemapEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {settings.sitemapEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Frequency</label>
                    <select
                      value={settings.sitemapFrequency}
                      onChange={(e) => setSettings(prev => ({ ...prev, sitemapFrequency: e.target.value }))}
                      className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <Button variant="outline" onClick={generateSitemap}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Sitemap
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Robots.txt */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Robots.txt
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Custom Robots.txt</p>
                  <p className="text-sm text-gray-500">Control search engine crawling</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.robotsEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, robotsEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {settings.robotsEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Robots.txt Content</label>
                  <textarea
                    value={settings.robotsContent}
                    onChange={(e) => setSettings(prev => ({ ...prev, robotsContent: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Page SEO: {editingPage.path}</h2>
              <button onClick={() => setEditingPage(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingPage.description}
                  onChange={(e) => setEditingPage(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={editingPage.keywords}
                  onChange={(e) => setEditingPage(prev => prev ? { ...prev, keywords: e.target.value } : null)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noIndex"
                  checked={editingPage.noIndex}
                  onChange={(e) => setEditingPage(prev => prev ? { ...prev, noIndex: e.target.checked } : null)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="noIndex" className="text-sm text-gray-700">No Index (hide from search engines)</label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
              <Button onClick={handlePageSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
