const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/roles
 * @desc    Get all roles
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('admin_roles')
      .select('*')
      .order('name');

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/roles
 * @desc    Create role
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const { data, error } = await getDbClient()
      .from('admin_roles')
      .insert({ name, description, permissions: permissions || [], is_system: false })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/roles/:id
 * @desc    Update role
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const { data, error } = await getDbClient()
      .from('admin_roles')
      .update({ name, description, permissions, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/roles/:id
 * @desc    Delete role (non-system only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();

    // Check if system role
    const { data: role } = await dbClient.from('admin_roles').select('is_system').eq('id', req.params.id).single();
    if (role && role.is_system) {
      return res.status(400).json({ success: false, error: 'Cannot delete system role' });
    }

    const { error } = await dbClient.from('admin_roles').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Role deleted' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
