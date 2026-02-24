'use client'

import { useState, useEffect } from 'react'
import { BedDouble, MapPin, Filter, Search, X } from 'lucide-react'
import PropertyCard from '@/components/properties/PropertyCard'
import Button from '@/components/ui/Button'
import { Property } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function RoomRentPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'premium'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const supabase = createSupabaseClient()

  const areas = [
    'Gomti Nagar', 'Hazratganj', 'Indira Nagar', 'Aliganj', 'Mahanagar',
    'Chowk', 'Aminabad', 'Alambagh', 'Rajajipuram', 'Vikas Nagar'
  ]

  const fetchProperties = async () => {
    setLoading(true)
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .eq('listing_type', 'rent')
          .in('type', ['Room', 'PG', 'room', 'pg'])
          .order('created_at', { ascending: false })

        if (!error && data) {
          setProperties(data)
          setFilteredProperties(data)
        }
      }
    } catch (error) {
      console.error('Error fetching room rent properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.area?.toLowerCase().includes(query)
      )
    }

    // Area filter
    if (selectedArea) {
      filtered = filtered.filter(p =>
        p.area?.toLowerCase() === selectedArea.toLowerCase()
      )
    }

    // Price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(p => {
        if (priceRange === 'budget') return p.price <= 5000
        if (priceRange === 'mid') return p.price > 5000 && p.price <= 10000
        if (priceRange === 'premium') return p.price > 10000
        return true
      })
    }

    setFilteredProperties(filtered)
  }, [searchQuery, selectedArea, priceRange, properties])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedArea('')
    setPriceRange('all')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <BedDouble className="w-5 h-5" />
              <span className="font-medium">Room & PG Rentals</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Room in Lucknow
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Affordable rooms, PG accommodations & shared living spaces for students and working professionals
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-2 flex items-center gap-2 max-w-2xl mx-auto shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2 border-purple-200 text-purple-600"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Areas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (≤ ₹5,000)</option>
                  <option value="mid">Mid-Range (₹5,000 - ₹10,000)</option>
                  <option value="premium">Premium (&gt; ₹10,000)</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="flex items-center gap-2 text-gray-600"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Room{filteredProperties.length !== 1 ? 's' : ''} Available
              </h2>
              <p className="text-gray-600">
                {selectedArea ? `in ${selectedArea}` : 'across Lucknow'}
              </p>
            </div>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <BedDouble className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <Button onClick={clearFilters} variant="outline" className="border-purple-500 text-purple-600">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose Estato for Room Rentals?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Prime Locations</h3>
                <p className="text-gray-600 text-sm">Rooms in all major areas of Lucknow near colleges, offices & markets</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BedDouble className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified Listings</h3>
                <p className="text-gray-600 text-sm">All rooms are verified with accurate photos and amenity details</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Search</h3>
                <p className="text-gray-600 text-sm">Filter by budget, location, and amenities to find your perfect match</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
