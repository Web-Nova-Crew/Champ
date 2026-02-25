const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/media
 * @desc    Get all media files
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { folder, file_type, search } = req.query;
    
    let query = getDbClient().from('media_library').select('*');
    
    if (folder) query = query.eq('folder', folder);
    if (file_type) query = query.ilike('file_type', `${file_type}%`);
    if (search) query = query.or(`file_name.ilike.%${search}%,alt_text.ilike.%${search}%`);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/media
 * @desc    Upload media file
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { file_name, file_url, file_type, file_size, width, height, alt_text, tags, folder } = req.body;
    
    const { data, error } = await getDbClient()
      .from('media_library')
      .insert({
        file_name,
        file_url,
        file_type,
        file_size,
        width,
        height,
        uploaded_by: req.user.id,
        alt_text,
        tags,
        folder: folder || 'general'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Media uploaded successfully'
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/media/:id
 * @desc    Update media metadata
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, tags, folder } = req.body;
    
    const { data, error } = await getDbClient()
      .from('media_library')
      .update({ alt_text, tags, folder })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Media updated successfully'
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/media/:id
 * @desc    Delete media file
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('media_library')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
