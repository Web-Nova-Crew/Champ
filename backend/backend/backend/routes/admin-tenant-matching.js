const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/tenant-matching
 * @desc    Get all tenant requirements
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient()
      .from('tenant_requirements')
      .select(`*, users:user_id(name, email, phone)`);

    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.listing_type) query = query.eq('listing_type', req.query.listing_type);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, error: error.message });

    const transformed = (data || []).map(r => ({
      ...r,
      user_name: r.users?.name,
      user_email: r.users?.email,
      user_phone: r.users?.phone,
    }));

    res.json({ success: true, data: transformed, count: transformed.length });
  } catch (error) {
    console.error('Get tenant requirements error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/tenant-matching/:id/status
 * @desc    Update requirement status
 */
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await getDbClient()
      .from('tenant_requirements')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update requirement status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/tenant-matching/:id
 * @desc    Delete tenant requirement
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('tenant_requirements').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Requirement deleted' });
  } catch (error) {
    console.error('Delete requirement error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
