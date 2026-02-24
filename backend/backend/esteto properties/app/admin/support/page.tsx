'use client'

import { useState, useEffect } from 'react'
import {
  Search, Mail, Phone, MessageSquare, Eye, ChevronLeft, ChevronRight,
  RefreshCw, Send, X, Inbox, AlertTriangle, Bug, Users, Star
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  type: 'general' | 'complaint' | 'feedback' | 'partnership' | 'bug_report'
  status: 'new' | 'read' | 'replied' | 'closed' | 'spam'
  admin_reply?: string
  replied_at?: string
  created_at: string
}

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const itemsPerPage = 15
  const supabase = createSupabaseClient()

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    setLoading(true)

    if (supabase) {
      try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setMessages(data || [])
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }
    setMessages([])
    setLoading(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!supabase) { toast.error('Database not connected'); return }
    try {
      const { error } = await supabase.from('contact_messages').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as ContactMessage['status'] } : m))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error('Please enter a reply')
      return
    }

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      const { error } = await supabase.from('contact_messages').update({
        admin_reply: replyText,
        status: 'replied',
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', selectedMessage.id)
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' as const, admin_reply: replyText, replied_at: new Date().toISOString() } : m))
      toast.success('Reply sent')
      setShowModal(false)
      setReplyText('')
    } catch (error) {
      toast.error('Failed to send reply')
    }
  }

  const filteredMessages = messages.filter(m => {
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || m.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    const matchType = typeFilter === 'all' || m.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)
  const paginated = filteredMessages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'feedback': return <Star className="w-4 h-4 text-yellow-500" />
      case 'partnership': return <Users className="w-4 h-4 text-blue-500" />
      case 'bug_report': return <Bug className="w-4 h-4 text-orange-500" />
      default: return <Mail className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700', read: 'bg-yellow-100 text-yellow-700',
      replied: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700',
      spam: 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Inbox</h1>
          <p className="text-gray-600 mt-1">Manage contact form messages and complaints</p>
        </div>
        <Button variant="outline" onClick={fetchMessages}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Inbox, color: 'bg-blue-100 text-blue-600' },
          { label: 'New', value: stats.new, icon: Mail, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Read', value: stats.read, icon: Eye, color: 'bg-purple-100 text-purple-600' },
          { label: 'Replied', value: stats.replied, icon: Send, color: 'bg-green-100 text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-600">{s.label}</p>
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
            <input type="text" placeholder="Search messages..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }} className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="complaint">Complaint</option>
            <option value="feedback">Feedback</option>
            <option value="partnership">Partnership</option>
            <option value="bug_report">Bug Report</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="px-4 py-2 border border-gray-200 rounded-lg">
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {paginated.map((msg) => (
            <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}
              onClick={() => { setSelectedMessage(msg); setReplyText(msg.admin_reply || ''); setShowModal(true); if (msg.status === 'new') handleStatusChange(msg.id, 'read') }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getTypeIcon(msg.type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-gray-900 ${msg.status === 'new' ? 'font-bold' : ''}`}>{msg.name}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(msg.status)}`}>{msg.status}</span>
                    </div>
                    {msg.subject && <p className="text-sm text-gray-700 mt-0.5">{msg.subject}</p>}
                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{msg.email} • {new Date(msg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full capitalize bg-gray-100 text-gray-600`}>{msg.type.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12"><Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No messages found</p></div>
        )}
      </div>

      {/* Detail / Reply Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(selectedMessage.status)}`}>{selectedMessage.status}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedMessage.email}{selectedMessage.phone ? ` • ${selectedMessage.phone}` : ''}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(selectedMessage.created_at).toLocaleString()} • {selectedMessage.type.replace('_', ' ')}</p>
              </div>

              {selectedMessage.subject && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
                  <p className="text-gray-900 font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {selectedMessage.admin_reply && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Admin Reply</p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.admin_reply}</p>
                    {selectedMessage.replied_at && <p className="text-xs text-gray-400 mt-2">Replied on {new Date(selectedMessage.replied_at).toLocaleString()}</p>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{selectedMessage.admin_reply ? 'Update Reply' : 'Write Reply'}</label>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Type your reply..." />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleReply}><Send className="w-4 h-4 mr-2" />Send Reply</Button>
                {selectedMessage.status !== 'closed' && (
                  <Button variant="outline" onClick={() => { handleStatusChange(selectedMessage.id, 'closed'); setShowModal(false) }}>Mark Closed</Button>
                )}
                {selectedMessage.status !== 'spam' && (
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { handleStatusChange(selectedMessage.id, 'spam'); setShowModal(false) }}>Mark Spam</Button>
                )}
                <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
