'use client'

import { useState, useEffect } from 'react'
import {
  Megaphone, Plus, Edit, Trash2, X, Save, Search, Eye,
  ChevronLeft, ChevronRight, RefreshCw, Calendar, DollarSign,
  BarChart3, MousePointer, Monitor
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface AdSlot {
  id: string
  name: string
  location: string
  size: string
  price_per_day: number
  active: boolean
}

interface AdBooking {
  id: string
  slot_id: string
  slot_name?: string
  advertiser_name: string
  advertiser_email: string
  image_url: string
  link_url: string
  start_date: string
  end_date: string
  amount_paid: number
  status: 'active' | 'pending' | 'expired' | 'rejected'
  impressions: number
  clicks: number
  created_at: string
}

export default function AdminAdsPage() {
  const [activeTab, setActiveTab] = useState<'slots' | 'bookings'>('bookings')
  const [slots, setSlots] = useState<AdSlot[]>([])
  const [bookings, setBookings] = useState<AdBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const supabase = createSupabaseClient()

  const [slotForm, setSlotForm] = useState({
    name: '', location: '', size: '', price_per_day: '0', active: true,
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)

    if (supabase) {
      try {
      const [slotsRes, bookingsRes] = await Promise.all([
        supabase.from('ad_slots').select('*').order('name'),
        supabase.from('ad_bookings').select(`*, ad_slots:slot_id(name)`).order('created_at', { ascending: false }),
      ])
      if (slotsRes.data) setSlots(slotsRes.data)
      if (bookingsRes.data) setBookings(bookingsRes.data.map((b: any) => ({ ...b, slot_name: b.ad_slots?.name })))
      } catch (error) {
        console.error('Failed to fetch ads data:', error)
      }
    }
    setSlots([])
    setBookings([])
    setLoading(false)
  }

  const handleSaveSlot = async () => {
    if (!slotForm.name || !slotForm.location) { toast.error('Name and location are required'); return }
    if (!supabase) { toast.error('Database not connected'); return }

    const slotData = { name: slotForm.name, location: slotForm.location, size: slotForm.size, price_per_day: parseFloat(slotForm.price_per_day), active: slotForm.active }

    try {
      if (editingSlot) {
        const { error } = await supabase.from('ad_slots').update({ ...slotData, updated_at: new Date().toISOString() }).eq('id', editingSlot.id)
        if (error) throw error
        setSlots(prev => prev.map(s => s.id === editingSlot.id ? { ...s, ...slotData } : s))
        toast.success('Slot updated')
      } else {
        const { data, error } = await supabase.from('ad_slots').insert(slotData).select().single()
        if (error) throw error
        setSlots(prev => [...prev, data])
        toast.success('Slot created')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save slot')
    }
    setShowSlotModal(false); setEditingSlot(null)
  }

  const handleBookingStatus = async (id: string, newStatus: string) => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('ad_bookings').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as AdBooking['status'] } : b))
      toast.success('Status updated')
    } catch (error: any) { toast.error(error.message || 'Failed to update') }
  }

  const deleteSlot = async (id: string) => {
    if (!confirm('Delete this ad slot?')) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('ad_slots').delete().eq('id', id)
      if (error) throw error
      setSlots(prev => prev.filter(s => s.id !== id)); toast.success('Deleted')
    } catch (error: any) { toast.error(error.message || 'Failed to delete') }
  }

  const filteredBookings = bookings.filter(b => {
    const matchSearch = !searchQuery || b.advertiser_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.advertiser_email.toLowerCase().includes(searchQuery.toLowerCase()) || b.slot_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalRevenue = bookings.filter(b => b.status === 'active' || b.status === 'expired').reduce((sum, b) => sum + b.amount_paid, 0)
  const totalImpressions = bookings.reduce((sum, b) => sum + b.impressions, 0)
  const totalClicks = bookings.reduce((sum, b) => sum + b.clicks, 0)
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0'

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Marketplace</h1>
          <p className="text-gray-600 mt-1">Manage ad slots and advertiser bookings</p>
        </div>
        {activeTab === 'slots' && (
          <Button onClick={() => { setSlotForm({ name: '', location: '', size: '', price_per_day: '0', active: true }); setEditingSlot(null); setShowSlotModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />Add Slot
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
          { label: 'Impressions', value: totalImpressions.toLocaleString(), icon: Monitor, color: 'bg-blue-100 text-blue-600' },
          { label: 'Clicks', value: totalClicks.toLocaleString(), icon: MousePointer, color: 'bg-purple-100 text-purple-600' },
          { label: 'CTR', value: `${ctr}%`, icon: BarChart3, color: 'bg-yellow-100 text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-sm text-gray-600">{s.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'bookings' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Bookings ({bookings.length})</button>
        <button onClick={() => setActiveTab('slots')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'slots' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Ad Slots ({slots.length})</button>
      </div>

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Slot Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price/Day</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slots.map(slot => (
                  <tr key={slot.id} className={`hover:bg-gray-50 ${!slot.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{slot.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{slot.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{slot.size}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">₹{slot.price_per_day}/day</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${slot.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {slot.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingSlot(slot); setSlotForm({ name: slot.name, location: slot.location, size: slot.size, price_per_day: slot.price_per_day.toString(), active: slot.active }); setShowSlotModal(true) }}
                          className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => deleteSlot(slot.id)} className="p-2 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {slots.length === 0 && (
            <div className="text-center py-12"><Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No ad slots configured</p></div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search bookings..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="px-4 py-2 border border-gray-200 rounded-lg">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Advertiser</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Slot</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Performance</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{booking.advertiser_name}</p>
                        <p className="text-xs text-gray-500">{booking.advertiser_email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.slot_name || booking.slot_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">₹{booking.amount_paid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <p className="text-gray-900">{booking.impressions.toLocaleString()} views</p>
                        <p className="text-xs text-gray-500">{booking.clicks.toLocaleString()} clicks ({booking.impressions > 0 ? ((booking.clicks / booking.impressions) * 100).toFixed(1) : 0}% CTR)</p>
                      </td>
                      <td className="px-4 py-3">
                        <select value={booking.status} onChange={(e) => handleBookingStatus(booking.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                            booking.status === 'active' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="expired">Expired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}
            {filteredBookings.length === 0 && (
              <div className="text-center py-12"><Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No ad bookings found</p></div>
            )}
          </div>
        </>
      )}

      {/* Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingSlot ? 'Edit Ad Slot' : 'Create Ad Slot'}</h2>
              <button onClick={() => setShowSlotModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Name *</label>
                <input type="text" value={slotForm.name} onChange={(e) => setSlotForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Homepage Banner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <select value={slotForm.location} onChange={(e) => setSlotForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="">Select Location</option>
                  <option value="homepage_top">Homepage Top</option>
                  <option value="homepage_middle">Homepage Middle</option>
                  <option value="sidebar_right">Sidebar Right</option>
                  <option value="search_top">Search Results Top</option>
                  <option value="property_sidebar">Property Detail Sidebar</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size (px)</label>
                  <input type="text" value={slotForm.size} onChange={(e) => setSlotForm(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., 1200x300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Day (₹)</label>
                  <input type="number" value={slotForm.price_per_day} onChange={(e) => setSlotForm(prev => ({ ...prev, price_per_day: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={slotForm.active} onChange={(e) => setSlotForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSlotModal(false)}>Cancel</Button>
              <Button onClick={handleSaveSlot}><Save className="w-4 h-4 mr-2" />{editingSlot ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
