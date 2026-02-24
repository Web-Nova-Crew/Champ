const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/logs
 * @desc    Get system logs
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient().from('system_logs').select('*');

    if (req.query.level) query = query.eq('level', req.query.level);
    if (req.query.source) query = query.eq('source', req.query.source);
    if (req.query.search) {
      query = query.or(`message.ilike.%${req.query.search}%,user_email.ilike.%${req.query.search}%`);
    }

    const limit = parseInt(req.query.limit) || 500;
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/logs
 * @desc    Create a log entry (for admin actions)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level, message, source, metadata } = req.body;

    const { data, error } = await getDbClient()
      .from('system_logs')
      .insert({
        level: level || 'info',
        message,
        source: source || 'admin',
        user_id: req.userId,
        user_email: req.user?.email,
        ip_address: req.ip,
        metadata,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/logs/clear
 * @desc    Clear old logs (older than 30 days)
 */
router.delete('/clear', authenticate, requireAdmin, async (req, res) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const { error, count } = await getDbClient()
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: `Cleared logs older than 30 days`, count });
  } catch (error) {
    console.error('Clear logs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/logs/sources
 * @desc    Get distinct log sources
 */
router.get('/sources', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('system_logs')
      .select('source')
      .limit(100);

    if (error) return res.status(400).json({ success: false, error: error.message });

    const sources = [...new Set((data || []).map(d => d.source))].filter(Boolean);
    res.json({ success: true, data: sources });
  } catch (error) {
    console.error('Get log sources error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
