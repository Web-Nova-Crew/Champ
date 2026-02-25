const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/categories
 * @desc    Get all property categories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let query = supabase.from('property_categories').select('*');
    
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, icon, is_active, display_order } = req.body;
    
    const { data, error } = await getDbClient()
      .from('property_categories')
      .insert({
        name,
        slug,
        description,
        icon,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update a category
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('property_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete a category
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('property_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/amenities
 * @desc    Get all amenities
 * @access  Public
 */
router.get('/amenities', async (req, res) => {
  try {
    const { category, is_active } = req.query;
    
    let query = supabase.from('amenities').select('*');
    
    if (category) query = query.eq('category', category);
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/amenities
 * @desc    Create a new amenity
 * @access  Private (Admin only)
 */
router.post('/amenities', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, icon, category, is_active, display_order } = req.body;
    
    const { data, error } = await getDbClient()
      .from('amenities')
      .insert({
        name,
        slug,
        icon,
        category,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Amenity created successfully'
    });
  } catch (error) {
    console.error('Create amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/amenities/:id
 * @desc    Update an amenity
 * @access  Private (Admin only)
 */
router.put('/amenities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('amenities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Amenity updated successfully'
    });
  } catch (error) {
    console.error('Update amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/amenities/:id
 * @desc    Delete an amenity
 * @access  Private (Admin only)
 */
router.delete('/amenities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('amenities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Amenity deleted successfully'
    });
  } catch (error) {
    console.error('Delete amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
