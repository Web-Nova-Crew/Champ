const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

// ==================== SEO SETTINGS ====================

/**
 * @route   GET /api/admin/seo/settings
 * @desc    Get all SEO settings
 */
router.get('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('seo_settings_kv')
      .select('key, value');

    if (error) return res.status(400).json({ success: false, error: error.message });

    // Convert array of key-value pairs to object
    const settings = {};
    (data || []).forEach(row => {
      try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get SEO settings error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/seo/settings
 * @desc    Save SEO settings (bulk upsert)
 */
router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await getDbClient()
      .from('seo_settings_kv')
      .upsert(upserts, { onConflict: 'key' });

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'SEO settings saved' });
  } catch (error) {
    console.error('Save SEO settings error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== PAGE SEO ====================

/**
 * @route   GET /api/admin/seo/pages
 * @desc    Get all page-specific SEO entries
 */
router.get('/pages', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('page_seo')
      .select('*')
      .order('path');

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get page SEO error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/seo/pages/:id
 * @desc    Update page SEO
 */
router.put('/pages/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('page_seo')
      .upsert({ ...req.body, id: req.params.id, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update page SEO error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
