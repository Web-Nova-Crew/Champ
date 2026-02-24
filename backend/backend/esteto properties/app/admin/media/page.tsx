'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Trash2, 
  Search,
  Image as ImageIcon,
  Copy,
  RefreshCw
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const BUCKET_NAME = 'media'

interface MediaFile {
  id: string
  url: string
  name: string
  size: string
  date: string
}

export default function MediaLibraryPage() {
  const [images, setImages] = useState<MediaFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => { fetchMedia() }, [])

  const fetchMedia = async () => {
    setLoading(true)

    if (!supabase) { setImages([]); setLoading(false); return }

    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list('uploads', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      if (error) throw error

      const mediaFiles = (data || [])
        .filter((f: any) => !f.id?.startsWith('.'))
        .map((f: any) => {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`uploads/${f.name}`)
          return {
            id: f.id || f.name,
            url: urlData.publicUrl,
            name: f.name,
            size: f.metadata?.size ? `${(f.metadata.size / 1024 / 1024).toFixed(1)} MB` : '-',
            date: f.created_at ? new Date(f.created_at).toISOString().split('T')[0] : '-',
          }
        })

      setImages(mediaFiles)
    } catch (error) {
      console.error('Failed to fetch media:', error)
      setImages([])
    }
    setLoading(false)
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      setUploading(true)

      if (!supabase) { toast.error('Database not connected'); setUploading(false); return }

      let uploaded = 0
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        try {
          const { error } = await supabase.storage.from(BUCKET_NAME).upload(`uploads/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false,
          })
          if (error) throw error

          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`uploads/${fileName}`)
          const newImage = {
            id: fileName,
            url: urlData.publicUrl,
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            date: new Date().toISOString().split('T')[0],
          }
          setImages(prev => [newImage, ...prev])
          uploaded++
        } catch (error: any) {
          console.error(`Failed to upload ${file.name}:`, error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      setUploading(false)
      if (uploaded > 0) toast.success(`${uploaded} image(s) uploaded successfully`)
    }
    input.click()
  }

  const handleDelete = async (image: { id: string; name: string }) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([`uploads/${image.id}`])
      if (error) throw error
      setImages(prev => prev.filter(img => img.id !== image.id))
      toast.success('Image deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage images and media files</p>
        </div>
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? 'Uploading...' : 'Upload New'}
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredImages.map((image) => (
          <div key={image.id} className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square relative bg-gray-100">
              <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => copyUrl(image.url)}
                  className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(image)}
                  className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900 truncate" title={image.name}>{image.name}</div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{image.size}</span>
                <span>{image.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>No media files found</p>
        </div>
      )}
    </div>
  )
}
