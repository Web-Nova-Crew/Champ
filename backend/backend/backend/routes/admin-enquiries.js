const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/enquiries
 * @desc    Get all enquiries/leads
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    let query = dbClient.from('enquiries').select('*');

    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.source) query = query.eq('source', req.query.source);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, error: error.message });

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/enquiries/:id/status
 * @desc    Update enquiry status
 */
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const dbClient = getDbClient();

    const { data, error } = await dbClient
      .from('enquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/enquiries/:id/notes
 * @desc    Update enquiry notes
 */
router.put('/:id/notes', authenticate, requireAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const dbClient = getDbClient();

    const { data, error } = await dbClient
      .from('enquiries')
      .update({ admin_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update enquiry notes error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/enquiries/:id
 * @desc    Delete enquiry
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    const { error } = await dbClient.from('enquiries').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
