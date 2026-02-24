const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all reviews with user and property info
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient()
      .from('reviews')
      .select(`*, properties:property_id(title), users:user_id(name, email, avatar_url)`);

    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, error: error.message });

    const transformed = (data || []).map(r => ({
      ...r,
      property_title: r.properties?.title || r.property_id,
      user_name: r.users?.name || r.user_id,
      user_email: r.users?.email,
      user_avatar: r.users?.avatar_url,
    }));

    res.json({ success: true, data: transformed, count: transformed.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/reviews/:id/status
 * @desc    Approve or reject a review
 */
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { data, error } = await getDbClient()
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/reviews/:id
 * @desc    Delete a review
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('reviews').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
