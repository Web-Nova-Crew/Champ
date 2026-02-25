const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/seo
 * @desc    Get all SEO page settings
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getDbClient()
      .from('seo_pages')
      .select('*')
      .order('page_path', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get SEO settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/seo/:path
 * @desc    Get SEO settings for a specific page
 * @access  Public
 */
router.get('/page', async (req, res) => {
  try {
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Page path is required'
      });
    }
    
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('page_path', path)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    res.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Get page SEO error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/seo
 * @desc    Create SEO settings for a page
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page_path, title, description, keywords, og_image, canonical_url, robots, schema_markup } = req.body;
    
    const { data, error } = await getDbClient()
      .from('seo_pages')
      .insert({
        page_path,
        title,
        description,
        keywords,
        og_image,
        canonical_url,
        robots: robots || 'index, follow',
        schema_markup
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'SEO settings created successfully'
    });
  } catch (error) {
    console.error('Create SEO settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/seo/:id
 * @desc    Update SEO settings
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('seo_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'SEO settings updated successfully'
    });
  } catch (error) {
    console.error('Update SEO settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/seo/:id
 * @desc    Delete SEO settings
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('seo_pages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'SEO settings deleted successfully'
    });
  } catch (error) {
    console.error('Delete SEO settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/seo/sitemap
 * @desc    Generate sitemap.xml
 * @access  Public
 */
router.get('/sitemap', async (req, res) => {
  try {
    // Get all published pages, blog posts, and properties
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('is_published', true);
    
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true);
    
    const { data: properties } = await supabase
      .from('properties')
      .select('id, updated_at')
      .eq('status', 'approved');
    
    // Generate sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    sitemap += '  <url>\n';
    sitemap += '    <loc>https://estato.com/</loc>\n';
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
    
    // Pages
    pages?.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>https://estato.com/${page.slug}</loc>\n`;
      sitemap += `    <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });
    
    // Blog posts
    blogPosts?.forEach(post => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>https://estato.com/blog/${post.slug}</loc>\n`;
      sitemap += `    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>\n`;
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });
    
    // Properties
    properties?.forEach(property => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>https://estato.com/properties/${property.id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(property.updated_at).toISOString()}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.9</priority>\n';
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Generate sitemap error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/seo/robots
 * @desc    Generate robots.txt
 * @access  Public
 */
router.get('/robots', async (req, res) => {
  try {
    // Get robots.txt content from settings
    const { data: setting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'robots_txt_content')
      .single();
    
    const robotsTxt = setting?.value || `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://estato.com/sitemap.xml`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Generate robots.txt error:', error);
    res.status(500).send('User-agent: *\nAllow: /');
  }
});

module.exports = router;
