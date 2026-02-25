const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/remote-config
 * @desc    Get all remote config
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { platform } = req.query;
    
    let query = getDbClient().from('remote_config').select('*');
    
    if (platform) query = query.or(`platform.eq.${platform},platform.eq.all`);
    
    const { data, error } = await query.order('key', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get remote config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/remote-config/active
 * @desc    Get active remote config for mobile app
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const { platform = 'android' } = req.query;
    
    const { data, error } = await supabase
      .from('remote_config')
      .select('key, value')
      .or(`platform.eq.${platform},platform.eq.all`);
    
    if (error) throw error;
    
    // Convert to key-value object
    const config = {};
    data.forEach(item => {
      config[item.key] = item.value;
    });
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get active remote config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/remote-config
 * @desc    Create a new remote config
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, value, platform, description } = req.body;
    
    const { data, error } = await getDbClient()
      .from('remote_config')
      .insert({
        key,
        value,
        platform: platform || 'all',
        description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Remote config created successfully'
    });
  } catch (error) {
    console.error('Create remote config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/remote-config/:id
 * @desc    Update a remote config
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('remote_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Remote config updated successfully'
    });
  } catch (error) {
    console.error('Update remote config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/remote-config/:id
 * @desc    Delete a remote config
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('remote_config')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Remote config deleted successfully'
    });
  } catch (error) {
    console.error('Delete remote config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
