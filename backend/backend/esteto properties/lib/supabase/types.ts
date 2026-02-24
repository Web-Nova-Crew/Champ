export interface PropertyDocument {
  type: 'floor_plan' | 'brochure' | 'layout' | 'other'
  url: string
  name: string
}

export interface Property {
  id: string
  title: string
  description: string
  type: 'flat' | 'house' | 'villa' | 'office' | 'shop' | 'plot'
  listing_type: 'rent' | 'sale'
  price: number
  location: string
  city: string
  area: string
  bedrooms: number
  bathrooms: number
  sqft: number
  images: string[]
  videos?: string[]
  documents?: PropertyDocument[]
  amenities: string[]
  latitude?: number
  longitude?: number
  owner_id: string
  owner_name: string
  owner_email: string
  owner_phone: string
  status: 'active' | 'pending' | 'approved' | 'rejected' | 'needs_revision' | 'sold' | 'rented'
  admin_comment?: string
  featured: boolean
  allow_booking?: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: 'user' | 'admin'
  avatar_url?: string
  created_at: string
}

export interface SavedProperty {
  id: string
  user_id: string
  property_id: string
  created_at: string
  property?: Property
}

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  enabled: boolean
  platform: 'android' | 'ios' | 'web' | 'all'
  rollout_percentage: number
  created_at: string
  updated_at: string
}

export interface RemoteConfig {
  id: string
  key: string
  value: any
  description?: string
  platform: 'android' | 'ios' | 'web' | 'all'
  created_at: string
  updated_at: string
}

export interface PushTemplate {
  id: string
  title: string
  body: string
  image?: string
  data?: any
  created_at: string
  updated_at: string
}

export interface AppVersion {
  id: string
  version: string
  build_number: number
  platform: 'android' | 'ios'
  min_os_version?: string
  force_update: boolean
  whats_new?: string
  release_date: string
  download_url?: string
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  position: 'hero' | 'sidebar' | 'footer' | 'popup'
  active: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  description?: string
  parent_id?: string
  featured: boolean
  active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  image?: string
  author_id: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  tags: string[]
  seo_title?: string
  seo_description?: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface FilterParams {
  city?: string
  area?: string
  type?: string
  listing_type?: 'rent' | 'sale'
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  amenities?: string[]
  search?: string
}
