const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/support
 * @desc    Get all contact/support messages
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = getDbClient().from('contact_messages').select('*');
    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Get support messages error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/support/:id/status
 * @desc    Update message status
 */
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await getDbClient()
      .from('contact_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update support status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/support/:id/reply
 * @desc    Reply to a support message
 */
router.put('/:id/reply', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    const { data, error } = await getDbClient()
      .from('contact_messages')
      .update({
        admin_reply: reply,
        status: 'replied',
        replied_by: req.userId,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Reply to support error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/support/:id
 * @desc    Delete support message
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('contact_messages').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete support message error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
