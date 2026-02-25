const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/enquiries
 * @desc    Get all enquiries/leads
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, enquiry_type, property_id, search } = req.query;
    
    let query = getDbClient()
      .from('enquiries')
      .select('*, property:properties!property_id(id, title, location), user:users!user_id(id, name, email)');
    
    if (status) query = query.eq('status', status);
    if (enquiry_type) query = query.eq('enquiry_type', enquiry_type);
    if (property_id) query = query.eq('property_id', property_id);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/enquiries/stats
 * @desc    Get enquiry statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { count: totalCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true });
    
    const { count: newCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    
    const { count: contactedCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'contacted');
    
    const { count: interestedCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'interested');
    
    const { count: closedCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed');
    
    const { count: callCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('enquiry_type', 'call');
    
    const { count: whatsappCount } = await getDbClient()
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('enquiry_type', 'whatsapp');
    
    res.json({
      success: true,
      data: {
        total: totalCount || 0,
        new: newCount || 0,
        contacted: contactedCount || 0,
        interested: interestedCount || 0,
        closed: closedCount || 0,
        call_clicks: callCount || 0,
        whatsapp_clicks: whatsappCount || 0
      }
    });
  } catch (error) {
    console.error('Get enquiry stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/enquiries
 * @desc    Create a new enquiry (from mobile app/website)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { property_id, user_id, name, email, phone, message, enquiry_type } = req.body;
    
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        property_id,
        user_id,
        name,
        email,
        phone,
        message,
        enquiry_type,
        status: 'new'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // TODO: Send notification to property owner/admin
    
    res.json({
      success: true,
      data,
      message: 'Enquiry submitted successfully'
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/enquiries/:id
 * @desc    Update an enquiry
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('enquiries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Enquiry updated successfully'
    });
  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/enquiries/:id
 * @desc    Delete an enquiry
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('enquiries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/enquiries/:id/update-status
 * @desc    Update enquiry status
 * @access  Private (Admin only)
 */
router.post('/:id/update-status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const { data, error } = await getDbClient()
      .from('enquiries')
      .update({ 
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Enquiry status updated successfully'
    });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
