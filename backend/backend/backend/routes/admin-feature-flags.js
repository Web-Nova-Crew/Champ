const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/feature-flags
 * @desc    Get all feature flags
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get feature flags error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/feature-flags/active
 * @desc    Get active feature flags for mobile app
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const { platform = 'android' } = req.query;
    
    const { data, error } = await supabase
      .from('feature_flags')
      .select('key, name, is_enabled, rollout_percentage')
      .eq('is_enabled', true)
      .contains('platforms', [platform]);
    
    if (error) throw error;
    
    // Convert to key-value object
    const flags = {};
    data.forEach(flag => {
      flags[flag.key] = {
        enabled: flag.is_enabled,
        rollout: flag.rollout_percentage
      };
    });
    
    res.json({
      success: true,
      data: flags
    });
  } catch (error) {
    console.error('Get active feature flags error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/feature-flags
 * @desc    Create a new feature flag
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, name, description, is_enabled, rollout_percentage, platforms } = req.body;
    
    const { data, error } = await getDbClient()
      .from('feature_flags')
      .insert({
        key,
        name,
        description,
        is_enabled: is_enabled || false,
        rollout_percentage: rollout_percentage || 100,
        platforms: platforms || ['android', 'ios', 'web']
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Feature flag created successfully'
    });
  } catch (error) {
    console.error('Create feature flag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/feature-flags/:id
 * @desc    Update a feature flag
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('feature_flags')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Feature flag updated successfully'
    });
  } catch (error) {
    console.error('Update feature flag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/feature-flags/:id
 * @desc    Delete a feature flag
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('feature_flags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Feature flag deleted successfully'
    });
  } catch (error) {
    console.error('Delete feature flag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/feature-flags/:key/toggle
 * @desc    Quick toggle feature flag
 * @access  Private (Admin only)
 */
router.post('/:key/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    
    // Get current state
    const { data: current } = await getDbClient()
      .from('feature_flags')
      .select('is_enabled')
      .eq('key', key)
      .single();
    
    // Toggle
    const { data, error } = await getDbClient()
      .from('feature_flags')
      .update({ 
        is_enabled: !current.is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Feature flag ${data.is_enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Toggle feature flag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
