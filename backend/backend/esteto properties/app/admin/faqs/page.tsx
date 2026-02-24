'use client'

import { useState, useEffect } from 'react'
import {
  HelpCircle, Plus, Edit, Trash2, X, Save, Search,
  ChevronUp, ChevronDown, GripVertical
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  active: boolean
}

const categoryOptions = ['general', 'listings', 'payments', 'account', 'agents', 'legal']

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const supabase = createSupabaseClient()

  const [formData, setFormData] = useState({
    question: '', answer: '', category: 'general', sort_order: '0', active: true,
  })

  useEffect(() => { fetchFaqs() }, [])

  const fetchFaqs = async () => {
    setLoading(true)

    // Always try Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('faqs').select('*').order('sort_order')
        if (!error && data) {
          setFaqs(data)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error)
      }
    }
    
    // Only show empty state if Supabase fails
    setFaqs([])
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({ question: '', answer: '', category: 'general', sort_order: '0', active: true })
  }

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question, answer: faq.answer, category: faq.category,
      sort_order: faq.sort_order.toString(), active: faq.active,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast.error('Question and answer are required')
      return
    }

    const faqData = {
      question: formData.question, answer: formData.answer, category: formData.category,
      sort_order: parseInt(formData.sort_order), active: formData.active,
    }

    if (!supabase) {
      toast.error('Database not connected')
      return
    }

    try {
      if (editingFaq) {
        const { error } = await supabase.from('faqs').update({ ...faqData, updated_at: new Date().toISOString() }).eq('id', editingFaq.id)
        if (error) throw error
        setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...faqData } : f))
        toast.success('FAQ updated')
      } else {
        const { data, error } = await supabase.from('faqs').insert(faqData).select().single()
        if (error) throw error
        setFaqs(prev => [...prev, data])
        toast.success('FAQ created')
      }
      setShowModal(false); setEditingFaq(null); resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save FAQ')
    }
  }

  const deleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id)
      if (error) throw error
      setFaqs(prev => prev.filter(f => f.id !== id)); toast.success('FAQ deleted')
    } catch (error: any) { toast.error(error.message || 'Failed to delete FAQ') }
  }

  const toggleActive = async (faq: FAQ) => {
    const newActive = !faq.active
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('faqs').update({ active: newActive }).eq('id', faq.id)
      if (error) throw error
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, active: newActive } : f))
    } catch (error) { toast.error('Failed to update') }
  }

  const moveOrder = async (faq: FAQ, direction: 'up' | 'down') => {
    const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(f => f.id === faq.id)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sorted.length - 1)) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const tempOrder = sorted[idx].sort_order
    sorted[idx].sort_order = sorted[swapIdx].sort_order
    sorted[swapIdx].sort_order = tempOrder
    setFaqs([...sorted])

    if (supabase) {
      await Promise.all([
        supabase.from('faqs').update({ sort_order: sorted[idx].sort_order }).eq('id', sorted[idx].id),
        supabase.from('faqs').update({ sort_order: sorted[swapIdx].sort_order }).eq('id', sorted[swapIdx].id),
      ])
    }
  }

  const filteredFaqs = faqs
    .filter(f => {
      const matchSearch = !searchQuery || f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = categoryFilter === 'all' || f.category === categoryFilter
      return matchSearch && matchCategory
    })
    .sort((a, b) => a.sort_order - b.sort_order)

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs Management</h1>
          <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingFaq(null); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search FAQs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Categories</option>
            {categoryOptions.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className={`p-4 ${!faq.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 mt-1">
                  <button onClick={() => moveOrder(faq, 'up')} className="p-0.5 hover:bg-gray-100 rounded"><ChevronUp className="w-4 h-4 text-gray-400" /></button>
                  <button onClick={() => moveOrder(faq, 'down')} className="p-0.5 hover:bg-gray-100 rounded"><ChevronDown className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-primary-600" />
                    <p className="font-medium text-gray-900">{faq.question}</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{faq.answer}</p>
                  <div className="flex items-center gap-2 mt-2 ml-6">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">{faq.category}</span>
                    <span className="text-xs text-gray-400">Order: {faq.sort_order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(faq)} className={`px-2 py-1 text-xs rounded-full ${faq.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {faq.active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEdit(faq)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => deleteFaq(faq.id)} className="p-2 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12"><HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No FAQs found</p></div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input type="text" value={formData.question} onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., How do I list my property?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea value={formData.answer} onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  rows={5} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Detailed answer..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    {categoryOptions.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />{editingFaq ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
