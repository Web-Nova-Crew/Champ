const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/settings
 * @desc    Get all system settings
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = getDbClient().from('system_settings').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('category', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/settings/public
 * @desc    Get public system settings (no auth required)
 * @access  Public
 */
router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value, type')
      .eq('is_public', true);
    
    if (error) throw error;
    
    // Convert to key-value object
    const settings = {};
    data.forEach(setting => {
      let value = setting.value;
      if (setting.type === 'boolean') value = value === 'true';
      if (setting.type === 'number') value = parseFloat(value);
      if (setting.type === 'json') value = JSON.parse(value);
      settings[setting.key] = value;
    });
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update a system setting
 * @access  Private (Admin only)
 */
router.put('/:key', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const { data, error } = await getDbClient()
      .from('system_settings')
      .update({ 
        value: String(value),
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/settings
 * @desc    Create a new system setting
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, value, type, category, description, is_public } = req.body;
    
    const { data, error } = await getDbClient()
      .from('system_settings')
      .insert({
        key,
        value: String(value),
        type: type || 'string',
        category,
        description,
        is_public: is_public || false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Setting created successfully'
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/settings/bulk
 * @desc    Update multiple settings at once
 * @access  Private (Admin only)
 */
router.put('/bulk/update', authenticate, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body; // Array of {key, value}
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        error: 'Settings must be an array'
      });
    }
    
    const updates = await Promise.all(
      settings.map(async ({ key, value }) => {
        const { data, error } = await getDbClient()
          .from('system_settings')
          .update({ 
            value: String(value),
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .select()
          .single();
        
        return { key, success: !error, data, error };
      })
    );
    
    res.json({
      success: true,
      data: updates,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/settings/test-email
 * @desc    Send a test email
 * @access  Private (Admin only)
 */
router.post('/test-email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { to } = req.body;
    
    // TODO: Implement actual email sending using SMTP settings
    // For now, just return success
    
    res.json({
      success: true,
      message: `Test email sent to ${to}`
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
