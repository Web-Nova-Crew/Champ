const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/cities
 * @desc    Get all cities
 * @access  Public
 */
router.get('/cities', async (req, res) => {
  try {
    const { is_active, search } = req.query;
    
    let query = supabase.from('cities').select('*');
    
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    if (search) query = query.ilike('name', `%${search}%`);
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/cities/:id/areas
 * @desc    Get areas for a city
 * @access  Public
 */
router.get('/cities/:id/areas', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.query;
    
    let query = supabase
      .from('areas')
      .select('*')
      .eq('city_id', id);
    
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get areas error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/cities
 * @desc    Create a new city
 * @access  Private (Admin only)
 */
router.post('/cities', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, state, country, latitude, longitude, is_active, display_order } = req.body;
    
    const { data, error } = await getDbClient()
      .from('cities')
      .insert({
        name,
        state,
        country: country || 'India',
        latitude,
        longitude,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'City created successfully'
    });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/cities/:id
 * @desc    Update a city
 * @access  Private (Admin only)
 */
router.put('/cities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('cities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'City updated successfully'
    });
  } catch (error) {
    console.error('Update city error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/cities/:id
 * @desc    Delete a city
 * @access  Private (Admin only)
 */
router.delete('/cities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('cities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/areas
 * @desc    Create a new area
 * @access  Private (Admin only)
 */
router.post('/areas', authenticate, requireAdmin, async (req, res) => {
  try {
    const { city_id, name, latitude, longitude, pincode, is_active, display_order } = req.body;
    
    const { data, error } = await getDbClient()
      .from('areas')
      .insert({
        city_id,
        name,
        latitude,
        longitude,
        pincode,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Area created successfully'
    });
  } catch (error) {
    console.error('Create area error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/areas/:id
 * @desc    Update an area
 * @access  Private (Admin only)
 */
router.put('/areas/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('areas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Area updated successfully'
    });
  } catch (error) {
    console.error('Update area error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/areas/:id
 * @desc    Delete an area
 * @access  Private (Admin only)
 */
router.delete('/areas/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('areas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Area deleted successfully'
    });
  } catch (error) {
    console.error('Delete area error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
