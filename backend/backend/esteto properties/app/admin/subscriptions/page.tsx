'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard, Plus, Edit, Trash2, X, Save, Search, Eye,
  ChevronLeft, ChevronRight, Download, RefreshCw, Crown, Check, Users
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  duration_days: number
  max_listings: number
  featured_listings: number
  boost_included: boolean
  priority_support: boolean
  badge?: string
  active: boolean
  sort_order: number
}

interface UserSubscription {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  plan_id: string
  plan_name?: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  payment_method?: string
  amount_paid: number
  start_date: string
  end_date: string
  auto_renew: boolean
  created_at: string
}

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscribers'>('plans')
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const supabase = createSupabaseClient()

  const [planForm, setPlanForm] = useState({
    name: '', slug: '', description: '', price: '0', duration_days: '30',
    max_listings: '5', featured_listings: '0', boost_included: false,
    priority_support: false, badge: '', active: true, sort_order: '0',
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)

    if (supabase) {
      try {
      const [plansRes, subsRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').order('sort_order'),
        supabase.from('user_subscriptions').select(`*, users:user_id(name, email), subscription_plans:plan_id(name)`).order('created_at', { ascending: false }),
      ])
      if (plansRes.data) setPlans(plansRes.data)
      if (subsRes.data) setSubscriptions(subsRes.data.map((s: any) => ({
        ...s, user_name: s.users?.name, user_email: s.users?.email, plan_name: s.subscription_plans?.name,
      })))
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    setPlans([])
    setSubscriptions([])
    setLoading(false)
  }

  const resetPlanForm = () => {
    setPlanForm({ name: '', slug: '', description: '', price: '0', duration_days: '30', max_listings: '5', featured_listings: '0', boost_included: false, priority_support: false, badge: '', active: true, sort_order: '0' })
  }

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name, slug: plan.slug, description: plan.description, price: plan.price.toString(),
      duration_days: plan.duration_days.toString(), max_listings: plan.max_listings.toString(),
      featured_listings: plan.featured_listings.toString(), boost_included: plan.boost_included,
      priority_support: plan.priority_support, badge: plan.badge || '', active: plan.active,
      sort_order: plan.sort_order.toString(),
    })
    setShowPlanModal(true)
  }

  const handleSavePlan = async () => {
    if (!planForm.name || !planForm.slug) { toast.error('Name and slug are required'); return }

    const planData = {
      name: planForm.name, slug: planForm.slug, description: planForm.description,
      price: parseFloat(planForm.price), duration_days: parseInt(planForm.duration_days),
      max_listings: parseInt(planForm.max_listings), featured_listings: parseInt(planForm.featured_listings),
      boost_included: planForm.boost_included, priority_support: planForm.priority_support,
      badge: planForm.badge || null, active: planForm.active, sort_order: parseInt(planForm.sort_order),
    }

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      if (editingPlan) {
        const { error } = await supabase.from('subscription_plans').update({ ...planData, updated_at: new Date().toISOString() }).eq('id', editingPlan.id)
        if (error) throw error
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planData } : p))
        toast.success('Plan updated')
      } else {
        const { data, error } = await supabase.from('subscription_plans').insert(planData).select().single()
        if (error) throw error
        setPlans(prev => [...prev, data])
        toast.success('Plan created')
      }
      setShowPlanModal(false); setEditingPlan(null); resetPlanForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan')
    }
  }

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id)
      if (error) throw error
      setPlans(prev => prev.filter(p => p.id !== id)); toast.success('Plan deleted')
    } catch (error: any) { toast.error(error.message || 'Failed to delete plan') }
  }

  const exportCSV = () => {
    const headers = ['User', 'Email', 'Plan', 'Status', 'Amount', 'Payment', 'Start', 'End', 'Auto Renew']
    const rows = filteredSubs.map(s => [s.user_name, s.user_email, s.plan_name, s.status, `₹${s.amount_paid}`, s.payment_method, new Date(s.start_date).toLocaleDateString(), new Date(s.end_date).toLocaleDateString(), s.auto_renew ? 'Yes' : 'No'])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    toast.success('CSV exported')
  }

  const filteredSubs = subscriptions.filter(s => {
    const matchSearch = !searchQuery || s.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage)
  const paginatedSubs = filteredSubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount_paid, 0)
  const activeSubs = subscriptions.filter(s => s.status === 'active').length

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions & Plans</h1>
          <p className="text-gray-600 mt-1">Manage pricing plans and user subscriptions</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'subscribers' && <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>}
          {activeTab === 'plans' && <Button onClick={() => { resetPlanForm(); setEditingPlan(null); setShowPlanModal(true) }}><Plus className="w-4 h-4 mr-2" />Add Plan</Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CreditCard className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p><p className="text-sm text-gray-600">Active Revenue</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{activeSubs}</p><p className="text-sm text-gray-600">Active Subscribers</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Crown className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{plans.length}</p><p className="text-sm text-gray-600">Plans</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'plans' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Plans</button>
        <button onClick={() => setActiveTab('subscribers')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'subscribers' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Subscribers ({subscriptions.length})</button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.sort((a, b) => a.sort_order - b.sort_order).map(plan => (
            <div key={plan.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 ${!plan.active ? 'opacity-50 border-gray-200' : plan.price > 0 ? 'border-primary-200' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                {plan.badge && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">{plan.badge}</span>}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">₹{plan.price}<span className="text-sm font-normal text-gray-500">/{plan.duration_days}d</span></p>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />{plan.max_listings === -1 ? 'Unlimited' : plan.max_listings} listings</li>
                <li className="flex items-center gap-2"><Check className={`w-4 h-4 ${plan.featured_listings > 0 ? 'text-green-500' : 'text-gray-300'}`} />{plan.featured_listings} featured</li>
                <li className="flex items-center gap-2"><Check className={`w-4 h-4 ${plan.boost_included ? 'text-green-500' : 'text-gray-300'}`} />Boost {plan.boost_included ? 'included' : 'not included'}</li>
                <li className="flex items-center gap-2"><Check className={`w-4 h-4 ${plan.priority_support ? 'text-green-500' : 'text-gray-300'}`} />Priority support</li>
              </ul>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditPlan(plan)} className="flex-1"><Edit className="w-4 h-4 mr-1" />Edit</Button>
                <Button size="sm" variant="outline" onClick={() => deletePlan(plan.id)} className="text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search subscribers..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="px-4 py-2 border border-gray-200 rounded-lg">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedSubs.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{sub.user_name || sub.user_id}</p>
                        <p className="text-xs text-gray-500">{sub.user_email}</p>
                      </td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">{sub.plan_name || sub.plan_id}</span></td>
                      <td className="px-4 py-3 font-medium text-gray-900">₹{sub.amount_paid}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          sub.status === 'active' ? 'bg-green-100 text-green-700' :
                          sub.status === 'expired' ? 'bg-red-100 text-red-700' :
                          sub.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{sub.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                        {sub.auto_renew && <span className="ml-1 text-xs text-green-600">(auto)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{sub.payment_method || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubs.length)} of {filteredSubs.length}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}
            {filteredSubs.length === 0 && (
              <div className="text-center py-12"><CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No subscribers found</p></div>
            )}
          </div>
        </>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                  <input type="text" value={planForm.name} onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" value={planForm.slug} onChange={(e) => setPlanForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={planForm.description} onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" value={planForm.price} onChange={(e) => setPlanForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input type="number" value={planForm.duration_days} onChange={(e) => setPlanForm(prev => ({ ...prev, duration_days: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Listings (-1 = unlimited)</label>
                  <input type="number" value={planForm.max_listings} onChange={(e) => setPlanForm(prev => ({ ...prev, max_listings: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Listings</label>
                  <input type="number" value={planForm.featured_listings} onChange={(e) => setPlanForm(prev => ({ ...prev, featured_listings: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                  <input type="text" value={planForm.badge} onChange={(e) => setPlanForm(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={planForm.sort_order} onChange={(e) => setPlanForm(prev => ({ ...prev, sort_order: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'boost_included', label: 'Boost Included' },
                  { key: 'priority_support', label: 'Priority Support' },
                  { key: 'active', label: 'Active' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(planForm as any)[item.key]} onChange={(e) => setPlanForm(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>Cancel</Button>
              <Button onClick={handleSavePlan}><Save className="w-4 h-4 mr-2" />{editingPlan ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
