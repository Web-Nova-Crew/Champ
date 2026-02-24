'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Filter, X, Search, MapPin, Building2, SlidersHorizontal, Sparkles, Loader2, ChevronDown } from 'lucide-react'
import PropertyCard from '@/components/properties/PropertyCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Property, FilterParams } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [itemsPerPage] = useState(9) // Show 9 items initially
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<FilterParams>({
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || '',
    listing_type: (searchParams.get('listing_type') as 'rent' | 'sale') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
    search: searchParams.get('search') || '',
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [properties, filters])

  useEffect(() => {
    // Reset displayed properties when filtered properties change
    setDisplayedProperties(filteredProperties.slice(0, itemsPerPage))
  }, [filteredProperties, itemsPerPage])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    
    // Try Supabase first for real-time data
    const supabase = createSupabaseClient()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false})

        if (!error && data && data.length > 0) {
          setProperties(data)
          setLoading(false)
          return
        }
      } catch (e) {
        console.warn('Supabase fetch failed:', e)
      }
    }

    // Fallback to backend API
    try {
      const response = await apiClient.getProperties('active')
      if (response.success && response.data && response.data.length > 0) {
        // Map backend format to Property type
        const mapped = response.data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          type: p.property_type || p.type || 'flat',
          listing_type: p.transaction_type === 'Buy' ? 'sale' : (p.listing_type || 'rent'),
          price: p.price,
          location: p.location,
          city: p.city || p.area || 'Lucknow',
          area: p.area,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.size || p.sqft || 0,
          images: p.images || [],
          amenities: p.amenities || [],
          owner_id: p.owner_id,
          owner_name: p.owner_name,
          owner_email: p.owner_email,
          owner_phone: p.owner_phone,
          status: p.status || 'active',
          featured: p.is_featured || p.featured,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }))
        setProperties(mapped)
      } else {
        toast.error('No properties available')
      }
    } catch (error) {
      console.error('API fetch failed:', error)
      toast.error('Failed to load properties')
    }
    
    setLoading(false)
  }

  const applyFilters = useCallback(async () => {
    setSearching(true)
    
    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let filtered = [...properties]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower) ||
          p.area.toLowerCase().includes(searchLower)
      )
    }

    if (filters.city) {
      filtered = filtered.filter((p) => p.city.toLowerCase() === filters.city?.toLowerCase())
    }

    if (filters.area) {
      filtered = filtered.filter((p) => p.area.toLowerCase().includes(filters.area?.toLowerCase() || ''))
    }

    if (filters.type) {
      filtered = filtered.filter((p) => p.type === filters.type)
    }

    if (filters.listing_type) {
      filtered = filtered.filter((p) => p.listing_type === filters.listing_type)
    }

    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!)
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!)
    }

    if (filters.bedrooms) {
      filtered = filtered.filter((p) => p.bedrooms >= filters.bedrooms!)
    }

    if (filters.bathrooms) {
      filtered = filtered.filter((p) => p.bathrooms >= filters.bathrooms!)
    }

    setFilteredProperties(filtered)
    setSearching(false)
  }, [properties, filters])

  const handleSearchChange = (value: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Update local state immediately for UI responsiveness
    setFilters((prev) => ({ ...prev, search: value }))
    setSearching(true)

    // Debounce the actual filter update and URL change
    searchTimeoutRef.current = setTimeout(() => {
      updateURL('search', value)
      setSearching(false)
    }, 300) // 300ms delay for live search
  }

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    updateURL(key, value)
  }

  const updateURL = (key: string, value: any) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value.toString())
    } else {
      params.delete(key)
    }
    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({})
    router.push('/properties')
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length

  const handleLoadMore = async () => {
    setLoadingMore(true)
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const currentLength = displayedProperties.length
    const nextProperties = filteredProperties.slice(0, currentLength + itemsPerPage)
    setDisplayedProperties(nextProperties)
    setLoadingMore(false)
  }

  const hasMore = displayedProperties.length < filteredProperties.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <div className="relative text-white py-8 md:py-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="Luxury Properties"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/70 to-primary-900/80"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Browse Properties</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                Find Your Dream Property
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Discover premium properties for sale and rent in Lucknow
              </p>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search properties, locations, amenities..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    icon={searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  />
                  {filters.search && (
                    <button
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, search: '' }))
                        handleFilterChange('search', '')
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 md:w-auto w-full"
                  variant={showFilters ? 'primary' : 'outline'}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-white text-primary-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className={`lg:col-span-1 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 sticky top-24">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary-600" />
                      <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Listing Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Listing Type
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: undefined, label: 'All' },
                          { value: 'rent', label: 'For Rent' },
                          { value: 'sale', label: 'For Sale' },
                        ].map((option) => (
                          <label
                            key={option.value || 'all'}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              filters.listing_type === option.value
                                ? 'bg-primary-50 border-2 border-primary-600'
                                : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="listing_type"
                              checked={filters.listing_type === option.value}
                              onChange={() => handleFilterChange('listing_type', option.value)}
                              className="sr-only"
                            />
                            <span className={`text-sm font-medium ${
                              filters.listing_type === option.value ? 'text-primary-700' : 'text-gray-700'
                            }`}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Property Type
                      </label>
                      <select
                        value={filters.type || ''}
                        onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                        className="input-field w-full"
                      >
                        <option value="">All Types</option>
                        <option value="flat">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="office">Office</option>
                        <option value="shop">Shop</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <Input
                        placeholder="City"
                        value={filters.city || ''}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                        className="mb-3"
                      />
                      <Input
                        placeholder="Area/Locality"
                        value={filters.area || ''}
                        onChange={(e) => handleFilterChange('area', e.target.value)}
                      />
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filters.minPrice || ''}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filters.maxPrice || ''}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Bedrooms
                      </label>
                      <select
                        value={filters.bedrooms || ''}
                        onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="input-field w-full"
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </select>
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Bathrooms
                      </label>
                      <select
                        value={filters.bathrooms || ''}
                        onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="input-field w-full"
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="lg:col-span-3">
                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {activeFiltersCount > 0 && `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
                    </p>
                  </div>
                </div>

                {filteredProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {hasMore && (
                      <div className="mt-12 text-center">
                        <Button
                          onClick={handleLoadMore}
                          loading={loadingMore}
                          size="lg"
                          className="min-w-[200px]"
                          variant="outline"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More Properties
                              <ChevronDown className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-gray-500 mt-4">
                          Showing {displayedProperties.length} of {filteredProperties.length} properties
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No properties found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Try adjusting your filters or search terms to find more properties
                    </p>
                    {activeFiltersCount > 0 && (
                      <Button onClick={clearFilters} variant="outline">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
