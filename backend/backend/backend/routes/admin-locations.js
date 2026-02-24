const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ==================== CITIES ====================

/**
 * @route   GET /api/admin/locations/cities
 * @desc    Get all cities with area count
 */
router.get('/cities', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('cities')
      .select('*, areas:areas(count)')
      .order('name');

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/locations/cities
 * @desc    Create city
 */
router.post('/cities', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, state, active } = req.body;
    const slug = generateSlug(name);

    const { data, error } = await getDbClient()
      .from('cities')
      .insert({ name, slug, state, active: active !== false })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/locations/cities/:id
 * @desc    Update city
 */
router.put('/cities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    if (req.body.name) updateData.slug = generateSlug(req.body.name);

    const { data, error } = await getDbClient()
      .from('cities')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update city error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/locations/cities/:id
 * @desc    Delete city and its areas
 */
router.delete('/cities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    await dbClient.from('areas').delete().eq('city_id', req.params.id);
    const { error } = await dbClient.from('cities').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'City deleted' });
  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== AREAS ====================

/**
 * @route   GET /api/admin/locations/areas
 * @desc    Get all areas (optionally filtered by city)
 */
router.get('/areas', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient().from('areas').select('*, cities:city_id(name)');
    if (req.query.city_id) query = query.eq('city_id', req.query.city_id);

    const { data, error } = await query.order('name');
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get areas error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/locations/areas
 * @desc    Create area
 */
router.post('/areas', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, city_id, pincode, active } = req.body;
    const slug = generateSlug(name);

    const { data, error } = await getDbClient()
      .from('areas')
      .insert({ name, slug, city_id, pincode, active: active !== false })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create area error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/locations/areas/:id
 * @desc    Update area
 */
router.put('/areas/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    if (req.body.name) updateData.slug = generateSlug(req.body.name);

    const { data, error } = await getDbClient()
      .from('areas')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update area error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/locations/areas/:id
 * @desc    Delete area
 */
router.delete('/areas/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('areas').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Area deleted' });
  } catch (error) {
    console.error('Delete area error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
