'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createSupabaseClient } from '@/lib/supabase/client'
import { shouldUseMockData } from '@/lib/mock-api'
import toast from 'react-hot-toast'
import { Upload, X, MapPin, Home, Building2, Briefcase, Store, Image as ImageIcon, Info } from 'lucide-react'

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['flat', 'house', 'villa', 'office', 'shop']),
  listing_type: z.enum(['rent', 'sale']),
  price: z.number().min(1, 'Price must be greater than 0'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  sqft: z.number().min(1, 'Square footage is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_email: z.string().email('Invalid email'),
  owner_phone: z.string().min(10, 'Phone number is required'),
  location: z.string().min(1, 'Location is required').optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

export default function AddPropertyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const supabase = createSupabaseClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (shouldUseMockData()) {
      // In mock mode, allow form submission without auth
      setUser({ id: 'demo-user', email: 'demo@example.com' })
      setValue('owner_email', 'demo@example.com')
      return
    }

    if (!supabase) {
      // Allow form submission even without Supabase
      setUser({ id: 'demo-user', email: 'demo@example.com' })
      setValue('owner_email', 'demo@example.com')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setValue('owner_email', user.email || '')
      } else {
        // Allow form submission without login in demo mode
        setUser({ id: 'demo-user', email: 'demo@example.com' })
        setValue('owner_email', 'demo@example.com')
      }
    } catch (error) {
      console.warn('Auth check failed:', error)
      // Allow form submission anyway
      setUser({ id: 'demo-user', email: 'demo@example.com' })
      setValue('owner_email', 'demo@example.com')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages((prev) => [...prev, ...files])
      
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

    const uploadedUrls: string[] = []

    for (const image of images) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `properties/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('property-images')
        .upload(filePath, image)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const onSubmit = async (data: PropertyFormData) => {
    if (images.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    if (shouldUseMockData() || !supabase) {
      // In mock mode, show success message but don't actually save
      toast.success('Property form submitted successfully! (Demo mode - property not saved)')
      // Reset form
      setTimeout(() => {
        router.push('/properties')
      }, 2000)
      return
    }

    if (!user) {
      toast.error('Please login to add properties')
      router.push('/auth/login')
      return
    }

    setUploading(true)

    try {
      // Upload images
      const imageUrls = await uploadImages()

      // Create property
      const { error } = await supabase.from('properties').insert({
        ...data,
        owner_id: user.id,
        images: imageUrls,
        amenities: [],
        status: 'pending',
        featured: false,
      })

      if (error) throw error

      toast.success('Property added successfully! It will be reviewed before going live.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add property')
    } finally {
      setUploading(false)
    }
  }

  const propertyTypes = [
    { value: 'flat', label: 'Apartment', icon: Building2 },
    { value: 'house', label: 'House', icon: Home },
    { value: 'villa', label: 'Villa', icon: Home },
    { value: 'office', label: 'Office', icon: Briefcase },
    { value: 'shop', label: 'Shop', icon: Store },
  ]

  const amenitiesList = [
    'parking', 'security', 'elevator', 'gym', 'pool', 'garden', 'wifi', 
    'power_backup', 'water_supply', 'clubhouse', 'park', 'school_nearby'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Home className="w-6 h-6 text-primary-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Add New Property</h1>
            </div>
            <p className="text-gray-600">List your property and reach thousands of potential buyers/tenants</p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Tips for better listing:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Add clear, high-quality images</li>
                <li>Write a detailed description</li>
                <li>Provide accurate location and amenities</li>
                <li>Set a competitive price</li>
              </ul>
            </div>
          </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-8 bg-primary-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Property Title *"
              placeholder="e.g., Modern 3BHK Apartment in Gomti Nagar"
              {...register('title')}
              error={errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description * <span className="text-gray-500 text-xs">(Minimum 20 characters)</span>
              </label>
              <textarea
                placeholder="Describe your property in detail. Include features, nearby facilities, age of property, etc..."
                className="input-field min-h-[150px] resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Property Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        watch('type') === type.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type.value}
                        {...register('type')}
                        className="sr-only"
                      />
                      <type.icon className={`w-5 h-5 ${watch('type') === type.value ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Listing Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('listing_type') === 'rent'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="rent"
                      {...register('listing_type')}
                      className="sr-only"
                    />
                    <span className="font-medium">For Rent</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('listing_type') === 'sale'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="sale"
                      {...register('listing_type')}
                      className="sr-only"
                    />
                    <span className="font-medium">For Sale</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price *"
                type="number"
                placeholder={watch('listing_type') === 'rent' ? 'e.g., 25000' : 'e.g., 8500000'}
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />
              {watch('listing_type') === 'rent' ? (
                <div className="flex items-end">
                  <p className="text-sm text-gray-600 mb-2">per month</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Location</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City *"
                placeholder="e.g., Lucknow"
                {...register('city')}
                error={errors.city?.message}
              />
              <Input
                label="Area/Locality *"
                placeholder="e.g., Gomti Nagar, Hazratganj"
                {...register('area')}
                error={errors.area?.message}
              />
            </div>

            <Input
              label="Full Address"
              placeholder="Complete address of the property"
              {...register('location')}
              icon={<MapPin className="w-5 h-5" />}
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Location Coordinates (Optional)</p>
              <p className="text-xs text-gray-600 mb-3">Add coordinates for better map display</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 26.8467"
                  {...register('latitude', { valueAsNumber: true })}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 80.9462"
                  {...register('longitude', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Property Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Bedrooms"
                type="number"
                placeholder="e.g., 2, 3"
                {...register('bedrooms', { valueAsNumber: true })}
                error={errors.bedrooms?.message}
              />
              <p className="text-xs text-gray-500 mt-1">Enter 0 for commercial properties</p>
            </div>
            <div>
              <Input
                label="Bathrooms"
                type="number"
                placeholder="e.g., 2, 3"
                {...register('bathrooms', { valueAsNumber: true })}
                error={errors.bathrooms?.message}
              />
            </div>
            <div>
              <Input
                label="Carpet Area (sqft) *"
                type="number"
                placeholder="e.g., 1200"
                {...register('sqft', { valueAsNumber: true })}
                error={errors.sqft?.message}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Property Images</h2>
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-all">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 mb-1">Click to upload images</span>
            <span className="text-xs text-gray-500">JPG, PNG up to 5MB each</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </label>
          {imagePreviews.length === 0 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <Info className="w-4 h-4" />
              At least one image is required
            </p>
          )}
        </div>

        {/* Owner Details */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Owner/Agent Name *"
              placeholder="Enter your name"
              {...register('owner_name')}
              error={errors.owner_name?.message}
            />
            <Input
              label="Phone Number *"
              placeholder="e.g., +91 98765 43210"
              {...register('owner_phone')}
              error={errors.owner_phone?.message}
            />
            <div className="md:col-span-2">
              <Input
                label="Email Address *"
                type="email"
                placeholder="Enter your email"
                {...register('owner_email')}
                error={errors.owner_email?.message}
              />
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Ready to submit?</h3>
              <p className="text-sm text-gray-600">Review your details and submit to list your property</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSubmitting || uploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={isSubmitting || uploading} 
                size="lg"
                className="min-w-[150px]"
              >
                {isSubmitting || uploading ? 'Submitting...' : 'Submit Property'}
              </Button>
            </div>
          </div>
        </div>
      </form>
        </div>
      </div>
    </div>
  )
}
