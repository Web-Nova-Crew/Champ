const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/banners
 * @desc    Get all banners
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { position, is_active } = req.query;
    
    let query = getDbClient().from('banners').select('*');
    
    if (position) query = query.eq('position', position);
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/banners/active
 * @desc    Get active banners (public endpoint)
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const { position } = req.query;
    const now = new Date().toISOString();
    
    let query = supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`);
    
    if (position) query = query.eq('position', position);
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/banners
 * @desc    Create a new banner
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, image_url, link_url, position, start_date, end_date, is_active, display_order, target_audience } = req.body;
    
    const { data, error } = await getDbClient()
      .from('banners')
      .insert({
        title,
        subtitle,
        image_url,
        link_url,
        position: position || 'hero',
        start_date,
        end_date,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0,
        target_audience
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Banner created successfully'
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/banners/:id
 * @desc    Update a banner
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('banners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Banner updated successfully'
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/banners/:id
 * @desc    Delete a banner
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('banners')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/banners/:id/track-impression
 * @desc    Track banner impression
 * @access  Public
 */
router.post('/:id/track-impression', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase.rpc('increment_banner_impressions', { banner_id: id });
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/banners/:id/track-click
 * @desc    Track banner click
 * @access  Public
 */
router.post('/:id/track-click', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase.rpc('increment_banner_clicks', { banner_id: id });
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
