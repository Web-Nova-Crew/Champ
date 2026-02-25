const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/subscription-plans
 * @desc    Get all subscription plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let query = supabase.from('subscription_plans').select('*');
    
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/subscription-plans
 * @desc    Create a new subscription plan
 * @access  Private (Admin only)
 */
router.post('/plans', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, billing_period, features, is_active, display_order } = req.body;
    
    const { data, error } = await getDbClient()
      .from('subscription_plans')
      .insert({
        name,
        description,
        price,
        billing_period,
        features,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Subscription plan created successfully'
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/subscription-plans/:id
 * @desc    Update a subscription plan
 * @access  Private (Admin only)
 */
router.put('/plans/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('subscription_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Subscription plan updated successfully'
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/subscription-plans/:id
 * @desc    Delete a subscription plan
 * @access  Private (Admin only)
 */
router.delete('/plans/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('subscription_plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/subscriptions
 * @desc    Get all user subscriptions
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, user_id } = req.query;
    
    let query = getDbClient()
      .from('user_subscriptions')
      .select('*, user:users!user_id(id, name, email), plan:subscription_plans!plan_id(*)');
    
    if (status) query = query.eq('status', status);
    if (user_id) query = query.eq('user_id', user_id);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/subscriptions/stats
 * @desc    Get subscription statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get active subscriptions count
    const { count: activeCount } = await getDbClient()
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    // Get total revenue
    const { data: subscriptions } = await getDbClient()
      .from('user_subscriptions')
      .select('plan:subscription_plans!plan_id(price)')
      .eq('status', 'active');
    
    const totalRevenue = subscriptions?.reduce((sum, sub) => sum + parseFloat(sub.plan?.price || 0), 0) || 0;
    
    // Get plan distribution
    const { data: planStats } = await getDbClient()
      .from('user_subscriptions')
      .select('plan_id, plan:subscription_plans!plan_id(name)')
      .eq('status', 'active');
    
    const planDistribution = {};
    planStats?.forEach(sub => {
      const planName = sub.plan?.name || 'Unknown';
      planDistribution[planName] = (planDistribution[planName] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        active_subscriptions: activeCount || 0,
        total_revenue: totalRevenue,
        plan_distribution: planDistribution
      }
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/subscriptions
 * @desc    Create a subscription for a user
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { user_id, plan_id, start_date, end_date, auto_renew } = req.body;
    
    const { data, error } = await getDbClient()
      .from('user_subscriptions')
      .insert({
        user_id,
        plan_id,
        start_date,
        end_date,
        status: 'active',
        auto_renew: auto_renew !== undefined ? auto_renew : true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/subscriptions/:id
 * @desc    Update a subscription
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('user_subscriptions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private (Admin only)
 */
router.post('/:id/cancel', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await getDbClient()
      .from('user_subscriptions')
      .update({ 
        status: 'cancelled',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
