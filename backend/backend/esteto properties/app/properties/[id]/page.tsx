'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, ArrowLeft, CheckCircle, Star, Video, FileText, Calendar } from 'lucide-react'
import { Property } from '@/lib/supabase/types'
import { createSupabaseClient } from '@/lib/supabase/client'
import apiClient from '@/lib/api-client'
import { formatPrice, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import PropertyMap from '@/components/properties/PropertyMap'
import toast from 'react-hot-toast'

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProperty()
      trackPropertyView()
    }
  }, [params.id])

  const trackPropertyView = async () => {
    const supabase = createSupabaseClient()
    if (!supabase || !params.id) return

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      // Track the view using the track_property_view function or direct insert
      await supabase.from('property_views').insert({
        property_id: params.id as string,
        user_id: user?.id || null,
        source: 'website',
      })
    } catch (error) {
      // Silently fail - view tracking should not affect user experience
      console.warn('Failed to track property view:', error)
    }
  }

  useEffect(() => {
    if (property) {
      checkIfSaved()
    }
  }, [property])

  const fetchProperty = async () => {
    setLoading(true)
    
    // Try Supabase first
    const supabase = createSupabaseClient()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single()

        if (data && !error) {
          setProperty(data)
          setLoading(false)
          return
        }
      } catch (e) {
        console.warn('Supabase property fetch failed:', e)
      }
    }

    // Fallback to backend API
    try {
      const response = await apiClient.getProperty(params.id as string)
      if (response.success && response.data) {
        const p = response.data as any
        setProperty({
          id: p.id,
          title: p.title,
          description: p.description || '',
          type: p.property_type || p.type || 'flat',
          listing_type: p.transaction_type === 'Buy' ? 'sale' : (p.listing_type || 'rent'),
          price: p.price,
          location: p.location || '',
          city: p.city || p.area || 'Lucknow',
          area: p.area || '',
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          sqft: p.size || p.sqft || 0,
          images: p.images || [],
          amenities: p.amenities || [],
          owner_id: p.owner_id || '',
          owner_name: p.owner_name || '',
          owner_email: p.owner_email || '',
          owner_phone: p.owner_phone || '',
          status: p.status || 'active',
          featured: p.is_featured || p.featured,
          created_at: p.created_at,
          updated_at: p.updated_at,
        } as Property)
      } else {
        toast.error('Property not found')
      }
    } catch (error) {
      console.error('Failed to fetch property:', error)
      toast.error('Failed to load property details')
    }
    
    setLoading(false)
  }

  const checkIfSaved = async () => {
    const supabase = createSupabaseClient()
    if (!supabase || !property) {
      setIsSaved(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsSaved(false)
        return
      }

      const { data } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .single()

      setIsSaved(!!data)
    } catch {
      setIsSaved(false)
    }
  }

  const handleSave = async () => {
    const supabase = createSupabaseClient()
    if (!supabase) {
      toast.error('Please sign in to save properties')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      if (!property) return

      if (isSaved) {
        await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)
        setIsSaved(false)
        toast.success('Removed from saved')
      } else {
        await supabase
          .from('saved_properties')
          .insert({
            user_id: user.id,
            property_id: property.id,
          })
        setIsSaved(true)
        toast.success('Saved property')
      }
    } catch (error: any) {
      toast.error('Failed to save property')
    }
  }

  const handleShare = () => {
    if (navigator.share && property) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      })
    }
  }

  const handleWhatsApp = () => {
    if (property) {
      const message = `Hi, I'm interested in ${property.title} at ${property.location}`
      window.open(`https://wa.me/${property.owner_phone}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button onClick={() => router.push('/properties')}>Back to Properties</Button>
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

      <div className="container-custom py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Properties
          </button>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                {property.featured && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                    <Star className="w-4 h-4 fill-current" />
                    Featured Property
                  </div>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="text-lg">{property.area}, {property.city}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    property.listing_type === 'rent' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 capitalize">{property.type}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  className={`${isSaved ? 'bg-primary-50 border-primary-600 text-primary-700' : ''}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current text-primary-600' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="relative h-[500px] overflow-hidden">
                {property.images && property.images.length > 0 && property.images[selectedImage] ? (
                  <Image
                    src={property.images[selectedImage]}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              {property.images && property.images.length > 1 && (
                <div className="p-4 bg-gradient-to-b from-white to-primary-50/30">
                  <div className="grid grid-cols-4 gap-3">
                    {property.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-primary-600 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={`${property.title} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 rounded-xl border border-primary-100">
                  <Bed className="w-8 h-8 text-primary-600 mb-3" />
                  <p className="text-gray-600 text-sm mb-1">Bedrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-100">
                  <Bath className="w-8 h-8 text-blue-600 mb-3" />
                  <p className="text-gray-600 text-sm mb-1">Bathrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-xl border border-green-100">
                  <Square className="w-8 h-8 text-green-600 mb-3" />
                  <p className="text-gray-600 text-sm mb-1">Area</p>
                  <p className="text-2xl font-bold text-gray-900">{property.sqft} sqft</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-xl border border-purple-100">
                  <p className="text-gray-600 text-sm mb-3">Type</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{property.type}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100 hover:shadow-md transition-shadow"
                    >
                      <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <span className="capitalize text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <Video className="w-8 h-8 text-primary-600" />
                  Property Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.videos.map((video, index) => (
                    <div key={index} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                      {video.includes('youtube.com') || video.includes('youtu.be') ? (
                        <iframe
                          src={video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allowFullScreen
                          title={`Property Video ${index + 1}`}
                        />
                      ) : (
                        <video
                          src={video}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {property.documents && property.documents.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary-600" />
                  Property Documents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-primary-600 text-sm font-medium">View PDF →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Location</h2>
                <PropertyMap
                  lat={property.latitude}
                  lng={property.longitude}
                  title={property.title}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 sticky top-24">
              <div className="text-center mb-8 pb-6 border-b border-gray-200">
                <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                  {formatPrice(property.price)}
                </p>
                {property.listing_type === 'rent' && (
                  <p className="text-gray-600 font-medium">per month</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Listed on {formatDate(property.created_at)}</p>
              </div>

              <div className="space-y-3 mb-6">
                {property.allow_booking !== false && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg" 
                    size="lg"
                    onClick={() => toast.success('Booking request sent! Owner will contact you soon.')}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Visit
                  </Button>
                )}
                <Button 
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 shadow-lg" 
                  size="lg"
                  onClick={() => window.location.href = `tel:${property.owner_phone}`}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Owner
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50" 
                  size="lg" 
                  onClick={handleWhatsApp}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-2" 
                  size="lg"
                  onClick={() => window.location.href = `mailto:${property.owner_email}`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Owner
                </Button>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-6 border border-primary-100 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-800 rounded"></div>
                  Owner Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{property.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{property.owner_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{property.owner_phone}</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-gray-200">
                {property.status === 'active' && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    Status: Active
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
