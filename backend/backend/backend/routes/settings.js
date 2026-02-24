const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

// In-memory storage for app settings (in production, use database)
let appSettings = {
  // App Store URLs
  androidAppUrl: '',
  iosAppUrl: '',
  androidPackageName: 'com.estato.app',
  iosBundleId: 'com.estato.app',

  // Version Control
  currentAndroidVersion: '1.0.0',
  currentIosVersion: '1.0.0',
  minAndroidVersion: '1.0.0',
  minIosVersion: '1.0.0',
  forceAppUpdate: false,

  // Push Notifications
  firebaseServerKey: '',
  oneSignalAppId: '',

  // App Maintenance
  appMaintenanceMode: false,
  appMaintenanceMessage: 'App is under maintenance. Please try again later.',

  // App Features
  enableLocationServices: false, // Removed as requested
  enablePushNotifications: true,
  enableInAppMessages: true,
  enableDeepLinking: true,
  deepLinkDomain: 'estato.com',

  // Analytics & Monitoring
  enableCrashReporting: true,
  enableAnalytics: true,
  appRatingPromptDays: 7,
};

/**
 * @route   GET /api/settings/mobile
 * @desc    Get mobile app settings
 * @access  Public (no auth required for app config)
 */
router.get('/mobile', async (req, res) => {
  try {
    res.json({
      success: true,
      data: appSettings,
    });
  } catch (error) {
    console.error('Get mobile settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/settings/mobile
 * @desc    Update mobile app settings (Admin only)
 * @access  Private (Admin)
 */
router.put('/mobile', authenticate, async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin check)
    // For now, allow any authenticated user to update

    const updates = req.body;

    // Validate and update settings
    Object.keys(updates).forEach(key => {
      if (appSettings.hasOwnProperty(key)) {
        appSettings[key] = updates[key];
      }
    });

    res.json({
      success: true,
      message: 'Mobile settings updated successfully',
      data: appSettings,
    });
  } catch (error) {
    console.error('Update mobile settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/settings/general
 * @desc    Get general app settings
 * @access  Public
 */
router.get('/general', async (req, res) => {
  try {
    // Return basic app config
    const generalSettings = {
      siteName: 'Estato',
      siteDescription: 'Premium Real Estate Platform',
      siteUrl: 'https://estatoprop.com',
      supportEmail: 'support@estatoprop.com',
      supportPhone: '+91 9872364476',
      currency: 'INR',
      language: 'en',
      timezone: 'Asia/Kolkata',
      maintenanceMode: false,
    };

    res.json({
      success: true,
      data: generalSettings,
    });
  } catch (error) {
    console.error('Get general settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;
