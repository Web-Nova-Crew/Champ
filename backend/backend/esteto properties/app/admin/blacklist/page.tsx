'use client'

import { useState, useEffect } from 'react'
import {
  Shield, Plus, Trash2, X, Save, Search, Ban,
  Phone, Mail, Globe, Smartphone, AlertTriangle, RefreshCw
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface BlacklistEntry {
  id: string
  type: 'phone' | 'email' | 'ip' | 'device' | 'keyword'
  value: string
  reason?: string
  active: boolean
  expires_at?: string
  created_at: string
}

export default function AdminBlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const supabase = createSupabaseClient()

  const [formData, setFormData] = useState({
    type: 'phone' as BlacklistEntry['type'],
    value: '',
    reason: '',
    active: true,
    expires_at: '',
  })

  useEffect(() => { fetchEntries() }, [])

  const fetchEntries = async () => {
    setLoading(true)

    if (supabase) {
      try {
        const { data, error } = await supabase.from('blacklist').select('*').order('created_at', { ascending: false })
        if (!error && data) {
          setEntries(data)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to fetch blacklist:', error)
      }
    }
    
    setEntries([])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.value) {
      toast.error('Value is required')
      return
    }

    const entryData = {
      type: formData.type,
      value: formData.value,
      reason: formData.reason || null,
      active: formData.active,
      expires_at: formData.expires_at || null,
    }

    if (!supabase) {
      toast.error('Database not connected')
      return
    }

    try {
      const { data, error } = await supabase.from('blacklist').insert(entryData).select().single()
      if (error) throw error
      setEntries(prev => [data, ...prev])
      toast.success('Entry added to blacklist')
      setShowModal(false)
      setFormData({ type: 'phone', value: '', reason: '', active: true, expires_at: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to add entry')
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Remove this entry from blacklist?')) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('blacklist').delete().eq('id', id)
      if (error) throw error
      setEntries(prev => prev.filter(e => e.id !== id))
      toast.success('Entry removed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove entry')
    }
  }

  const toggleActive = async (entry: BlacklistEntry) => {
    const newActive = !entry.active
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('blacklist').update({ active: newActive }).eq('id', entry.id)
      if (error) throw error
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, active: newActive } : e))
      toast.success(newActive ? 'Entry activated' : 'Entry deactivated')
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const filteredEntries = entries.filter(e => {
    const matchSearch = !searchQuery || e.value.toLowerCase().includes(searchQuery.toLowerCase()) || e.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = typeFilter === 'all' || e.type === typeFilter
    return matchSearch && matchType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'ip': return <Globe className="w-4 h-4" />
      case 'device': return <Smartphone className="w-4 h-4" />
      case 'keyword': return <AlertTriangle className="w-4 h-4" />
      default: return <Ban className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      phone: 'bg-green-100 text-green-700',
      email: 'bg-blue-100 text-blue-700',
      ip: 'bg-purple-100 text-purple-700',
      device: 'bg-orange-100 text-orange-700',
      keyword: 'bg-yellow-100 text-yellow-700',
    }
    return map[type] || 'bg-gray-100 text-gray-700'
  }

  const stats = {
    total: entries.length,
    active: entries.filter(e => e.active).length,
    phones: entries.filter(e => e.type === 'phone' && e.active).length,
    emails: entries.filter(e => e.type === 'email' && e.active).length,
    ips: entries.filter(e => e.type === 'ip' && e.active).length,
    keywords: entries.filter(e => e.type === 'keyword' && e.active).length,
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blacklist & Fraud Protection</h1>
          <p className="text-gray-600 mt-1">Block phones, emails, IPs, devices, and keywords</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEntries}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => { setFormData({ type: 'phone', value: '', reason: '', active: true, expires_at: '' }); setShowModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />Add to Blacklist
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Shield },
          { label: 'Active', value: stats.active, icon: Ban },
          { label: 'Phones', value: stats.phones, icon: Phone },
          { label: 'Emails', value: stats.emails, icon: Mail },
          { label: 'IPs', value: stats.ips, icon: Globe },
          { label: 'Keywords', value: stats.keywords, icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <s.icon className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search blacklist..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Types</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="ip">IP Address</option>
            <option value="device">Device</option>
            <option value="keyword">Keyword</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${!entry.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBadge(entry.type)}`}>
                  {getTypeIcon(entry.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 font-mono">{entry.value}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getTypeBadge(entry.type)}`}>{entry.type}</span>
                  </div>
                  {entry.reason && <p className="text-sm text-gray-500 mt-0.5">{entry.reason}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Added: {new Date(entry.created_at).toLocaleDateString()}</span>
                    {entry.expires_at && <span className="text-orange-500">Expires: {new Date(entry.expires_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(entry)}
                  className={`px-2 py-1 text-xs rounded-full ${entry.active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                  {entry.active ? 'Blocked' : 'Inactive'}
                </button>
                <button onClick={() => deleteEntry(entry.id)} className="p-2 hover:bg-red-100 rounded-lg" title="Remove">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12"><Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No blacklist entries found</p></div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add to Blacklist</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as BlacklistEntry['type'] }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="phone">Phone Number</option>
                  <option value="email">Email Address</option>
                  <option value="ip">IP Address</option>
                  <option value="device">Device Fingerprint</option>
                  <option value="keyword">Keyword</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                <input type="text" value={formData.value} onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder={formData.type === 'phone' ? '+91 9876543210' : formData.type === 'email' ? 'spam@example.com' : formData.type === 'ip' ? '192.168.1.1' : formData.type === 'keyword' ? 'spam keyword' : 'device-id'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input type="text" value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Why is this being blocked?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                <input type="date" value={formData.expires_at} onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Leave empty for permanent block</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-gray-700">Active (block immediately)</span>
              </label>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Add to Blacklist</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
