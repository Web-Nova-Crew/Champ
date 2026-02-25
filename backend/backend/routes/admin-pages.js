const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/pages
 * @desc    Get all pages
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_published, search } = req.query;
    
    let query = getDbClient()
      .from('pages')
      .select('*, author:users!author_id(id, name, email)');
    
    if (is_published !== undefined) query = query.eq('is_published', is_published === 'true');
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/pages/:slug
 * @desc    Get page by slug (public)
 * @access  Public
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(404).json({
      success: false,
      error: 'Page not found'
    });
  }
});

/**
 * @route   POST /api/admin/pages
 * @desc    Create a new page
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, meta_title, meta_description, meta_keywords, is_published } = req.body;
    
    const { data, error } = await getDbClient()
      .from('pages')
      .insert({
        title,
        slug,
        content,
        excerpt,
        meta_title,
        meta_description,
        meta_keywords,
        is_published: is_published || false,
        author_id: req.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Page created successfully'
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/pages/:id
 * @desc    Update a page
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/pages/:id
 * @desc    Delete a page
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('pages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
