'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react'
import { Property } from '@/lib/supabase/types'
import { formatPrice } from '@/lib/utils'
import Card from '@/components/ui/Card'
import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { savedPropertiesApi, authApi } from '@/lib/api-service'
import toast from 'react-hot-toast'

interface PropertyCardProps {
  property: Property
  onSaveToggle?: () => void
  isSaved?: boolean
}

export default function PropertyCard({ property, onSaveToggle, isSaved = false }: PropertyCardProps) {
  const [saving, setSaving] = useState(false)
  const supabase = createSupabaseClient()

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (saving) return
    
    // Check if user is logged in
    if (!authApi.isLoggedIn()) {
      toast.error('Please login to save properties')
      return
    }
    
    setSaving(true)
    
    try {
      if (isSaved) {
        // Remove from saved
        const result = await savedPropertiesApi.removeSaved(property.id)
        if (result.success) {
          toast.success('Removed from saved')
        } else {
          // Fallback to Supabase
          const supabase = createSupabaseClient()
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase
                .from('saved_properties')
                .delete()
                .eq('user_id', user.id)
                .eq('property_id', property.id)
              toast.success('Removed from saved')
            }
          }
        }
      } else {
        // Add to saved
        const result = await savedPropertiesApi.saveProperty(property.id)
        if (result.success) {
          toast.success('Property saved! ❤️')
        } else {
          // Fallback to Supabase
          const supabase = createSupabaseClient()
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase
                .from('saved_properties')
                .insert({
                  user_id: user.id,
                  property_id: property.id,
                })
              toast.success('Property saved! ❤️')
            }
          }
        }
      }
      
      onSaveToggle?.()
    } catch (error) {
      toast.error('Failed to save property')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link 
      href={`/properties/${property.id}`} 
      className="block h-full no-underline"
    >
      <div className="card group h-full">
        <div className="relative w-full aspect-video overflow-hidden">
          {property.images && property.images[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#E91E63]/10 via-[#7B2D8E]/10 to-[#1A237E]/10 flex items-center justify-center">
              <span className="text-[#7B2D8E] text-sm font-medium">No image</span>
            </div>
          )}
          {property.featured && (
            <span className="absolute top-4 left-4 bg-gradient-to-r from-[#E91E63] to-[#7B2D8E] text-white px-3 py-1 rounded-full text-sm font-semibold z-10 shadow-lg">
              ⭐ Featured
            </span>
          )}
          <button
            onClick={handleSave}
            className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 z-20 shadow-lg ${
              isSaved 
                ? 'bg-[#E91E63] text-white' 
                : 'bg-white text-gray-600 hover:bg-[#E91E63] hover:text-white'
            }`}
            disabled={saving}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
              property.listing_type === 'rent' 
                ? 'bg-[#00BCD4] text-white' 
                : 'bg-[#7B2D8E] text-white'
            }`}>
              {property.listing_type === 'rent' ? '🏠 For Rent' : '🏡 For Sale'}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-[#7B2D8E] transition-colors">
            {property.title}
          </h3>
          <p className="text-2xl font-bold text-[#7B2D8E] mb-3">
            {formatPrice(property.price)}
            {property.listing_type === 'rent' && <span className="text-sm text-gray-500 font-normal">/month</span>}
          </p>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-[#E91E63]" />
            <span className="text-sm line-clamp-1">{property.area}, {property.city}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 text-sm pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#7B2D8E]" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[#00BCD4]" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4 text-[#1A237E]" />
              <span>{property.sqft} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
