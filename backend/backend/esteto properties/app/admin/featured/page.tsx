'use client'

import { useState, useEffect } from 'react'
import { 
  Star, 
  Search, 
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Building2,
  Check,
  X,
  RefreshCw
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface FeaturedProperty {
  id: string
  property_id: string
  title: string
  location: string
  price: number
  image: string
  position: number
  active: boolean
}

export default function AdminFeaturedPage() {
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([])
  const [availableProperties, setAvailableProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    let featuredLoaded = false
    let availableLoaded = false

    // Strategy 1: Try Supabase direct
    if (supabase) {
      try {
        const { data: featured } = await supabase
          .from('featured_properties')
          .select('*, properties(*)')
          .order('position')

        if (featured) {
          setFeaturedProperties(featured.map((f: any) => ({
            id: f.id,
            property_id: f.property_id,
            title: f.properties?.title || 'Unknown',
            location: f.properties?.location || '',
            price: f.properties?.price || 0,
            image: f.properties?.images?.[0] || '',
            position: f.position,
            active: f.active,
          })))
          featuredLoaded = true
        }

        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .in('status', ['active', 'approved'])

        if (properties && properties.length > 0) {
          const featuredIds = featured?.map((f: any) => f.property_id) || []
          setAvailableProperties(properties.filter((p: any) => !featuredIds.includes(p.id)))
          availableLoaded = true
        }
      } catch (error) {
        console.warn('Supabase featured fetch failed:', error)
      }
    }

    // Strategy 2: Try backend API for available properties
    if (!availableLoaded) {
      try {
        const response = await apiClient.getProperties('active')
        if (response.success && response.data && Array.isArray(response.data)) {
          const mapped = (response.data as any[]).map((p: any) => ({
            id: p.id,
            title: p.title,
            location: p.location || '',
            price: p.price,
            images: p.images || [],
            status: p.status,
          }))
          const featuredIds = featuredProperties.map(f => f.property_id)
          setAvailableProperties(mapped.filter((p: any) => !featuredIds.includes(p.id)))
          availableLoaded = true
        }
      } catch (error) {
        console.warn('Backend API properties fetch failed:', error)
      }
    }

    // Empty state if all fail
    if (!featuredLoaded) setFeaturedProperties([])
    if (!availableLoaded) setAvailableProperties([])

    setLoading(false)
  }

  const addToFeatured = async (property: any) => {
    const newFeatured: FeaturedProperty = {
      id: `featured-${Date.now()}`,
      property_id: property.id,
      title: property.title,
      location: property.location,
      price: property.price,
      image: property.images?.[0] || '',
      position: featuredProperties.length + 1,
      active: true,
    }

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      await supabase!.from('featured_properties').insert({
        property_id: property.id,
        position: featuredProperties.length + 1,
        active: true,
      })
      setFeaturedProperties(prev => [...prev, newFeatured])
      setAvailableProperties(prev => prev.filter(p => p.id !== property.id))
      toast.success('Property added to featured')
      setShowAddModal(false)
    } catch (error) {
      toast.error('Failed to add property')
    }
  }

  const removeFromFeatured = async (id: string, propertyId: string) => {
    if (!supabase) { toast.error('Database not connected'); return }

    try {
      await supabase!.from('featured_properties').delete().eq('id', id)
      const removed = featuredProperties.find(f => f.id === id)
      setFeaturedProperties(prev => prev.filter(f => f.id !== id))
      fetchData() // Refresh available properties
      toast.success('Property removed from featured')
    } catch (error) {
      toast.error('Failed to remove property')
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    if (!supabase) { toast.error('Database not connected'); return }

    try {
      await supabase!.from('featured_properties').update({ active: !active }).eq('id', id)
      setFeaturedProperties(prev => prev.map(f => 
        f.id === id ? { ...f, active: !active } : f
      ))
      toast.success(`Property ${!active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update property')
    }
  }

  const movePosition = (index: number, direction: 'up' | 'down') => {
    const newList = [...featuredProperties]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= newList.length) return
    
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]
    newList.forEach((item, i) => item.position = i + 1)
    
    setFeaturedProperties(newList)
    toast.success('Position updated')
  }

  const filteredAvailable = availableProperties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Featured Properties</h1>
          <p className="text-gray-600 mt-1">Manage properties shown on homepage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Featured List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Current Featured Properties ({featuredProperties.length})</h2>
          <p className="text-sm text-gray-500">Drag to reorder or use arrows</p>
        </div>
        
        {featuredProperties.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {featuredProperties.map((property, index) => (
              <div key={property.id} className={`p-4 flex items-center gap-4 hover:bg-gray-50 ${!property.active ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => movePosition(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                  {property.position}
                </span>
                
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {property.image ? (
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{property.title}</p>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <p className="text-sm font-medium text-primary-600">₹{property.price.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(property.id, property.active)}
                    className={`p-2 rounded-lg ${property.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    title={property.active ? 'Active' : 'Inactive'}
                  >
                    {property.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeFromFeatured(property.id, property.property_id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No featured properties yet</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Property
            </Button>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Featured Property</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {filteredAvailable.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredAvailable.map((property) => (
                    <div key={property.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{property.title}</p>
                        <p className="text-sm text-gray-500">{property.location}</p>
                        <p className="text-sm font-medium text-primary-600">₹{property.price?.toLocaleString()}</p>
                      </div>
                      <Button size="sm" onClick={() => addToFeatured(property)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No properties available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
