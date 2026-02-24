'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  author_id: string
  status: 'published' | 'draft' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  author_name?: string
  views?: number
  category?: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [supabase] = useState(() => createSupabaseClient())

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    if (!supabase) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          users!blog_posts_author_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match interface
      const transformedPosts = (data || []).map(post => ({
        ...post,
        author_name: post.users?.full_name || 'Unknown',
        views: Math.floor(Math.random() * 1000) + 1, // Mock views for now
        category: 'Real Estate', // Mock category for now
      }))

      setPosts(transformedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error

      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!supabase) return

    const newStatus = currentStatus === 'published' ? 'draft' : 'published'

    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setPosts(prev => prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: newStatus,
              published_at: newStatus === 'published' ? new Date().toISOString() : p.published_at,
              updated_at: new Date().toISOString()
            }
          : p
      ))

      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`)
    } catch (error) {
      console.error('Error toggling post status:', error)
      toast.error('Failed to update post status')
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.status.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content and articles</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Author</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Views</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm text-gray-700">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/blog/${post.id}`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
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
        
        {filteredPosts.length === 0 && (-
          <div className="p-8 text-center text-gray-500">
            No posts found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}

