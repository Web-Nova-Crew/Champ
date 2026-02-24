'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Globe
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase/client'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: 'published' | 'draft'
  meta_title: string
  meta_description: string
  created_at: string
  updated_at: string
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [supabase] = useState(() => createSupabaseClient())

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    if (!supabase) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      setPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const { error } = await supabase.from('pages').delete().eq('id', id)
      if (error) throw error

      setPages(prev => prev.filter(p => p.id !== id))
      toast.success('Page deleted successfully')
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error('Failed to delete page')
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!supabase) return

    const newStatus = currentStatus === 'published' ? 'draft' : 'published'

    try {
      const { error } = await supabase
        .from('pages')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setPages(prev => prev.map(p =>
        p.id === id
          ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
          : p
      ))

      toast.success(`Page ${newStatus}`)
    } catch (error) {
      console.error('Error toggling page status:', error)
      toast.error('Failed to update page status')
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.status.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">Manage static pages like About, Terms, Privacy</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Page
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Slug</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Last Modified</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{page.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    /{page.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      page.status === 'published' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(page.lastModified).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/${page.slug}`} target="_blank">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/pages/${page.id}`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(page.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPages.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No pages found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
