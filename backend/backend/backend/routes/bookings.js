const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getUserBookings,
  createBooking,
  updateBooking,
} = require('../config/database');

/**
 * @route   GET /api/bookings
 * @desc    Get user bookings
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await getUserBookings(req.userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Filter by status if provided
    let bookings = result.data;
    if (req.query.status) {
      bookings = bookings.filter(b => b.status === req.query.status);
    }

    res.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('propertyId').notEmpty(),
    body('scheduledDate').isISO8601(),
    body('scheduledTime').notEmpty(),
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

      const { propertyId, scheduledDate, scheduledTime, notes } = req.body;

      // Get property and owner details
      const { supabase } = require('../config/supabase');
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('owner_id, owner_name, title')
        .eq('id', propertyId)
        .single();

      if (propertyError || !property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found',
        });
      }

      // Get booker name
      const { data: booker } = await supabase
        .from('users')
        .select('name')
        .eq('id', req.userId)
        .single();

      const bookingData = {
        property_id: propertyId,
        property_title: property.title,
        booker_id: req.userId,
        booker_name: booker?.name || 'Unknown',
        property_owner_id: property.owner_id,
        property_owner_name: property.owner_name,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes: notes || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await createBooking(bookingData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking (confirm/cancel)
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status required (pending, confirmed, cancelled, completed)',
      });
    }

    // Get booking to verify ownership
    const { supabase } = require('../config/supabase');
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Verify user has permission (owner can confirm/cancel, booker can cancel)
    if (status === 'confirmed' && booking.property_owner_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Only property owner can confirm bookings',
      });
    }

    if (status === 'cancelled' && booking.booker_id !== req.userId && booking.property_owner_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to cancel this booking',
      });
    }

    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    const result = await updateBooking(req.params.id, updates);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;

