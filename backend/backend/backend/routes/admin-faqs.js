const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/faqs
 * @desc    Get all FAQs
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/faqs
 * @desc    Create FAQ
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { question, answer, category, sort_order, active } = req.body;

    const { data, error } = await getDbClient()
      .from('faqs')
      .insert({ question, answer, category, sort_order: sort_order || 0, active: active !== false })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/faqs/:id
 * @desc    Update FAQ
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('faqs')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/faqs/:id
 * @desc    Delete FAQ
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('faqs').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
