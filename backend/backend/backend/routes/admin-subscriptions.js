const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

// ==================== PLANS ====================

/**
 * @route   GET /api/admin/subscriptions/plans
 * @desc    Get all subscription plans
 */
router.get('/plans', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('subscription_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/subscriptions/plans
 * @desc    Create subscription plan
 */
router.post('/plans', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, price, duration_days, max_listings, featured_listings, boost_included, priority_support, badge, active, sort_order } = req.body;

    const { data, error } = await getDbClient()
      .from('subscription_plans')
      .insert({ name, slug, description, price, duration_days, max_listings, featured_listings, boost_included, priority_support, badge, active, sort_order })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/subscriptions/plans/:id
 * @desc    Update subscription plan
 */
router.put('/plans/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('subscription_plans')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/subscriptions/plans/:id
 * @desc    Delete subscription plan
 */
router.delete('/plans/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await getDbClient().from('subscription_plans').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== USER SUBSCRIPTIONS ====================

/**
 * @route   GET /api/admin/subscriptions/users
 * @desc    Get all user subscriptions
 */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('user_subscriptions')
      .select(`*, subscription_plans:plan_id(name, slug), users:user_id(name, email)`)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/subscriptions/users/:id/status
 * @desc    Update user subscription status
 */
router.put('/users/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await getDbClient()
      .from('user_subscriptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
