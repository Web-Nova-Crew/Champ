const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all property reviews
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, is_reported, property_id } = req.query;
    
    let query = getDbClient()
      .from('property_reviews')
      .select('*, property:properties!property_id(id, title), user:users!user_id(id, name, email)');
    
    if (status) query = query.eq('status', status);
    if (is_reported !== undefined) query = query.eq('is_reported', is_reported === 'true');
    if (property_id) query = query.eq('property_id', property_id);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/reviews/stats
 * @desc    Get review statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { count: totalCount } = await getDbClient()
      .from('property_reviews')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingCount } = await getDbClient()
      .from('property_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { count: approvedCount } = await getDbClient()
      .from('property_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    const { count: rejectedCount } = await getDbClient()
      .from('property_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');
    
    const { count: reportedCount } = await getDbClient()
      .from('property_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_reported', true);
    
    res.json({
      success: true,
      data: {
        total: totalCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
        reported: reportedCount || 0
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/reviews/:id/moderate
 * @desc    Moderate a review (approve/reject)
 * @access  Private (Admin only)
 */
router.post('/:id/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"'
      });
    }
    
    const { data, error } = await getDbClient()
      .from('property_reviews')
      .update({ 
        status,
        moderated_by: req.user.id,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Review ${status} successfully`
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/reviews/:id/report
 * @desc    Report a review (from mobile app/website)
 * @access  Public/Authenticated
 */
router.post('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { report_reason } = req.body;
    
    const { data, error } = await supabase
      .from('property_reviews')
      .update({ 
        is_reported: true,
        report_reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/reviews/:id
 * @desc    Delete a review
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('property_reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
