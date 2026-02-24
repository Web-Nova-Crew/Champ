'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  Users,
  Key
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
}

const allPermissions: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access admin dashboard', category: 'Dashboard' },
  { id: 'dashboard.analytics', name: 'View Analytics', description: 'Access analytics data', category: 'Dashboard' },
  
  // Properties
  { id: 'properties.view', name: 'View Properties', description: 'View all properties', category: 'Properties' },
  { id: 'properties.create', name: 'Create Properties', description: 'Create new properties', category: 'Properties' },
  { id: 'properties.edit', name: 'Edit Properties', description: 'Edit any property', category: 'Properties' },
  { id: 'properties.delete', name: 'Delete Properties', description: 'Delete properties', category: 'Properties' },
  { id: 'properties.approve', name: 'Approve Properties', description: 'Approve/reject listings', category: 'Properties' },
  { id: 'properties.featured', name: 'Manage Featured', description: 'Manage featured properties', category: 'Properties' },
  
  // Users
  { id: 'users.view', name: 'View Users', description: 'View all users', category: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user details', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'Users' },
  { id: 'users.roles', name: 'Manage Roles', description: 'Assign user roles', category: 'Users' },
  
  // Agents
  { id: 'agents.view', name: 'View Agents', description: 'View all agents', category: 'Agents' },
  { id: 'agents.approve', name: 'Approve Agents', description: 'Approve/reject agents', category: 'Agents' },
  { id: 'agents.edit', name: 'Edit Agents', description: 'Edit agent details', category: 'Agents' },
  
  // Bookings
  { id: 'bookings.view', name: 'View Bookings', description: 'View all bookings', category: 'Bookings' },
  { id: 'bookings.manage', name: 'Manage Bookings', description: 'Confirm/cancel bookings', category: 'Bookings' },
  
  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'View user reports', category: 'Reports' },
  { id: 'reports.manage', name: 'Manage Reports', description: 'Resolve/dismiss reports', category: 'Reports' },
  
  // Content
  { id: 'content.banners', name: 'Manage Banners', description: 'Manage promotional banners', category: 'Content' },
  { id: 'content.locations', name: 'Manage Locations', description: 'Manage cities and areas', category: 'Content' },
  { id: 'content.categories', name: 'Manage Categories', description: 'Manage property types', category: 'Content' },
  { id: 'content.reviews', name: 'Moderate Reviews', description: 'Approve/reject reviews', category: 'Content' },
  
  // Settings
  { id: 'settings.general', name: 'General Settings', description: 'Modify general settings', category: 'Settings' },
  { id: 'settings.seo', name: 'SEO Settings', description: 'Modify SEO settings', category: 'Settings' },
  { id: 'settings.notifications', name: 'Notification Settings', description: 'Manage notifications', category: 'Settings' },
  { id: 'settings.roles', name: 'Role Management', description: 'Manage roles & permissions', category: 'Settings' },
  
  // System
  { id: 'system.logs', name: 'View Logs', description: 'Access system logs', category: 'System' },
  { id: 'system.backups', name: 'Manage Backups', description: 'Create/restore backups', category: 'System' },
]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const supabase = createSupabaseClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    
    if (supabase) {
      try {
      const { data, error } = await supabase.from('admin_roles').select('*').order('name')
      if (error) throw error
      setRoles((data || []).map((r: any) => ({ ...r, userCount: r.user_count || 0, isSystem: r.is_system || false })))
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }
    setRoles([])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Role name is required')
      return
    }

    if (!supabase) { toast.error('Database not connected'); return }

    try {
      const roleData = { name: formData.name, description: formData.description, permissions: formData.permissions }
      if (editingRole) {
        const { error } = await supabase.from('admin_roles').update({ ...roleData, updated_at: new Date().toISOString() }).eq('id', editingRole.id)
        if (error) throw error
        setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...roleData } : r))
        toast.success('Role updated')
      } else {
        const { data, error } = await supabase.from('admin_roles').insert({ ...roleData, is_system: false }).select().single()
        if (error) throw error
        setRoles(prev => [...prev, { ...data, userCount: 0, isSystem: false }])
        toast.success('Role created')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role')
    }

    setShowModal(false)
    setEditingRole(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    })
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    })
    setShowModal(true)
  }

  const deleteRole = (id: string) => {
    const role = roles.find(r => r.id === id)
    if (role?.isSystem) {
      toast.error('Cannot delete system role')
      return
    }
    if (!confirm('Delete this role?')) return
    setRoles(prev => prev.filter(r => r.id !== id))
    toast.success('Role deleted')
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const toggleCategory = (category: string) => {
    const categoryPermissions = allPermissions.filter(p => p.category === category).map(p => p.id)
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p))
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }))
    }
  }

  const categories = [...new Set(allPermissions.map(p => p.category))]

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
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage admin roles and access control</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingRole(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  role.isSystem ? 'bg-purple-100' : 'bg-primary-100'
                }`}>
                  <Shield className={`w-5 h-5 ${role.isSystem ? 'text-purple-600' : 'text-primary-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              {role.isSystem && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">System</span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {role.userCount} users
              </span>
              <span className="flex items-center gap-1">
                <Key className="w-4 h-4" />
                {role.permissions.length} permissions
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {role.permissions.slice(0, 5).map(permId => {
                const perm = allPermissions.find(p => p.id === permId)
                return perm ? (
                  <span key={permId} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {perm.name}
                  </span>
                ) : null
              })}
              {role.permissions.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  +{role.permissions.length - 5} more
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEditModal(role)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {!role.isSystem && (
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteRole(role.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Brief description of this role"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Permissions</h3>
                <div className="space-y-6">
                  {categories.map((category) => {
                    const categoryPerms = allPermissions.filter(p => p.category === category)
                    const selectedCount = categoryPerms.filter(p => formData.permissions.includes(p.id)).length
                    const allSelected = selectedCount === categoryPerms.length
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleCategory(category)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              allSelected ? 'bg-primary-600 border-primary-600' : 
                              selectedCount > 0 ? 'bg-primary-100 border-primary-300' : 
                              'border-gray-300'
                            }`}>
                              {allSelected && <Check className="w-3 h-3 text-white" />}
                              {!allSelected && selectedCount > 0 && <div className="w-2 h-2 bg-primary-600 rounded-sm" />}
                            </div>
                            <span className="font-medium text-gray-900">{category}</span>
                          </div>
                          <span className="text-sm text-gray-500">{selectedCount}/{categoryPerms.length}</span>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                          {categoryPerms.map((perm) => (
                            <label key={perm.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 text-primary-600 rounded mt-0.5"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                                <p className="text-xs text-gray-500">{perm.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-between">
              <p className="text-sm text-gray-500">
                {formData.permissions.length} permissions selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
