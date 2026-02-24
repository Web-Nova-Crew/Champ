'use client'

import { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Home,
  Building2,
  Castle,
  Warehouse,
  Store,
  LandPlot,
  Hotel,
  TreePine
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface PropertyCategory {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
  active: boolean
  created_at: string
  property_count: number
}

interface Amenity {
  id: string
  name: string
  icon: string
  category: 'basic' | 'comfort' | 'security' | 'outdoor'
  active: boolean
  created_at: string
}

const iconOptions = [
  { name: 'Home', icon: Home },
  { name: 'Building2', icon: Building2 },
  { name: 'Castle', icon: Castle },
  { name: 'Warehouse', icon: Warehouse },
  { name: 'Store', icon: Store },
  { name: 'LandPlot', icon: LandPlot },
  { name: 'Hotel', icon: Hotel },
  { name: 'TreePine', icon: TreePine },
]

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'amenities'>('categories')
  const [categories, setCategories] = useState<PropertyCategory[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showAmenityModal, setShowAmenityModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PropertyCategory | null>(null)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [supabase] = useState(() => createSupabaseClient())

  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: 'Home', description: '', active: true })
  const [amenityForm, setAmenityForm] = useState({ name: '', icon: 'wifi', category: 'basic' as Amenity['category'], active: true })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    if (!supabase) return
    setLoading(true)

    try {
      // Fetch categories and amenities in parallel
      const [categoriesData, amenitiesData] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: false }),
        supabase.from('amenities').select('*').order('created_at', { ascending: false }),
      ])

      if (categoriesData.error) throw categoriesData.error
      if (amenitiesData.error) throw amenitiesData.error

      // Add property_count to categories (mock for now, could be calculated from properties table)
      const categoriesWithCount = (categoriesData.data || []).map(cat => ({
        ...cat,
        property_count: Math.floor(Math.random() * 100) + 1, // Mock count
      }))

      setCategories(categoriesWithCount)
      setAmenities(amenitiesData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const saveCategory = async () => {
    if (!supabase || !categoryForm.name || !categoryForm.slug) {
      toast.error('Name and slug are required')
      return
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryForm.name,
            slug: categoryForm.slug,
            icon: categoryForm.icon,
            description: categoryForm.description,
            active: categoryForm.active,
          })
          .eq('id', editingCategory.id)

        if (error) throw error

        setCategories(prev => prev.map(c =>
          c.id === editingCategory.id
            ? { ...c, ...categoryForm }
            : c
        ))
        toast.success('Category updated')
      } else {
        const exists = categories.some(c => c.slug === categoryForm.slug)
        if (exists) {
          toast.error('A category with this slug already exists')
          return
        }

        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: categoryForm.name,
            slug: categoryForm.slug,
            icon: categoryForm.icon,
            description: categoryForm.description,
            active: categoryForm.active,
          })
          .select()

        if (error) throw error

        const newCategory = (data || [])[0]
        if (newCategory) {
          setCategories(prev => [...prev, { ...newCategory, property_count: 0 }])
        }
        toast.success('Category created')
      }

      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', slug: '', icon: 'Home', description: '', active: true })
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    }
  }

  const saveAmenity = async () => {
    if (!supabase || !amenityForm.name) {
      toast.error('Name is required')
      return
    }

    try {
      if (editingAmenity) {
        const { error } = await supabase
          .from('amenities')
          .update({
            name: amenityForm.name,
            icon: amenityForm.icon,
            category: amenityForm.category,
            active: amenityForm.active,
          })
          .eq('id', editingAmenity.id)

        if (error) throw error

        setAmenities(prev => prev.map(a =>
          a.id === editingAmenity.id
            ? { ...a, ...amenityForm }
            : a
        ))
        toast.success('Amenity updated')
      } else {
        const { data, error } = await supabase
          .from('amenities')
          .insert({
            name: amenityForm.name,
            icon: amenityForm.icon,
            category: amenityForm.category,
            active: amenityForm.active,
          })
          .select()

        if (error) throw error

        setAmenities(prev => [...prev, ...(data || [])])
        toast.success('Amenity created')
      }

      setShowAmenityModal(false)
      setEditingAmenity(null)
      setAmenityForm({ name: '', icon: 'wifi', category: 'basic', active: true })
    } catch (error) {
      console.error('Error saving amenity:', error)
      toast.error('Failed to save amenity')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error

      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Category deleted')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const deleteAmenity = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this amenity?')) return

    try {
      const { error } = await supabase.from('amenities').delete().eq('id', id)
      if (error) throw error

      setAmenities(prev => prev.filter(a => a.id !== id))
      toast.success('Amenity deleted')
    } catch (error) {
      console.error('Error deleting amenity:', error)
      toast.error('Failed to delete amenity')
    }
  }

  const toggleCategoryActive = async (id: string) => {
    if (!supabase) return

    const category = categories.find(c => c.id === id)
    if (!category) return

    try {
      const { error } = await supabase
        .from('categories')
        .update({ active: !category.active })
        .eq('id', id)

      if (error) throw error

      setCategories(prev => prev.map(c =>
        c.id === id ? { ...c, active: !c.active } : c
      ))
      toast.success('Category status updated')
    } catch (error) {
      console.error('Error toggling category status:', error)
      toast.error('Failed to update category status')
    }
  }

  const toggleAmenityActive = async (id: string) => {
    if (!supabase) return

    const amenity = amenities.find(a => a.id === id)
    if (!amenity) return

    try {
      const { error } = await supabase
        .from('amenities')
        .update({ active: !amenity.active })
        .eq('id', id)

      if (error) throw error

      setAmenities(prev => prev.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      ))
      toast.success('Amenity status updated')
    } catch (error) {
      console.error('Error toggling amenity status:', error)
      toast.error('Failed to update amenity status')
    }
  }

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.icon : Home
  }

  const amenityCategories = ['basic', 'comfort', 'security', 'outdoor']

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
          <h1 className="text-2xl font-bold text-gray-900">Categories & Amenities</h1>
          <p className="text-gray-600 mt-1">Manage property types and amenities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'categories' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Property Types
        </button>
        <button
          onClick={() => setActiveTab('amenities')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'amenities' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Amenities
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Property Types ({categories.length})</h2>
            <Button size="sm" onClick={() => { setCategoryForm({ name: '', slug: '', icon: 'Home', description: '', active: true }); setEditingCategory(null); setShowCategoryModal(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              Add Type
            </Button>
          </div>
          <div className="divide-y divide-gray-100">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              return (
                <div key={category.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${!category.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.description || category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{category.property_count} properties</span>
                    <button
                      onClick={() => toggleCategoryActive(category.id)}
                      className={`px-2 py-1 text-xs rounded-full ${category.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {category.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, slug: category.slug, icon: category.icon, description: category.description || '', active: category.active }); setShowCategoryModal(true); }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Amenities Tab */}
      {activeTab === 'amenities' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setAmenityForm({ name: '', icon: 'wifi', category: 'basic', active: true }); setEditingAmenity(null); setShowAmenityModal(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              Add Amenity
            </Button>
          </div>
          
          {amenityCategories.map((cat) => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 capitalize">{cat} Amenities</h2>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenities.filter(a => a.category === cat).map((amenity) => (
                  <div key={amenity.id} className={`p-3 border rounded-lg flex items-center justify-between ${!amenity.active ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
                    <span className="font-medium text-gray-900">{amenity.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAmenityActive(amenity.id)}
                        className={`w-2 h-2 rounded-full ${amenity.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <button
                        onClick={() => { setEditingAmenity(amenity); setAmenityForm({ name: amenity.name, icon: amenity.icon, category: amenity.category, active: amenity.active }); setShowAmenityModal(true); }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-3 h-3 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteAmenity(amenity.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="e.g., Flat/Apartment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="Auto-generated from name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setCategoryForm(prev => ({ ...prev, icon: opt.name }))}
                      className={`p-3 rounded-lg border ${categoryForm.icon === opt.name ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                    >
                      <opt.icon className="w-5 h-5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="Brief description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={categoryForm.active}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="catActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
              <Button onClick={saveCategory}>
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Amenity Modal */}
      {showAmenityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingAmenity ? 'Edit Amenity' : 'Add Amenity'}</h2>
              <button onClick={() => setShowAmenityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={amenityForm.name}
                  onChange={(e) => setAmenityForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="e.g., Swimming Pool"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={amenityForm.category}
                  onChange={(e) => setAmenityForm(prev => ({ ...prev, category: e.target.value as Amenity['category'] }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="basic">Basic</option>
                  <option value="comfort">Comfort</option>
                  <option value="security">Security</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="amenityActive"
                  checked={amenityForm.active}
                  onChange={(e) => setAmenityForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="amenityActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAmenityModal(false)}>Cancel</Button>
              <Button onClick={saveAmenity}>
                <Save className="w-4 h-4 mr-2" />
                {editingAmenity ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
