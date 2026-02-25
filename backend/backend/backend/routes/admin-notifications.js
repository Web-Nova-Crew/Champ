const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/notification-templates
 * @desc    Get all notification templates
 * @access  Private (Admin only)
 */
router.get('/templates', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type, trigger_event } = req.query;
    
    let query = getDbClient().from('notification_templates').select('*');
    
    if (type) query = query.eq('type', type);
    if (trigger_event) query = query.eq('trigger_event', trigger_event);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get notification templates error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/notification-templates
 * @desc    Create a new notification template
 * @access  Private (Admin only)
 */
router.post('/templates', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, type, trigger_event, subject, body, variables, is_active } = req.body;
    
    const { data, error } = await getDbClient()
      .from('notification_templates')
      .insert({
        name,
        type,
        trigger_event,
        subject,
        body,
        variables,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Notification template created successfully'
    });
  } catch (error) {
    console.error('Create notification template error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/notification-templates/:id
 * @desc    Update a notification template
 * @access  Private (Admin only)
 */
router.put('/templates/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await getDbClient()
      .from('notification_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: 'Notification template updated successfully'
    });
  } catch (error) {
    console.error('Update notification template error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/notification-templates/:id
 * @desc    Delete a notification template
 * @access  Private (Admin only)
 */
router.delete('/templates/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await getDbClient()
      .from('notification_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Notification template deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification template error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/notifications/send
 * @desc    Send a notification using a template
 * @access  Private (Admin only)
 */
router.post('/send', authenticate, requireAdmin, async (req, res) => {
  try {
    const { template_id, user_ids, data } = req.body;
    
    // Get template
    const { data: template, error: templateError } = await getDbClient()
      .from('notification_templates')
      .select('*')
      .eq('id', template_id)
      .single();
    
    if (templateError) throw templateError;
    
    // Replace variables in template
    let subject = template.subject;
    let body = template.body;
    
    if (data) {
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject?.replace(regex, data[key]);
        body = body.replace(regex, data[key]);
      });
    }
    
    // Send notification based on type
    if (template.type === 'email') {
      // TODO: Implement email sending
      console.log('Sending email:', { subject, body, user_ids });
    } else if (template.type === 'push') {
      // TODO: Implement push notification
      console.log('Sending push notification:', { body, user_ids });
    } else if (template.type === 'sms') {
      // TODO: Implement SMS sending
      console.log('Sending SMS:', { body, user_ids });
    }
    
    res.json({
      success: true,
      message: `Notification sent to ${user_ids?.length || 0} users`
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/notifications/test
 * @desc    Test a notification template
 * @access  Private (Admin only)
 */
router.post('/test', authenticate, requireAdmin, async (req, res) => {
  try {
    const { template_id, test_data } = req.body;
    
    // Get template
    const { data: template, error } = await getDbClient()
      .from('notification_templates')
      .select('*')
      .eq('id', template_id)
      .single();
    
    if (error) throw error;
    
    // Replace variables
    let subject = template.subject;
    let body = template.body;
    
    if (test_data) {
      Object.keys(test_data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject?.replace(regex, test_data[key]);
        body = body.replace(regex, test_data[key]);
      });
    }
    
    res.json({
      success: true,
      data: {
        subject,
        body,
        type: template.type
      },
      message: 'Template preview generated'
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;
