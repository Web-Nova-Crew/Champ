const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/app-versions
 * @desc    Get all app versions
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { platform } = req.query;
    
    let query = getDbClient().from('app_versions').select('*');
    
    if (platform) query = query.eq('platform', platform);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get app versions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/app-versions/check
 * @desc    Check if app update is required (mobile app)
 * @access  Public
 */
router.get('/check', async (req, res) => {
  try {
    const { platform, version } = req.query;
    
    if (!platform || !version) {
      return res.status(400).json({
        success: false,
        error: 'Platform and version are required'
      });
    }
    
    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    
    const currentVersion = version;
    const latestVersion = data.version;
    const minVersion = data.min_version;
    const forceUpdate = data.force_update;
    
    // Simple version comparison (assumes semantic versioning)
    const isUpdateAvailable = latestVersion !== currentVersion;
    const isUpdateRequired = forceUpdate || (minVersion && compareVersions(currentVersion, minVersion) < 0);
    
    res.json({
      success: true,
      data: {
        current_version: currentVersion,
        latest_version: latestVersion,
        min_version: minVersion,
        update_available: isUpdateAvailable,
        update_required: isUpdateRequired,
        force_update: forceUpdate,
        download_url: data.download_url,
        release_notes: data.release_notes
      }
    });
  } catch (error) {
    console.error('Check app version error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/app-versions
 * @desc    Create a new app version
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { platform, version, build_number, min_version, force_update, release_notes, download_url } = req.body;
    
    const { data, error } = await getDbClient()
      .from('app_versions')
      .insert({
        platform,
        version,
        build_number,
        min_version,
        force_update: force_update || false,
        release_notes,
        download_url,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'App version created successfully'
    });
  } catch (error) {
    console.error('Create app version error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/app-versions/:id
 * @desc    Update an app version
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('app_versions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'App version updated successfully'
    });
  } catch (error) {
    console.error('Update app version error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/app-versions/:id
 * @desc    Delete an app version
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('app_versions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'App version deleted successfully'
    });
  } catch (error) {
    console.error('Delete app version error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// Helper function to compare semantic versions
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

module.exports = router;
