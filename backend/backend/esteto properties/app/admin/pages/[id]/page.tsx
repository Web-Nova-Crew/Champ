'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import RichTextEditor from '@/components/ui/RichTextEditor'
import toast from 'react-hot-toast'

export default function EditPagePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createSupabaseClient()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: ''
  })

  useEffect(() => {
    fetchPage()
  }, [params.id])

  const fetchPage = async () => {
    if (!supabase) {
      toast.error('Database not connected')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from('pages').select('*').eq('id', params.id).single()
      if (error) throw error
      setFormData({ title: data.title || '', slug: data.slug || '', content: data.content || '', status: data.status || 'published' })
    } catch (error) {
      toast.error('Page not found')
      router.push('/admin/pages')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required')
      return
    }

    setSaving(true)

    if (!supabase) { toast.error('Database not connected'); setSaving(false); return }
    
    try {
      const { error } = await supabase.from('pages').update({
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        status: formData.status,
        updated_at: new Date().toISOString(),
      }).eq('id', params.id)

      if (error) throw error
      toast.success('Page updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update page')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      const { error } = await supabase.from('pages').delete().eq('id', params.id)
      if (error) throw error
      toast.success('Page deleted')
      router.push('/admin/pages')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete page')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
            <p className="text-gray-600 text-sm">Editing: {formData.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Page
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span>/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  className="min-h-[400px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
