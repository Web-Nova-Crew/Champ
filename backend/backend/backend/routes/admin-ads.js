const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

// ==================== AD SLOTS ====================

/**
 * @route   GET /api/admin/ads/slots
 * @desc    Get all ad slots
 */
router.get('/slots', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('ad_slots')
      .select('*')
      .order('name');

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get ad slots error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/ads/slots
 * @desc    Create ad slot
 */
router.post('/slots', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, location, size, price_per_day, active } = req.body;

    const { data, error } = await getDbClient()
      .from('ad_slots')
      .insert({ name, location, size, price_per_day, active: active !== false })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create ad slot error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/ads/slots/:id
 * @desc    Update ad slot
 */
router.put('/slots/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('ad_slots')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update ad slot error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/ads/slots/:id
 * @desc    Delete ad slot
 */
router.delete('/slots/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('ad_slots').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Ad slot deleted' });
  } catch (error) {
    console.error('Delete ad slot error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== AD BOOKINGS ====================

/**
 * @route   GET /api/admin/ads/bookings
 * @desc    Get all ad bookings
 */
router.get('/bookings', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient()
      .from('ad_bookings')
      .select(`*, ad_slots:slot_id(name)`);

    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, error: error.message });

    const transformed = (data || []).map(b => ({
      ...b,
      slot_name: b.ad_slots?.name,
    }));

    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Get ad bookings error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/ads/bookings/:id/status
 * @desc    Update ad booking status
 */
router.put('/bookings/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await getDbClient()
      .from('ad_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update ad booking status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
