const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Helper function to ensure user exists in users table
 * Creates user profile if it doesn't exist
 */
async function ensureUserExists(userId, userEmail, userName) {
  const dbClient = supabaseAdmin || supabase;
  
  // Check if user exists
  const { data: existingUsers, error: checkError } = await dbClient
    .from('users')
    .select('id')
    .eq('id', userId);

  if (checkError) {
    console.error('Error checking user existence:', checkError);
    return { success: false, error: checkError.message };
  }

  // User exists
  if (existingUsers && existingUsers.length > 0) {
    return { success: true, exists: true };
  }

  // Create user profile
  const { error: insertError } = await dbClient
    .from('users')
    .insert([{
      id: userId,
      email: userEmail || '',
      name: userName || 'User',
      phone: '',
      user_type: 'buyer',
      role: 'user',
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }]);

  if (insertError) {
    console.error('Error creating user profile:', insertError);
    return { success: false, error: insertError.message };
  }

  console.log('Created user profile for:', userId);
  return { success: true, exists: false, created: true };
}

/**
 * @route   GET /api/favorites
 * @desc    Get user favorites with full property details
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    
    // Get favorites with property details
    const { data: favorites, error } = await dbClient
      .from('favorites')
      .select(`
        id,
        property_id,
        created_at,
        properties (
          id,
          title,
          description,
          price,
          property_type,
          transaction_type,
          location,
          area,
          size,
          bedrooms,
          bathrooms,
          images,
          owner_id,
          owner_name,
          owner_phone,
          amenities,
          is_furnished,
          is_featured,
          created_at
        )
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get favorites error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Transform data to return properties directly
    const properties = (favorites || [])
      .filter(f => f.properties) // Filter out any null properties
      .map(f => ({
        ...f.properties,
        favoriteId: f.id,
        favoritedAt: f.created_at,
      }));

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/favorites/ids
 * @desc    Get just the property IDs that user has favorited (for quick checks)
 * @access  Private
 */
router.get('/ids', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    
    const { data: favorites, error } = await dbClient
      .from('favorites')
      .select('property_id')
      .eq('user_id', req.userId);

    if (error) {
      console.error('Get favorite IDs error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const propertyIds = (favorites || []).map(f => f.property_id);

    res.json({
      success: true,
      data: propertyIds,
      count: propertyIds.length,
    });
  } catch (error) {
    console.error('Get favorite IDs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/favorites/check/:propertyId
 * @desc    Check if a property is favorited by user
 * @access  Private
 */
router.get('/check/:propertyId', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    
    const { data: favorites, error } = await dbClient
      .from('favorites')
      .select('id')
      .eq('user_id', req.userId)
      .eq('property_id', req.params.propertyId);

    if (error) {
      console.error('Check favorite error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      isFavorited: favorites && favorites.length > 0,
      favoriteId: favorites && favorites.length > 0 ? favorites[0].id : null,
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/favorites
 * @desc    Add property to favorites
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: 'Property ID required',
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(propertyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID format',
      });
    }

    const dbClient = supabaseAdmin || supabase;

    // Step 1: Ensure user exists in users table
    const userResult = await ensureUserExists(
      req.userId, 
      req.user?.email, 
      req.user?.user_metadata?.name
    );
    
    if (!userResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to verify user: ' + userResult.error,
      });
    }

    // Step 2: Check if property exists
    const { data: propertyData, error: propertyError } = await dbClient
      .from('properties')
      .select('id, title')
      .eq('id', propertyId);

    if (propertyError || !propertyData || propertyData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    // Step 3: Check if already favorited
    const { data: existingFavorite, error: checkError } = await dbClient
      .from('favorites')
      .select('id')
      .eq('user_id', req.userId)
      .eq('property_id', propertyId);

    if (checkError) {
      console.error('Check existing favorite error:', checkError);
      return res.status(400).json({
        success: false,
        error: checkError.message,
      });
    }

    if (existingFavorite && existingFavorite.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Property already in favorites',
        data: { id: existingFavorite[0].id, property_id: propertyId },
        alreadyExists: true,
      });
    }

    // Step 4: Add to favorites
    const { data: newFavorite, error: insertError } = await dbClient
      .from('favorites')
      .insert([{
        user_id: req.userId,
        property_id: propertyId,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (insertError) {
      console.error('Add favorite error:', insertError);
      return res.status(400).json({
        success: false,
        error: insertError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Property added to favorites',
      data: newFavorite && newFavorite.length > 0 ? newFavorite[0] : { property_id: propertyId },
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/favorites/toggle
 * @desc    Toggle favorite status (add if not exists, remove if exists)
 * @access  Private
 */
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: 'Property ID required',
      });
    }

    const dbClient = supabaseAdmin || supabase;

    // Ensure user exists
    await ensureUserExists(req.userId, req.user?.email, req.user?.user_metadata?.name);

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await dbClient
      .from('favorites')
      .select('id')
      .eq('user_id', req.userId)
      .eq('property_id', propertyId);

    if (checkError) {
      return res.status(400).json({
        success: false,
        error: checkError.message,
      });
    }

    if (existingFavorite && existingFavorite.length > 0) {
      // Remove favorite
      const { error: deleteError } = await dbClient
        .from('favorites')
        .delete()
        .eq('id', existingFavorite[0].id);

      if (deleteError) {
        return res.status(400).json({
          success: false,
          error: deleteError.message,
        });
      }

      return res.json({
        success: true,
        message: 'Property removed from favorites',
        isFavorited: false,
      });
    } else {
      // Add favorite
      const { data: newFavorite, error: insertError } = await dbClient
        .from('favorites')
        .insert([{
          user_id: req.userId,
          property_id: propertyId,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (insertError) {
        return res.status(400).json({
          success: false,
          error: insertError.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Property added to favorites',
        isFavorited: true,
        data: newFavorite && newFavorite.length > 0 ? newFavorite[0] : null,
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   DELETE /api/favorites/:propertyId
 * @desc    Remove property from favorites
 * @access  Private
 */
router.delete('/:propertyId', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    
    const { error } = await dbClient
      .from('favorites')
      .delete()
      .eq('user_id', req.userId)
      .eq('property_id', req.params.propertyId);

    if (error) {
      console.error('Remove favorite error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Property removed from favorites',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;
