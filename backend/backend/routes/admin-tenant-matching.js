const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/tenant-matching
 * @desc    Get all tenant matching requests
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, looking_for, search } = req.query;
    
    let query = getDbClient()
      .from('tenant_matching')
      .select('*, user:users!user_id(id, name, email)');
    
    if (status) query = query.eq('status', status);
    if (looking_for) query = query.eq('looking_for', looking_for);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get tenant matching error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/tenant-matching/stats
 * @desc    Get tenant matching statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { count: totalCount } = await getDbClient()
      .from('tenant_matching')
      .select('*', { count: 'exact', head: true });
    
    const { count: activeCount } = await getDbClient()
      .from('tenant_matching')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const { count: matchedCount } = await getDbClient()
      .from('tenant_matching')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'matched');
    
    const { count: rentSeekersCount } = await getDbClient()
      .from('tenant_matching')
      .select('*', { count: 'exact', head: true })
      .eq('looking_for', 'rent');
    
    const { count: buySeekersCount } = await getDbClient()
      .from('tenant_matching')
      .select('*', { count: 'exact', head: true })
      .eq('looking_for', 'buy');
    
    res.json({
      success: true,
      data: {
        total: totalCount || 0,
        active: activeCount || 0,
        matched: matchedCount || 0,
        rent_seekers: rentSeekersCount || 0,
        buy_seekers: buySeekersCount || 0
      }
    });
  } catch (error) {
    console.error('Get tenant matching stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/tenant-matching
 * @desc    Create a new tenant matching request (from mobile app)
 * @access  Public/Authenticated
 */
router.post('/', async (req, res) => {
  try {
    const { user_id, name, email, phone, looking_for, property_type, budget_min, budget_max, preferred_locations, bedrooms, requirements } = req.body;
    
    const { data, error } = await supabase
      .from('tenant_matching')
      .insert({
        user_id,
        name,
        email,
        phone,
        looking_for,
        property_type,
        budget_min,
        budget_max,
        preferred_locations,
        bedrooms,
        requirements,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Tenant matching request submitted successfully'
    });
  } catch (error) {
    console.error('Create tenant matching error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/tenant-matching/:id
 * @desc    Update a tenant matching request
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('tenant_matching')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Tenant matching request updated'
    });
  } catch (error) {
    console.error('Update tenant matching error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/tenant-matching/:id/match
 * @desc    Match tenant with properties
 * @access  Private (Admin only)
 */
router.post('/:id/match', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { property_ids } = req.body;
    
    const { data, error } = await getDbClient()
      .from('tenant_matching')
      .update({ 
        matched_properties: property_ids,
        status: 'matched',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // TODO: Send notification to tenant about matched properties
    
    res.json({
      success: true,
      data,
      message: 'Properties matched successfully'
    });
  } catch (error) {
    console.error('Match tenant error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/tenant-matching/:id
 * @desc    Delete a tenant matching request
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('tenant_matching')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Tenant matching request deleted'
    });
  } catch (error) {
    console.error('Delete tenant matching error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
