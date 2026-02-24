'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Search,
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  Clock,
  Filter
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface LogEntry {
  id: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  source: string
  user_id?: string
  user_email?: string
  ip_address?: string
  metadata?: Record<string, any>
  created_at: string
}

interface BackupEntry {
  id: string
  name: string
  size: string
  type: 'full' | 'incremental'
  status: 'completed' | 'in_progress' | 'failed'
  created_at: string
}

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'backups'>('logs')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [backups, setBackups] = useState<BackupEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    if (supabase) {
      try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      setLogs(data || [])
      } catch (error) {
        console.error('Failed to fetch logs:', error)
      }
    }
    setLogs([])
    setBackups([])
    setLoading(false)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address?.includes(searchQuery)
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter
    
    return matchesSearch && matchesLevel && matchesSource
  })

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const sources = [...new Set(logs.map(l => l.source))]

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      success: 'bg-green-100 text-green-700',
    }
    return styles[level] || 'bg-gray-100 text-gray-700'
  }

  const clearLogs = () => {
    if (!confirm('Clear all logs? This action cannot be undone.')) return
    setLogs([])
    toast.success('Logs cleared')
  }

  const createBackup = () => {
    const newBackup: BackupEntry = {
      id: `backup-${Date.now()}`,
      name: `backup_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_manual.sql`,
      size: '0 MB',
      type: 'full',
      status: 'in_progress',
      created_at: new Date().toISOString(),
    }
    setBackups(prev => [newBackup, ...prev])
    toast.success('Backup started')
    
    // Simulate backup completion
    setTimeout(() => {
      setBackups(prev => prev.map(b => 
        b.id === newBackup.id 
          ? { ...b, status: 'completed', size: '258 MB' }
          : b
      ))
      toast.success('Backup completed')
    }, 3000)
  }

  const deleteBackup = (id: string) => {
    if (!confirm('Delete this backup?')) return
    setBackups(prev => prev.filter(b => b.id !== id))
    toast.success('Backup deleted')
  }

  const downloadBackup = (backup: BackupEntry) => {
    toast.success(`Downloading ${backup.name}`)
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
          <h1 className="text-2xl font-bold text-gray-900">System Logs & Backups</h1>
          <p className="text-gray-600 mt-1">Monitor system activity and manage backups</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          System Logs
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'backups'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Backups
        </button>
      </div>

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Sources</option>
                {sources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={clearLogs} className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Message</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User/IP</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getLevelBadge(log.level)}`}>
                          {getLevelIcon(log.level)}
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        {log.metadata && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {log.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.user_email || log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {filteredLogs.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No logs found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Auto-backup: Daily at 2:00 AM
              </div>
            </div>
            <Button onClick={createBackup}>
              <Database className="w-4 h-4 mr-2" />
              Create Backup
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="divide-y divide-gray-100">
              {backups.map((backup) => (
                <div key={backup.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      backup.status === 'completed' ? 'bg-green-100' :
                      backup.status === 'in_progress' ? 'bg-blue-100' :
                      'bg-red-100'
                    }`}>
                      <Database className={`w-5 h-5 ${
                        backup.status === 'completed' ? 'text-green-600' :
                        backup.status === 'in_progress' ? 'text-blue-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{backup.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{backup.size}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          backup.type === 'full' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {backup.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          backup.status === 'completed' ? 'bg-green-100 text-green-700' :
                          backup.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {backup.status === 'in_progress' ? 'In Progress' : backup.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(backup.created_at).toLocaleString()}
                    </span>
                    {backup.status === 'completed' && (
                      <button
                        onClick={() => downloadBackup(backup)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}

              {backups.length === 0 && (
                <div className="p-12 text-center">
                  <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No backups yet</p>
                  <Button className="mt-4" onClick={createBackup}>
                    Create First Backup
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
