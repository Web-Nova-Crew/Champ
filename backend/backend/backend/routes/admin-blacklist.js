const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/blacklist
 * @desc    Get all blacklist entries
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient().from('blacklist').select('*');
    if (req.query.type) query = query.eq('type', req.query.type);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get blacklist error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/blacklist
 * @desc    Add blacklist entry
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type, value, reason, expires_at } = req.body;

    const { data, error } = await getDbClient()
      .from('blacklist')
      .insert({ type, value, reason, expires_at: expires_at || null, created_by: req.userId })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Add blacklist entry error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/blacklist/:id
 * @desc    Update blacklist entry
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('blacklist')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update blacklist error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/blacklist/:id
 * @desc    Remove blacklist entry
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('blacklist').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Blacklist entry removed' });
  } catch (error) {
    console.error('Delete blacklist error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
