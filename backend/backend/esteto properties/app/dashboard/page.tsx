'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Plus, Edit, Trash2, Home, Building2, TrendingUp, Mail, Phone, User as UserIcon, Calendar } from 'lucide-react'
import { Property } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'
import { authApi, savedPropertiesApi, propertiesApi } from '@/lib/api-service'
import PropertyCard from '@/components/properties/PropertyCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SavedPropertyItem {
  id: string
  user_id: string
  property_id: string
  created_at: string
  property: Property
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'saved' | 'my-listings'>(
    searchParams?.get('tab') === 'my-listings' ? 'my-listings' : 'saved'
  )
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [myProperties, setMyProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && !loading) {
      if (activeTab === 'saved') {
        fetchSavedProperties()
      } else {
        fetchMyProperties()
      }
    }
  }, [activeTab, user, loading])

  const checkAuth = async () => {
    // Check if logged in via backend API
    if (authApi.isLoggedIn()) {
      const storedUser = authApi.getStoredUser()
      if (storedUser) {
        setUser(storedUser)
        setLoading(false)
        return
      }
    }

    // Fallback to Supabase
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setLoading(false)
          return
        }
      } catch (error) {
        console.warn('Supabase auth check failed:', error)
      }
    }

    // Not logged in
    router.push('/auth/login')
  }

  const fetchSavedProperties = async () => {
    setLoading(true)
    
    // Try backend API first
    const result = await savedPropertiesApi.getSaved()
    if (result.success && result.data) {
      setSavedProperties(result.data as Property[])
      setLoading(false)
      return
    }

    // Fallback to Supabase
    if (supabase && user) {
      try {
        const { data } = await supabase
          .from('saved_properties')
          .select(`
            *,
            property:properties(*)
          `)
          .eq('user_id', user.id)

        if (data) {
          const properties = data
            .filter((item: SavedPropertyItem) => item.property)
            .map((item: SavedPropertyItem) => item.property) as Property[]
          setSavedProperties(properties)
        }
      } catch (error) {
        console.warn('Failed to fetch saved properties:', error)
      }
    }
    setLoading(false)
  }

  const fetchMyProperties = async () => {
    setLoading(true)
    
    // Try backend API first
    const result = await propertiesApi.getMyProperties()
    if (result.success && result.data) {
      setMyProperties(result.data as Property[])
      setLoading(false)
      return
    }

    // Fallback to Supabase
    if (supabase && user) {
      try {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        setMyProperties(data || [])
      } catch (error) {
        console.warn('Failed to fetch my properties:', error)
      }
    }
    setLoading(false)
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    // Try backend API first
    const result = await propertiesApi.deleteProperty(propertyId)
    if (result.success) {
      toast.success('Property deleted successfully')
      fetchMyProperties()
      return
    }

    // Fallback to Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)

        if (error) {
          toast.error('Failed to delete property')
          return
        }

        toast.success('Property deleted successfully')
        fetchMyProperties()
      } catch (error) {
        toast.error('Failed to delete property')
      }
    } else {
      toast.error(result.error || 'Failed to delete property')
    }
  }

  if (loading && !user) {
    return (
      <div className="container-custom py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U'
  const activeListings = myProperties.filter(p => p.status === 'active').length
  const totalViews = myProperties.reduce((sum, p) => sum + (p.featured ? 150 : 50), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30 shadow-xl">
              {userInitial}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user?.full_name || user?.email?.split('@')[0] || 'User Dashboard'}
              </h1>
              <p className="text-primary-100 text-lg">{user?.email || 'demo@example.com'}</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span className="text-sm">{myProperties.length} Properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{savedProperties.length} Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{myProperties.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900">{activeListings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Saved Properties</p>
                <p className="text-3xl font-bold text-gray-900">{savedProperties.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-5 h-5" />
              Saved Properties
              <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                {savedProperties.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('my-listings')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'my-listings'
                  ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              My Listings
              <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                {myProperties.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'saved' ? (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading saved properties...</p>
                  </div>
                ) : savedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} isSaved={true} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved properties yet</h3>
                    <p className="text-gray-600 mb-8">Start saving properties you're interested in</p>
                    <Link href="/properties">
                      <Button size="lg">
                        <Building2 className="w-5 h-5 mr-2" />
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">Manage your property listings</p>
                  <Link href="/properties/add">
                    <Button>
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Property
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your properties...</p>
                  </div>
                ) : myProperties.length > 0 ? (
                  <div className="space-y-4">
                    {myProperties.map((property) => (
                      <div key={property.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex gap-6">
                          {property.images && property.images.length > 0 && (
                            <div className="w-40 h-40 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={property.images[0]}
                                alt={property.title}
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                                <p className="text-gray-600 flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {property.location}, {property.city}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                property.status === 'active' ? 'bg-green-100 text-green-800' :
                                property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {property.status}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                              <span>₹{property.price.toLocaleString()}/{property.listing_type === 'rent' ? 'mo' : ''}</span>
                              <span>•</span>
                              <span>{property.bedrooms} Beds</span>
                              <span>•</span>
                              <span>{property.bathrooms} Baths</span>
                              <span>•</span>
                              <span>{property.sqft} sqft</span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link href={`/properties/${property.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/properties/edit/${property.id}`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProperty(property.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties listed yet</h3>
                    <p className="text-gray-600 mb-8">Start by adding your first property listing</p>
                    <Link href="/properties/add">
                      <Button size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Property
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
