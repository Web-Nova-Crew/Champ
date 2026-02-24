const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase');

// Fix multer reference in error handler
const MulterError = multer.MulterError;

// Configure multer for multiple file uploads - Accept all files, validate later
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload error',
    });
  }
  next();
};

/**
 * @route   GET /api/properties
 * @desc    Get all properties with filters
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    let query = dbClient.from('properties').select('*');

    // Only show approved properties to public (unless admin or owner)
    // For public users, only show approved properties
    if (!req.userId) {
      query = query.eq('status', 'approved');
    } else if (req.query.showAll !== 'true') {
      // For logged-in users, show approved properties by default
      query = query.eq('status', 'approved');
    }

    if (req.query.propertyType) {
      query = query.eq('property_type', req.query.propertyType);
    }
    if (req.query.transactionType) {
      query = query.eq('transaction_type', req.query.transactionType);
    }
    if (req.query.minPrice) {
      query = query.gte('price', parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query = query.lte('price', parseFloat(req.query.maxPrice));
    }
    if (req.query.area) {
      query = query.eq('area', req.query.area);
    }
    if (req.query.search) {
      query = query.or(`title.ilike.%${req.query.search}%,location.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get properties error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0,
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/properties/my-listings
 * @desc    Get current user's properties
 * @access  Private
 */
router.get('/my-listings', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('properties')
      .select('*')
      .eq('owner_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user properties:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0,
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/properties/featured
 * @desc    Get featured properties
 * @access  Public
 */
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .limit(10);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0,
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    // Validate UUID format to prevent invalid queries
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID format',
      });
    }

    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('properties')
      .select('*')
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    res.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/properties
 * @desc    Create new property
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err.message);
        return res.status(400).json({
          success: false,
          error: err.message || 'File upload error',
        });
      }
      next();
    });
  },
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('propertyType').isIn(['Apartment', 'House', 'Villa', 'Room', 'PG', 'Commercial', 'Shop', 'Warehouse', 'Plot', 'Farmhouse', 'Studio', 'Penthouse', 'Office Space']),
    body('transactionType').isIn(['Buy', 'Rent', 'Lease', 'Room Rent', 'PG', 'Co-living', 'Short-term Rent', 'Lease-to-Own']),
    body('location').notEmpty().trim(),
    body('area').notEmpty().trim(),
    body('size').isFloat({ min: 0 }),
    body('bedrooms').isInt({ min: 0 }),
    body('bathrooms').isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: errors.array(),
        });
      }

      const dbClient = supabaseAdmin || supabase;

      // Get user profile for owner details
      const { data: userProfiles } = await dbClient
        .from('users')
        .select('name, phone')
        .eq('id', req.userId);
      const userProfile = userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

      // Upload images to Supabase Storage
      const imageUrls = [];
      console.log('Files received:', req.files ? req.files.length : 0);
      
      if (req.files && req.files.length > 0) {
        console.log(`Processing ${req.files.length} files for upload...`);
        const storageClient = supabaseAdmin || supabase;
        
        for (const file of req.files) {
          const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
          const fileExt = file.originalname.split('.').pop().toLowerCase();
          const isImage = file.mimetype.startsWith('image/') || allowedExts.includes(fileExt);
          
          if (!isImage) {
            console.log(`Skipping non-image file: ${file.originalname} (${file.mimetype})`);
            continue;
          }
          
          const fileName = `properties/${uuidv4()}.${fileExt}`;
          
          let contentType = file.mimetype;
          if (!contentType.startsWith('image/')) {
            const mimeMap = {
              'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
              'png': 'image/png', 'gif': 'image/gif',
              'webp': 'image/webp', 'heic': 'image/heic', 'heif': 'image/heif',
            };
            contentType = mimeMap[fileExt] || 'image/jpeg';
          }

          console.log(`Uploading: ${fileName} (${contentType})`);
          
          const { data: uploadData, error: uploadError } = await storageClient.storage
            .from('property-images')
            .upload(fileName, file.buffer, {
              contentType: contentType,
              upsert: false,
            });

          if (uploadError) {
            console.error(`Upload error for ${fileName}:`, uploadError.message);
          } else {
            const { data: urlData } = storageClient.storage
              .from('property-images')
              .getPublicUrl(fileName);
            imageUrls.push(urlData.publicUrl);
            console.log(`Uploaded successfully: ${urlData.publicUrl}`);
          }
        }
      }

      const propertyData = {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        property_type: req.body.propertyType,
        transaction_type: req.body.transactionType,
        location: req.body.location,
        area: req.body.area,
        size: parseFloat(req.body.size),
        bedrooms: parseInt(req.body.bedrooms),
        bathrooms: parseInt(req.body.bathrooms),
        images: imageUrls,
        owner_id: req.userId,
        owner_name: userProfile?.name || 'Unknown',
        owner_phone: req.body.ownerPhone || userProfile?.phone || '',
        amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
        is_furnished: req.body.isFurnished === 'true',
        year_built: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : null,
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
        is_featured: req.body.isFeatured === 'true',
        status: 'pending', // New properties go to pending for admin approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await dbClient
        .from('properties')
        .insert([propertyData])
        .select();

      if (error) {
        console.error('Property creation error:', error);
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Property submitted successfully! It will be visible after admin approval.',
        data: data && data.length > 0 ? data[0] : propertyData,
        pendingApproval: true,
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  upload.array('images', 10),
  async (req, res) => {
    try {
      const dbClient = supabaseAdmin || supabase;
      
      // Check if user owns the property
      const { data: propertyData, error: fetchError } = await dbClient
        .from('properties')
        .select('*')
        .eq('id', req.params.id);

      if (fetchError || !propertyData || propertyData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Property not found',
        });
      }

      if (propertyData[0].owner_id !== req.userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this property',
        });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.price) updates.price = parseFloat(req.body.price);
      if (req.body.propertyType) updates.property_type = req.body.propertyType;
      if (req.body.transactionType) updates.transaction_type = req.body.transactionType;
      if (req.body.location) updates.location = req.body.location;
      if (req.body.area) updates.area = req.body.area;
      if (req.body.size) updates.size = parseFloat(req.body.size);
      if (req.body.bedrooms) updates.bedrooms = parseInt(req.body.bedrooms);
      if (req.body.bathrooms) updates.bathrooms = parseInt(req.body.bathrooms);
      if (req.body.amenities) updates.amenities = JSON.parse(req.body.amenities);
      if (req.body.isFurnished !== undefined) updates.is_furnished = req.body.isFurnished === 'true';
      if (req.body.yearBuilt) updates.year_built = parseInt(req.body.yearBuilt);
      if (req.body.latitude) updates.latitude = parseFloat(req.body.latitude);
      if (req.body.longitude) updates.longitude = parseFloat(req.body.longitude);

      // Handle new images
      if (req.files && req.files.length > 0) {
        const storageClient = supabaseAdmin || supabase;
        const imageUrls = propertyData[0].images || [];
        
        for (const file of req.files) {
          const fileExt = file.originalname.split('.').pop().toLowerCase();
          const fileName = `properties/${uuidv4()}.${fileExt}`;
          
          let contentType = file.mimetype;
          if (!contentType.startsWith('image/')) {
            const mimeMap = {
              'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
              'png': 'image/png', 'gif': 'image/gif',
              'webp': 'image/webp', 'heic': 'image/heic'
            };
            contentType = mimeMap[fileExt] || 'image/jpeg';
          }

          const { error: uploadError } = await storageClient.storage
            .from('property-images')
            .upload(fileName, file.buffer, {
              contentType: contentType,
              upsert: false,
            });

          if (!uploadError) {
            const { data: urlData } = storageClient.storage
              .from('property-images')
              .getPublicUrl(fileName);
            imageUrls.push(urlData.publicUrl);
          } else {
            console.error('Image upload error:', uploadError);
          }
        }
        updates.images = imageUrls;
      }

      updates.updated_at = new Date().toISOString();

      const { data: updatedData, error: updateError } = await dbClient
        .from('properties')
        .update(updates)
        .eq('id', req.params.id)
        .select();

      if (updateError) {
        return res.status(400).json({
          success: false,
          error: updateError.message,
        });
      }

      res.json({
        success: true,
        message: 'Property updated successfully',
        data: updatedData && updatedData.length > 0 ? updatedData[0] : null,
      });
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    
    // Check if user owns the property
    const { data: propertyData, error: fetchError } = await dbClient
      .from('properties')
      .select('owner_id')
      .eq('id', req.params.id);

    if (fetchError || !propertyData || propertyData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    if (propertyData[0].owner_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this property',
      });
    }

    const { error: deleteError } = await dbClient
      .from('properties')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        error: deleteError.message,
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/properties/:id/similar
 * @desc    Get similar properties
 * @access  Public
 */
router.get('/:id/similar', optionalAuth, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    
    // Get the property first
    const { data: propertyData, error: fetchError } = await dbClient
      .from('properties')
      .select('property_type, transaction_type, area')
      .eq('id', req.params.id);

    if (fetchError || !propertyData || propertyData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    const property = propertyData[0];

    // Get similar properties
    const { data: similarData, error: similarError } = await dbClient
      .from('properties')
      .select('*')
      .eq('property_type', property.property_type)
      .neq('id', req.params.id)
      .limit(5);

    if (similarError) {
      return res.status(400).json({
        success: false,
        error: similarError.message,
      });
    }

    res.json({
      success: true,
      data: similarData || [],
    });
  } catch (error) {
    console.error('Get similar properties error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;
