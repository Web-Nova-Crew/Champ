'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Mail,
  Smartphone,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
  Copy,
  Send
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'push' | 'sms'
  trigger: string
  subject?: string
  title?: string
  body: string
  variables: string[]
  active: boolean
}

const triggerOptions = [
  { value: 'user_registration', label: 'User Registration' },
  { value: 'property_listed', label: 'Property Listed' },
  { value: 'property_approved', label: 'Property Approved' },
  { value: 'property_rejected', label: 'Property Rejected' },
  { value: 'booking_created', label: 'Booking Created' },
  { value: 'booking_confirmed', label: 'Booking Confirmed' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
  { value: 'agent_approved', label: 'Agent Approved' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'payment_received', label: 'Payment Received' },
]

export default function AdminNotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'email' | 'push' | 'sms'>('email')
  const [showModal, setShowModal] = useState(false)
  const supabase = createSupabaseClient()
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as NotificationTemplate['type'],
    trigger: 'user_registration',
    subject: '',
    title: '',
    body: '',
    active: true,
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    
    if (supabase) {
      try {
      const { data, error } = await supabase.from('notification_templates').select('*').order('name')
      if (error) throw error
      setTemplates(data || [])
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      }
    }
    setTemplates([])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.body) {
      toast.error('Name and body are required')
      return
    }

    // Extract variables from body
    const variableRegex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match
    while ((match = variableRegex.exec(formData.body)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }
    if (formData.subject) {
      while ((match = variableRegex.exec(formData.subject)) !== null) {
        if (!variables.includes(match[1])) {
          variables.push(match[1])
        }
      }
    }

    const templateData = { ...formData, variables }

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      if (editingTemplate) {
        const { error } = await supabase.from('notification_templates').update({ ...templateData, updated_at: new Date().toISOString() }).eq('id', editingTemplate.id)
        if (error) throw error
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateData } : t))
        toast.success('Template updated')
      } else {
        const { data, error } = await supabase.from('notification_templates').insert(templateData).select().single()
        if (error) throw error
        setTemplates(prev => [...prev, data])
        toast.success('Template created')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template')
    }

    setShowModal(false)
    setEditingTemplate(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      trigger: 'user_registration',
      subject: '',
      title: '',
      body: '',
      active: true,
    })
  }

  const openEditModal = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      trigger: template.trigger,
      subject: template.subject || '',
      title: template.title || '',
      body: template.body,
      active: template.active,
    })
    setShowModal(true)
  }

  const deleteTemplate = (id: string) => {
    if (!confirm('Delete this template?')) return
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Template deleted')
  }

  const toggleActive = (id: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, active: !t.active } : t
    ))
  }

  const duplicateTemplate = (template: NotificationTemplate) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
    }
    setTemplates(prev => [...prev, newTemplate])
    toast.success('Template duplicated')
  }

  const filteredTemplates = templates.filter(t => t.type === activeTab)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'push': return Bell
      case 'sms': return Smartphone
      default: return Bell
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Notification Templates</h1>
          <p className="text-gray-600 mt-1">Customize email, push, and SMS notifications</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingTemplate(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['email', 'push', 'sms'] as const).map((type) => {
          const Icon = getTypeIcon(type)
          const count = templates.filter(t => t.type === type).length
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{type}</span>
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === type ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {filteredTemplates.map((template) => {
            const Icon = getTypeIcon(template.type)
            return (
              <div key={template.id} className={`p-4 hover:bg-gray-50 ${!template.active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      template.type === 'email' ? 'bg-blue-100' :
                      template.type === 'push' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        template.type === 'email' ? 'text-blue-600' :
                        template.type === 'push' ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">
                        Trigger: {triggerOptions.find(t => t.value === template.trigger)?.label}
                      </p>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mt-1">Subject: {template.subject}</p>
                      )}
                      {template.title && (
                        <p className="text-sm text-gray-600 mt-1">Title: {template.title}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{template.body}</p>
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.variables.map(v => (
                            <span key={v} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(template.id)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        template.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {template.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredTemplates.length === 0 && (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No {activeTab} templates yet</p>
              <Button className="mt-4" onClick={() => { resetForm(); setFormData(prev => ({ ...prev, type: activeTab })); setShowModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTemplate ? 'Edit Template' : 'Add Template'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NotificationTemplate['type'] }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="email">Email</option>
                    <option value="push">Push Notification</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {triggerOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {formData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Email subject line"
                  />
                </div>
              )}

              {formData.type === 'push' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Notification title"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={formData.type === 'email' ? 8 : 3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                  placeholder={`Use {{variable_name}} for dynamic content`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {`{{user_name}}, {{user_email}}, {{property_title}}, {{booking_date}}`}, etc.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="templateActive"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="templateActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
