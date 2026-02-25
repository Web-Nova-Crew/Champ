const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/featured-properties
 * @desc    Get all featured properties
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let query = supabase
      .from('featured_properties')
      .select('*, property:properties!property_id(*)');
    
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    
    const now = new Date().toISOString();
    query = query
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`);
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/featured-properties
 * @desc    Add a property to featured list
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { property_id, display_order, start_date, end_date, is_active } = req.body;
    
    const { data, error } = await getDbClient()
      .from('featured_properties')
      .insert({
        property_id,
        display_order: display_order || 0,
        start_date,
        end_date,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Property added to featured list'
    });
  } catch (error) {
    console.error('Add featured property error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/featured-properties/:id
 * @desc    Update featured property
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('featured_properties')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Featured property updated'
    });
  } catch (error) {
    console.error('Update featured property error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/featured-properties/:id
 * @desc    Remove property from featured list
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('featured_properties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Property removed from featured list'
    });
  } catch (error) {
    console.error('Delete featured property error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/featured-properties/reorder
 * @desc    Reorder featured properties
 * @access  Private (Admin only)
 */
router.put('/reorder/bulk', authenticate, requireAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Array of {id, display_order}
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items must be an array'
      });
    }
    
    const updates = await Promise.all(
      items.map(async ({ id, display_order }) => {
        const { data, error } = await getDbClient()
          .from('featured_properties')
          .update({ display_order, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        return { id, success: !error, data, error };
      })
    );
    
    res.json({
      success: true,
      data: updates,
      message: 'Featured properties reordered'
    });
  } catch (error) {
    console.error('Reorder featured properties error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
