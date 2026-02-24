'use client'

import { useEffect, useState } from 'react'
import {
  Smartphone,
  Flag,
  Settings as SettingsIcon,
  Rocket,
  Send,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  Percent,
  SmartphoneCharging
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { createSupabaseClient } from '@/lib/supabase/client'

type Tab = 'flags' | 'remote' | 'push' | 'versions'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  platform: 'android' | 'ios' | 'web' | 'all'
  rollout_percentage: number
  created_at: string
  updated_at: string
}

interface RemoteConfigItem {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description: string
  platform: 'android' | 'ios' | 'all'
  created_at: string
  updated_at: string
}

interface PushTemplate {
  id: string
  name: string
  title: string
  body: string
  trigger_event: string
  active: boolean
  created_at: string
  updated_at: string
}

interface AppVersionRule {
  id: string
  version: string
  platform: 'android' | 'ios'
  force_update: boolean
  description: string
  release_date: string
  created_at: string
}

export default function MobileControlCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('flags')
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createSupabaseClient())

  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [remote, setRemote] = useState<RemoteConfigItem[]>([])
  const [versions, setVersions] = useState<AppVersionRule[]>([])
  const [templates, setTemplates] = useState<PushTemplate[]>([])
  const [search, setSearch] = useState('')

  // Form state
  const [flagForm, setFlagForm] = useState<Partial<FeatureFlag>>({
    key: '',
    name: '',
    description: '',
    enabled: false,
    platform: 'all',
    rollout_percentage: 0,
  })
  const [remoteForm, setRemoteForm] = useState<Partial<RemoteConfigItem>>({
    key: '',
    value: '',
    type: 'string',
    platform: 'all',
  })
  const [templateForm, setTemplateForm] = useState<Partial<PushTemplate>>({
    name: '',
    title: '',
    body: '',
    trigger_event: '',
    active: true,
  })
  const [versionForm, setVersionForm] = useState<Partial<AppVersionRule>>({
    version: '',
    platform: 'android',
    force_update: false,
    description: '',
  })
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [editingRemote, setEditingRemote] = useState<RemoteConfigItem | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<PushTemplate | null>(null)
  const [editingVersion, setEditingVersion] = useState<AppVersionRule | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!supabase) return
    setLoading(true)

    try {
      // Load all data in parallel
      const [flagsData, remoteData, templatesData, versionsData] = await Promise.all([
        supabase.from('feature_flags').select('*').order('created_at', { ascending: false }),
        supabase.from('remote_config').select('*').order('created_at', { ascending: false }),
        supabase.from('push_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('app_versions').select('*').order('release_date', { ascending: false }),
      ])

      if (flagsData.error) throw flagsData.error
      if (remoteData.error) throw remoteData.error
      if (templatesData.error) throw templatesData.error
      if (versionsData.error) throw versionsData.error

      setFlags(flagsData.data || [])
      setRemote(remoteData.data || [])
      setTemplates(templatesData.data || [])
      setVersions(versionsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredFlags = flags.filter(f =>
    f.key.toLowerCase().includes(search.toLowerCase()) ||
    f.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredRemote = remote.filter(i =>
    i.key.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const saveFlag = async () => {
    if (!supabase || !flagForm.key || !flagForm.name) {
      toast.error('Key and name are required')
      return
    }

    try {
      if (editingFlag) {
        const { error } = await supabase
          .from('feature_flags')
          .update({
            key: flagForm.key,
            name: flagForm.name,
            description: flagForm.description,
            enabled: flagForm.enabled,
            platform: flagForm.platform,
            rollout_percentage: flagForm.rollout_percentage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFlag.id)

        if (error) throw error

        setFlags(prev => prev.map(f => f.id === editingFlag.id ? ({
          ...f,
          ...flagForm,
          updated_at: new Date().toISOString(),
        } as FeatureFlag) : f))

        setEditingFlag(null)
        toast.success('Feature flag updated')
      } else {
        const exists = flags.some(f => f.key === flagForm.key)
        if (exists) {
          toast.error('A flag with this key already exists')
          return
        }

        const { data, error } = await supabase
          .from('feature_flags')
          .insert({
            key: flagForm.key,
            name: flagForm.name,
            description: flagForm.description,
            enabled: flagForm.enabled,
            platform: flagForm.platform,
            rollout_percentage: flagForm.rollout_percentage,
          })
          .select()

        if (error) throw error

        setFlags(prev => [...prev, ...(data || [])])
        toast.success('Feature flag created')
      }

      setFlagForm({ key: '', name: '', description: '', enabled: false, platform: 'all', rollout_percentage: 0 })
    } catch (error) {
      console.error('Error saving flag:', error)
      toast.error('Failed to save feature flag')
    }
  }

  const deleteFlag = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this feature flag?')) return

    try {
      const { error } = await supabase.from('feature_flags').delete().eq('id', id)
      if (error) throw error

      setFlags(prev => prev.filter(f => f.id !== id))
      toast.success('Feature flag deleted')
    } catch (error) {
      console.error('Error deleting flag:', error)
      toast.error('Failed to delete feature flag')
    }
  }

  const deleteRemoteConfig = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this remote config?')) return

    try {
      const { error } = await supabase.from('remote_config').delete().eq('id', id)
      if (error) throw error

      setRemote(prev => prev.filter(r => r.id !== id))
      toast.success('Remote config deleted')
    } catch (error) {
      console.error('Error deleting remote config:', error)
      toast.error('Failed to delete remote config')
    }
  }

  const saveRemoteConfig = async () => {
    if (!supabase || !remoteForm.key || !remoteForm.value) {
      toast.error('Key and value are required')
      return
    }

    try {
      if (editingRemote) {
        const { error } = await supabase
          .from('remote_config')
          .update({
            key: remoteForm.key,
            value: remoteForm.value,
            type: remoteForm.type,
            description: remoteForm.description,
            platform: remoteForm.platform,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRemote.id)

        if (error) throw error

        setRemote(prev => prev.map(r => r.id === editingRemote.id ? ({
          ...r,
          ...remoteForm,
          updated_at: new Date().toISOString(),
        } as RemoteConfigItem) : r))

        setEditingRemote(null)
        toast.success('Remote config updated')
      } else {
        const exists = remote.some(r => r.key === remoteForm.key)
        if (exists) {
          toast.error('A config item with this key already exists')
          return
        }

        const { data, error } = await supabase
          .from('remote_config')
          .insert({
            key: remoteForm.key,
            value: remoteForm.value,
            type: remoteForm.type,
            description: remoteForm.description,
            platform: remoteForm.platform,
          })
          .select()

        if (error) throw error

        setRemote(prev => [...prev, ...(data || [])])
        toast.success('Remote config created')
      }

      setRemoteForm({ key: '', value: '', type: 'string', platform: 'all' })
    } catch (error) {
      console.error('Error saving remote config:', error)
      toast.error('Failed to save remote config')
    }
  }

  const savePushTemplate = async () => {
    if (!supabase || !templateForm.name || !templateForm.title || !templateForm.body) {
      toast.error('Name, title and body are required')
      return
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('push_templates')
          .update({
            name: templateForm.name,
            title: templateForm.title,
            body: templateForm.body,
            trigger_event: templateForm.trigger_event,
            active: templateForm.active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id)

        if (error) throw error

        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? ({
          ...t,
          ...templateForm,
          updated_at: new Date().toISOString(),
        } as PushTemplate) : t))

        setEditingTemplate(null)
        toast.success('Push template updated')
      } else {
        const { data, error } = await supabase
          .from('push_templates')
          .insert({
            name: templateForm.name,
            title: templateForm.title,
            body: templateForm.body,
            trigger_event: templateForm.trigger_event,
            active: templateForm.active,
          })
          .select()

        if (error) throw error

        setTemplates(prev => [...prev, ...(data || [])])
        toast.success('Push template created')
      }

      setTemplateForm({ name: '', title: '', body: '', trigger_event: '', active: true })
    } catch (error) {
      console.error('Error saving push template:', error)
      toast.error('Failed to save push template')
    }
  }

  const deletePushTemplate = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this push template?')) return

    try {
      const { error } = await supabase.from('push_templates').delete().eq('id', id)
      if (error) throw error

      setTemplates(prev => prev.filter(t => t.id !== id))
      toast.success('Push template deleted')
    } catch (error) {
      console.error('Error deleting push template:', error)
      toast.error('Failed to delete push template')
    }
  }

  const saveAppVersion = async () => {
    if (!supabase || !versionForm.version || !versionForm.platform) {
      toast.error('Version and platform are required')
      return
    }

    try {
      if (editingVersion) {
        const { error } = await supabase
          .from('app_versions')
          .update({
            version: versionForm.version,
            platform: versionForm.platform,
            force_update: versionForm.force_update,
            description: versionForm.description,
            release_date: versionForm.release_date,
          })
          .eq('id', editingVersion.id)

        if (error) throw error

        setVersions(prev => prev.map(v => v.id === editingVersion.id ? ({
          ...v,
          ...versionForm,
        } as AppVersionRule) : v))

        setEditingVersion(null)
        toast.success('App version updated')
      } else {
        const { data, error } = await supabase
          .from('app_versions')
          .insert({
            version: versionForm.version,
            platform: versionForm.platform,
            force_update: versionForm.force_update,
            description: versionForm.description,
            release_date: versionForm.release_date || new Date().toISOString(),
          })
          .select()

        if (error) throw error

        setVersions(prev => [...prev, ...(data || [])])
        toast.success('App version created')
      }

      setVersionForm({ version: '', platform: 'android', force_update: false, description: '' })
    } catch (error) {
      console.error('Error saving app version:', error)
      toast.error('Failed to save app version')
    }
  }

  const deleteAppVersion = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this app version?')) return

    try {
      const { error } = await supabase.from('app_versions').delete().eq('id', id)
      if (error) throw error

      setVersions(prev => prev.filter(v => v.id !== id))
      toast.success('App version deleted')
    } catch (error) {
      console.error('Error deleting app version:', error)
      toast.error('Failed to delete app version')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary-600" />
            Mobile Control Center
          </h1>
          <p className="text-gray-600 mt-1">Control Android app features, config, and pushes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {([
            { id: 'flags', label: 'Feature Flags', icon: Flag },
            { id: 'remote', label: 'Remote Config', icon: SettingsIcon },
            { id: 'push', label: 'Push Notifications', icon: Send },
            { id: 'versions', label: 'App Versions', icon: SmartphoneCharging },
          ] as { id: Tab; label: string; icon: any }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === t.id ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
          <div className="ml-auto p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'flags' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-semibold text-gray-900">Create / Edit Flag</h3>
                <input
                  value={flagForm.key}
                  onChange={(e) => setFlagForm(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Key (e.g. enable_chat)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  value={flagForm.name}
                  onChange={(e) => setFlagForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  value={flagForm.description}
                  onChange={(e) => setFlagForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 h-24"
                />
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!flagForm.enabled}
                      onChange={(e) => setFlagForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    Enabled
                  </label>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={flagForm.rollout ?? 100}
                      onChange={(e) => setFlagForm(prev => ({ ...prev, rollout: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-200 rounded-lg"
                    />
                    <span className="text-sm text-gray-600">rollout</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Platforms</label>
                  <div className="flex gap-3">
                    {['android', 'ios', 'web'].map(p => (
                      <label key={p} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={flagForm.platforms?.includes(p as any) || false}
                          onChange={(e) => {
                            const set = new Set(flagForm.platforms ?? [])
                            if (e.target.checked) set.add(p as any)
                            else set.delete(p as any)
                            setFlagForm(prev => ({ ...prev, platforms: Array.from(set) as any }))
                          }}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={saveFlag}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingFlag ? 'Update Flag' : 'Create Flag'}
                </Button>
              </div>
              {/* List */}
              <div className="lg:col-span-2">
                <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Key</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Rollout</th>
                        <th className="px-4 py-3">Platforms</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFlags.map(f => (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm">{f.key}</td>
                          <td className="px-4 py-3">{f.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${f.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {f.enabled ? 'enabled' : 'disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{f.rollout_percentage ?? 100}%</td>
                          <td className="px-4 py-3 text-sm capitalize">{f.platform}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                onClick={() => {
                                  setEditingFlag(f)
                                  setFlagForm({
                                    key: f.key,
                                    name: f.name,
                                    description: f.description,
                                    enabled: f.enabled,
                                    platform: f.platform,
                                    rollout_percentage: f.rollout_percentage,
                                  })
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() => deleteFlag(f.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'remote' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Create / Edit Config</h3>
                <input
                  value={remoteForm.key}
                  onChange={e => setRemoteForm(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Key (e.g. primary_color)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  value={remoteForm.value}
                  onChange={e => setRemoteForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Value"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={remoteForm.platform}
                  onChange={e => setRemoteForm(prev => ({ ...prev, platform: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="web">Web</option>
                  <option value="all">All</option>
                </select>
                <Button onClick={saveRemoteConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRemote ? 'Update Config' : 'Create Config'}
                </Button>
              </div>
              {/* List */}
              <div className="lg:col-span-2">
                <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Key</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Platform</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRemote.map(i => (
                        <tr key={i.key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm">{i.key}</td>
                          <td className="px-4 py-3 text-sm">{i.value}</td>
                          <td className="px-4 py-3 text-sm">{i.platform ?? 'android'}</td>
                          <td className="px-4 py-3 text-sm">{new Date(i.updatedAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                onClick={() => {
                                  setEditingRemote(i)
                                  setRemoteForm(i)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() => deleteRemoteConfig(i.key)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'push' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Composer */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Push Composer</h3>
                <input
                  value={templateForm.title}
                  onChange={e => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  value={templateForm.body}
                  onChange={e => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Body"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 h-28"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={templateForm.topic}
                    onChange={e => setTemplateForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Users</option>
                    <option value="promotions">Promotions</option>
                    <option value="buyers">Buyers</option>
                    <option value="agents">Agents</option>
                  </select>
                </div>
                <Button onClick={sendPush}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Push
                </Button>
              </div>
              {/* Templates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Topic</th>
                        <th className="px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {templates.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{t.title}</td>
                          <td className="px-4 py-3 text-sm">{t.topic ?? 'custom'}</td>
                          <td className="px-4 py-3 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Platform</th>
                      <th className="px-4 py-3">Min Version</th>
                      <th className="px-4 py-3">Latest</th>
                      <th className="px-4 py-3">Force</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {versions.map((v, idx) => (
                      <tr key={v.platform} className="hover:bg-gray-50">
                        <td className="px-4 py-3 capitalize">{v.platform}</td>
                        <td className="px-4 py-3">
                          <input
                            value={v.minVersion}
                            onChange={e => {
                              const copy = [...versions]
                              copy[idx] = { ...v, minVersion: e.target.value }
                              setVersions(copy)
                            }}
                            className="px-2 py-1 border border-gray-200 rounded-lg"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={v.latestVersion}
                            onChange={e => {
                              const copy = [...versions]
                              copy[idx] = { ...v, latestVersion: e.target.value }
                              setVersions(copy)
                            }}
                            className="px-2 py-1 border border-gray-200 rounded-lg"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={v.forceUpdate}
                            onChange={e => {
                              const copy = [...versions]
                              copy[idx] = { ...v, forceUpdate: e.target.checked }
                              setVersions(copy)
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={v.updateMessage ?? ''}
                            onChange={e => {
                              const copy = [...versions]
                              copy[idx] = { ...v, updateMessage: e.target.value }
                              setVersions(copy)
                            }}
                            className="w-full px-2 py-1 border border-gray-200 rounded-lg"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => toast.success('Version rules saved')}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500">
                Use version rules to enforce minimum versions or force updates on Android and iOS. The Android app can fetch these via a public endpoint or Supabase table.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

