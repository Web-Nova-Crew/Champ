const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/blog
 * @desc    Get all blog posts
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_published, category, search } = req.query;
    
    let query = getDbClient()
      .from('blog_posts')
      .select('*, author:users!author_id(id, name, email)');
    
    if (is_published !== undefined) query = query.eq('is_published', is_published === 'true');
    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/blog/published
 * @desc    Get published blog posts (public)
 * @access  Public
 */
router.get('/published', async (req, res) => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;
    
    let query = supabase
      .from('blog_posts')
      .select('*, author:users!author_id(id, name)')
      .eq('is_published', true);
    
    if (category) query = query.eq('category', category);
    
    const { data, error } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get published posts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/blog/:slug
 * @desc    Get blog post by slug (public)
 * @access  Public
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:users!author_id(id, name)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    
    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
});

/**
 * @route   POST /api/admin/blog
 * @desc    Create a new blog post
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, content, featured_image, category, tags, meta_title, meta_description, is_published } = req.body;
    
    const { data, error } = await getDbClient()
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        featured_image,
        category,
        tags,
        meta_title,
        meta_description,
        is_published: is_published || false,
        published_at: is_published ? new Date().toISOString() : null,
        author_id: req.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Blog post created successfully'
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/blog/:id
 * @desc    Update a blog post
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If publishing for the first time, set published_at
    if (updates.is_published && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }
    
    const { data, error } = await getDbClient()
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/blog/:id
 * @desc    Delete a blog post
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
