/**
 * Notification Rule Engine for Estato
 * Controls WHEN and WHO gets notifications (AI only writes the text)
 */

let User;
let Property;
try {
  User = require('../models/User');
} catch (error) {
  User = null;
}
try {
  Property = require('../models/Property');
} catch (error) {
  Property = null;
}

// Notification settings
const NOTIFICATION_CONFIG = {
  MAX_PER_DAY: parseInt(process.env.MAX_NOTIFICATIONS_PER_USER_PER_DAY) || 2,
  MIN_GAP_HOURS: parseInt(process.env.MIN_NOTIFICATION_GAP_HOURS) || 6,
  QUIET_HOURS_START: parseInt(process.env.QUIET_HOURS_START) || 22, // 10 PM
  QUIET_HOURS_END: parseInt(process.env.QUIET_HOURS_END) || 8, // 8 AM
};

// In-memory tracking (use Redis in production)
const userNotificationLog = new Map();

/**
 * Check if user can receive notification
 */
function canSendNotification(userId) {
  const now = Date.now();
  const userLog = userNotificationLog.get(userId) || [];

  // Check quiet hours
  const currentHour = new Date().getHours();
  if (currentHour >= NOTIFICATION_CONFIG.QUIET_HOURS_START || 
      currentHour < NOTIFICATION_CONFIG.QUIET_HOURS_END) {
    console.log(`Quiet hours - skipping notification for user ${userId}`);
    return false;
  }

  // Check daily limit
  const today = new Date().setHours(0, 0, 0, 0);
  const todayNotifications = userLog.filter(timestamp => timestamp >= today);
  
  if (todayNotifications.length >= NOTIFICATION_CONFIG.MAX_PER_DAY) {
    console.log(`Daily limit reached for user ${userId}`);
    return false;
  }

  // Check minimum gap
  if (userLog.length > 0) {
    const lastNotification = userLog[userLog.length - 1];
    const hoursSinceLastNotification = (now - lastNotification) / (1000 * 60 * 60);
    
    if (hoursSinceLastNotification < NOTIFICATION_CONFIG.MIN_GAP_HOURS) {
      console.log(`Minimum gap not met for user ${userId}`);
      return false;
    }
  }

  return true;
}

/**
 * Log notification sent
 */
function logNotification(userId) {
  const userLog = userNotificationLog.get(userId) || [];
  userLog.push(Date.now());
  
  // Keep only last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const filteredLog = userLog.filter(timestamp => timestamp > thirtyDaysAgo);
  
  userNotificationLog.set(userId, filteredLog);
}

/**
 * Rule: New property matches user preferences
 */
async function checkNewPropertyMatch(property) {
  try {
    if (!User) {
      console.warn('⚠️ User model not available; skipping notification rule: checkNewPropertyMatch');
      return [];
    }
    const matchingUsers = await User.find({
      'preferences.areas': property.area,
      'preferences.minBudget': { $lte: property.price },
      'preferences.maxBudget': { $gte: property.price },
      'preferences.propertyTypes': property.propertyType,
      notificationsEnabled: true
    });

    const notifications = [];

    for (const user of matchingUsers) {
      if (canSendNotification(user._id.toString())) {
        notifications.push({
          userId: user._id,
          eventData: {
            event: 'new_property',
            area: property.area,
            bhk: property.bhk,
            budget: property.price,
            property_type: property.propertyType,
            transaction_type: property.transactionType,
            user_type: user.userType || 'buyer',
            language: user.preferredLanguage || 'hinglish',
            tone: 'friendly'
          }
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error checking new property match:', error);
    return [];
  }
}

/**
 * Rule: Price drop on wishlist property
 */
async function checkPriceDropOnWishlist(property, oldPrice, newPrice) {
  try {
    if (!User) {
      console.warn('⚠️ User model not available; skipping notification rule: checkPriceDropOnWishlist');
      return [];
    }
    const usersWithWishlist = await User.find({
      'wishlist': property._id,
      notificationsEnabled: true
    });

    const notifications = [];
    const priceDrop = oldPrice - newPrice;

    for (const user of usersWithWishlist) {
      if (canSendNotification(user._id.toString())) {
        notifications.push({
          userId: user._id,
          eventData: {
            event: 'price_drop',
            area: property.area,
            bhk: property.bhk,
            budget: newPrice,
            price_drop: priceDrop,
            property_type: property.propertyType,
            user_type: user.userType || 'buyer',
            language: user.preferredLanguage || 'hinglish',
            tone: 'excited'
          }
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error checking price drop:', error);
    return [];
  }
}

/**
 * Rule: Inactive user re-engagement
 */
async function checkInactiveUsers() {
  try {
    if (!User) {
      console.warn('⚠️ User model not available; skipping notification rule: checkInactiveUsers');
      return [];
    }
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const inactiveUsers = await User.find({
      lastActive: { $lt: sevenDaysAgo },
      notificationsEnabled: true
    });

    const notifications = [];

    for (const user of inactiveUsers) {
      if (canSendNotification(user._id.toString())) {
        notifications.push({
          userId: user._id,
          eventData: {
            event: 'inactive_user',
            area: user.preferences?.areas?.[0] || 'Lucknow',
            user_type: user.userType || 'buyer',
            language: user.preferredLanguage || 'hinglish',
            tone: 'friendly'
          }
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error checking inactive users:', error);
    return [];
  }
}

/**
 * Rule: New listing in preferred area
 */
async function checkNewListingInPreferredArea(property) {
  try {
    if (!User) {
      console.warn('⚠️ User model not available; skipping notification rule: checkNewListingInPreferredArea');
      return [];
    }
    const matchingUsers = await User.find({
      'preferences.areas': property.area,
      notificationsEnabled: true
    });

    const notifications = [];

    for (const user of matchingUsers) {
      if (canSendNotification(user._id.toString())) {
        notifications.push({
          userId: user._id,
          eventData: {
            event: 'new_listing',
            area: property.area,
            bhk: property.bhk,
            budget: property.price,
            transaction_type: property.transactionType,
            property_type: property.propertyType,
            user_type: user.userType || 'buyer',
            language: user.preferredLanguage || 'hinglish',
            tone: 'informative'
          }
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error checking new listing:', error);
    return [];
  }
}

/**
 * Rule: Visit reminder
 */
async function checkVisitReminders() {
  try {
    // This would check scheduled visits from your Visit model
    // For now, returning empty array
    return [];
  } catch (error) {
    console.error('Error checking visit reminders:', error);
    return [];
  }
}

/**
 * Rule: New agent lead
 */
async function notifyAgentNewLead(agentId, leadData) {
  try {
    if (!canSendNotification(agentId)) {
      return null;
    }

    return {
      userId: agentId,
      eventData: {
        event: 'new_agent_lead',
        area: leadData.area,
        bhk: leadData.bhk,
        budget: leadData.budget,
        user_type: 'agent',
        language: 'hinglish',
        tone: 'urgent'
      }
    };
  } catch (error) {
    console.error('Error notifying agent:', error);
    return null;
  }
}

/**
 * Get notification stats for user
 */
function getUserNotificationStats(userId) {
  const userLog = userNotificationLog.get(userId) || [];
  const today = new Date().setHours(0, 0, 0, 0);
  const todayCount = userLog.filter(timestamp => timestamp >= today).length;

  return {
    todayCount,
    maxPerDay: NOTIFICATION_CONFIG.MAX_PER_DAY,
    remaining: Math.max(0, NOTIFICATION_CONFIG.MAX_PER_DAY - todayCount),
    lastNotification: userLog.length > 0 ? new Date(userLog[userLog.length - 1]) : null
  };
}

module.exports = {
  canSendNotification,
  logNotification,
  checkNewPropertyMatch,
  checkPriceDropOnWishlist,
  checkInactiveUsers,
  checkNewListingInPreferredArea,
  checkVisitReminders,
  notifyAgentNewLead,
  getUserNotificationStats,
  NOTIFICATION_CONFIG
};

