import { Property, FilterParams } from './supabase/types'
import { mockProperties, mockUsers, isSupabaseConfigured } from './mock-data'

// Export mock data for use in components
export { mockProperties, mockUsers }

// Mock API functions that simulate Supabase queries
export const mockApi = {
  // Get all properties
  getProperties: async (filters?: FilterParams): Promise<Property[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
    
    let filtered = [...mockProperties]
    
    if (!filters) {
      return filtered.filter(p => p.status === 'active')
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower) ||
          p.area.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.city) {
      filtered = filtered.filter(p => p.city.toLowerCase() === filters.city?.toLowerCase())
    }
    
    if (filters.area) {
      filtered = filtered.filter(p => p.area.toLowerCase().includes(filters.area?.toLowerCase() || ''))
    }
    
    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type)
    }
    
    if (filters.listing_type) {
      filtered = filtered.filter(p => p.listing_type === filters.listing_type)
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!)
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!)
    }
    
    if (filters.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms!)
    }
    
    if (filters.bathrooms) {
      filtered = filtered.filter(p => p.bathrooms >= filters.bathrooms!)
    }
    
    return filtered.filter(p => p.status === 'active')
  },
  
  // Get property by ID
  getPropertyById: async (id: string): Promise<Property | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockProperties.find(p => p.id === id) || null
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockProperties.filter(p => p.featured && p.status === 'active').slice(0, 6)
  },
  
  // Get trending properties
  getTrendingProperties: async (): Promise<Property[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockProperties.filter(p => p.status === 'active').slice(0, 8)
  },
  
  // Get user properties
  getUserProperties: async (userId: string): Promise<Property[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockProperties.filter(p => p.owner_id === userId)
  },
  
  // Get saved properties (mock - returns empty array)
  getSavedProperties: async (userId: string): Promise<Property[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return []
  },
  
  // Check if property is saved
  isPropertySaved: async (userId: string, propertyId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return false
  },
}

// Helper to determine if we should use mock or real API
// Named without 'use' prefix since it's not a React hook
export const shouldUseMockData = () => {
  return !isSupabaseConfigured()
}

// Alias for backward compatibility (deprecated)
export const useMockData = shouldUseMockData
