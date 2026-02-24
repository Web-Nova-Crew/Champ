const { supabase } = require('../config/supabase');

/**
 * Authentication middleware
 * Verifies Supabase JWT token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login first.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please login again.',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Admin authentication middleware
 * Verifies user is an admin
 */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    // Check if user is admin
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.userId)
      .single();

    if (error || !userProfile || userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Admin access required.',
    });
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
};

