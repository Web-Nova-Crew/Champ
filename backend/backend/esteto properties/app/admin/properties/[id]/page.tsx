'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Plus, X, Image as ImageIcon, MapPin, Video, FileText, Calendar } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [amenitiesList, setAmenitiesList] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const supabase = createSupabaseClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    listing_type: 'sale',
    price: '',
    location: '',
    city: '',
    area: '',
    bedrooms: '0',
    bathrooms: '0',
    sqft: '',
    amenities: [] as string[],
    latitude: '',
    longitude: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    status: 'pending',
    featured: false,
  })
  const [images, setImages] = useState<string[]>([])
  const [newImage, setNewImage] = useState('')
  const [videos, setVideos] = useState<string[]>([])
  const [newVideo, setNewVideo] = useState('')
  const [documents, setDocuments] = useState<{type: string, url: string, name: string}[]>([])
  const [newDocument, setNewDocument] = useState({ type: 'floor_plan', url: '', name: '' })
  const [allowBooking, setAllowBooking] = useState(true)

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
    setLoading(true)

    if (!supabase) {
      toast.error('Database not connected')
      setLoading(false)
      return
    }

    try {
      const [propRes, catRes, amenRes, cityRes] = await Promise.all([
        supabase.from('properties').select('*').eq('id', params.id).single(),
        supabase.from('categories').select('*').eq('active', true).order('name'),
        supabase.from('amenities').select('*').eq('active', true).order('name'),
        supabase.from('cities').select('*, areas(*)').eq('active', true).order('name'),
      ])

      if (propRes.error) throw propRes.error
      if (catRes.data) setCategories(catRes.data)
      if (amenRes.data) setAmenitiesList(amenRes.data)
      if (cityRes.data) setCities(cityRes.data)

      const p = propRes.data
      setFormData({
        title: p.title || '',
        description: p.description || '',
        type: p.type || '',
        listing_type: p.listing_type || 'sale',
        price: p.price?.toString() || '',
        location: p.location || '',
        city: p.city || '',
        area: p.area || '',
        bedrooms: p.bedrooms?.toString() || '0',
        bathrooms: p.bathrooms?.toString() || '0',
        sqft: p.sqft?.toString() || '',
        amenities: p.amenities || [],
        latitude: p.latitude?.toString() || '',
        longitude: p.longitude?.toString() || '',
        owner_name: p.owner_name || '',
        owner_email: p.owner_email || '',
        owner_phone: p.owner_phone || '',
        status: p.status || 'pending',
        featured: p.featured || false,
      })
      setImages(p.images || [])
      setVideos(p.videos || [])
      setDocuments(p.documents || [])
      setAllowBooking(p.allow_booking !== false)
    } catch (error: any) {
      console.error('Failed to fetch property:', error)
      toast.error('Property not found')
      router.push('/admin/properties')
    }
    setLoading(false)
  }

  const addImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages(prev => [...prev, newImage])
      setNewImage('')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVideo = () => {
    if (newVideo && !videos.includes(newVideo)) {
      setVideos(prev => [...prev, newVideo])
      setNewVideo('')
    }
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

  const addDocument = () => {
    if (newDocument.url && newDocument.name) {
      setDocuments(prev => [...prev, { ...newDocument }])
      setNewDocument({ type: 'floor_plan', url: '', name: '' })
    }
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.type || !formData.price || !formData.location || !formData.city) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase!.from('properties').update({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        listing_type: formData.listing_type,
        price: parseFloat(formData.price),
        location: formData.location,
        city: formData.city,
        area: formData.area,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        sqft: formData.sqft ? parseFloat(formData.sqft) : 0,
        images: images,
        videos: videos,
        documents: documents,
        amenities: formData.amenities,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        owner_name: formData.owner_name,
        owner_email: formData.owner_email,
        owner_phone: formData.owner_phone,
        status: formData.status,
        featured: formData.featured,
        allow_booking: allowBooking,
        updated_at: new Date().toISOString(),
      }).eq('id', params.id)

      if (error) throw error
      toast.success('Property updated successfully')
    } catch (error: any) {
      console.error('Failed to update property:', error)
      toast.error(error.message || 'Failed to update property')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return

    try {
      const { error } = await supabase!.from('properties').delete().eq('id', params.id)
      if (error) throw error
      toast.success('Property deleted')
      router.push('/admin/properties')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete property')
    }
  }

  const selectedCity = cities.find(c => c.name === formData.city)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/properties" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 text-sm">Editing: {formData.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4 mr-2" />Update Property</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={5} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select Type</option>
                    {categories.length > 0 ? categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    )) : (
                      <>
                        <option value="Room">Room</option><option value="PG">PG</option>
                        <option value="Flat">Flat</option><option value="Apartment">Apartment</option>
                        <option value="House">House</option><option value="Villa">Villa</option>
                        <option value="Shop">Shop</option><option value="Office">Office</option>
                        <option value="Plot">Plot</option><option value="Warehouse">Warehouse</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
                  <select value={formData.listing_type} onChange={(e) => setFormData(prev => ({ ...prev, listing_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" value={formData.bedrooms} onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" value={formData.bathrooms} onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq.ft)</label>
                <input type="number" value={formData.sqft} onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" />Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, area: '' }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select City</option>
                    {cities.length > 0 ? cities.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    )) : (
                      <><option value="Lucknow">Lucknow</option><option value="Kanpur">Kanpur</option><option value="Noida">Noida</option></>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select value={formData.area} onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select Area</option>
                    {selectedCity?.areas?.map((a: any) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input type="text" value={formData.latitude} onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input type="text" value={formData.longitude} onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5" />Images ({images.length})</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" value={newImage} onChange={(e) => setNewImage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Paste image URL..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }} />
                <Button type="button" onClick={addImage}><Plus className="w-4 h-4 mr-1" />Add</Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img src={img} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Videos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Video className="w-5 h-5" />Videos ({videos.length})</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" value={newVideo} onChange={(e) => setNewVideo(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Paste video URL (YouTube, Cloudinary, etc.)..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVideo() } }} />
                <Button type="button" onClick={addVideo}><Plus className="w-4 h-4 mr-1" />Add</Button>
              </div>
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Video className="w-4 h-4 text-gray-500" />
                      <span className="flex-1 text-sm text-gray-700 truncate">{video}</span>
                      <button type="button" onClick={() => removeVideo(i)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" />Documents ({documents.length})</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <select value={newDocument.type} onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                  <option value="floor_plan">Floor Plan</option>
                  <option value="brochure">Brochure</option>
                  <option value="layout">Layout</option>
                  <option value="other">Other</option>
                </select>
                <input type="text" value={newDocument.name} onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Document name" />
                <input type="text" value={newDocument.url} onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="PDF URL" />
              </div>
              <Button type="button" onClick={addDocument} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1" />Add Document</Button>
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded capitalize">{doc.type.replace('_', ' ')}</span>
                      <span className="flex-1 text-sm text-gray-700 truncate">{doc.name}</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm hover:underline">View</a>
                      <button type="button" onClick={() => removeDocument(i)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {(amenitiesList.length > 0 ? amenitiesList.map(a => a.name) : [
                'Parking', 'Lift', 'Security', 'Garden', 'Gym', 'Swimming Pool', 'Power Backup',
                'Water Supply', 'WiFi', 'AC', 'Furnished', 'Semi-Furnished', 'Balcony', 'Terrace',
                'CCTV', 'Intercom', 'Fire Safety', 'Visitor Parking', 'Club House', 'Kids Play Area'
              ]).map((amenity) => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Status & Visibility</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="pending">Pending Review</option>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Featured</p>
                  <p className="text-xs text-gray-500">Show on homepage</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm flex items-center gap-1"><Calendar className="w-4 h-4" />Allow Booking</p>
                  <p className="text-xs text-gray-500">Enable visit scheduling</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={allowBooking} onChange={(e) => setAllowBooking(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Owner / Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input type="text" value={formData.owner_name} onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.owner_email} onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={formData.owner_phone} onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
