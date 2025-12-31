const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { 
  sendNotificationToUser, 
  sendTestNotification,
  sendTopicNotification 
} = require('../services/notification-sender');
const { 
  checkNewPropertyMatch,
  checkPriceDropOnWishlist,
  checkInactiveUsers,
  getUserNotificationStats
} = require('../services/notification-rules');

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification
 * @access  Private
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });

    }

    const result = await sendTestNotification(fcmToken);

    res.json({
      success: true,
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/send
 * @desc    Send custom notification to user
 * @access  Private (Admin only)
 */
router.post('/send', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, eventData } = req.body;

    if (!userId || !eventData) {
      return res.status(400).json({
        success: false,
        message: 'userId and eventData are required'
      });
    }

    const dbClient = supabaseAdmin || supabase;
    const { data: userProfile, error: userError } = await dbClient
      .from('users')
      .select('fcm_token, fcmToken')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const token = userProfile.fcm_token || userProfile.fcmToken || null;

    const result = await sendNotificationToUser(userId, eventData, token);

    res.json({
      success: true,
      message: 'Notification sent',
      result
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification stats for current user
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = getUserNotificationStats(req.userId.toString());

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/update-token
 * @desc    Update user's FCM token
 * @access  Private
 */
router.post('/update-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const dbClient = supabaseAdmin || supabase;
    const { error } = await dbClient
      .from('users')
      .update({
        fcm_token: fcmToken,
        notifications_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FCM token',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/toggle
 * @desc    Enable/disable notifications
 * @access  Private
 */
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { enabled } = req.body;

    const dbClient = supabaseAdmin || supabase;
    const { error } = await dbClient
      .from('users')
      .update({
        notifications_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: `Notifications ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Toggle notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle notifications',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/broadcast
 * @desc    Send broadcast notification to topic
 * @access  Private (Admin only)
 */
router.post('/broadcast', authenticate, requireAdmin, async (req, res) => {
  try {
    const { topic, eventData } = req.body;

    if (!topic || !eventData) {
      return res.status(400).json({
        success: false,
        message: 'topic and eventData are required'
      });
    }

    const result = await sendTopicNotification(topic, eventData);

    res.json({
      success: true,
      message: 'Broadcast notification sent',
      result
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast notification',
      error: error.message
    });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    let list = [];
    try {
      const { data } = await dbClient
        .from('notifications')
        .select('*')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false });
      if (data && Array.isArray(data)) {
        list = data.map(n => ({
          id: n.id,
          type: n.type || 'general',
          title: n.title || 'Notification',
          message: n.message || '',
          createdAt: n.created_at,
          read: !!n.read,
        }));
      }
    } catch (e) {}
    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    res.json({
      success: true,
      data: [],
    });
  }
});

router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const id = req.params.id;
    try {
      const { data, error } = await dbClient
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', req.userId)
        .select()
        .single();
      if (error) {
        return res.json({ success: true });
      }
      return res.json({
        success: true,
        data,
      });
    } catch (e) {
      return res.json({ success: true });
    }
  } catch (error) {
    res.json({ success: true });
  }
});

router.put('/settings', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { enabled } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (typeof enabled === 'boolean') {
      updates.notifications_enabled = enabled;
    }
    const { data, error } = await dbClient
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;
