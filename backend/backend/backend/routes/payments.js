const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

// Initialize Razorpay (only if credentials are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && 
    process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id' &&
    process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret') {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.warn('⚠️  Razorpay not available:', error.message);
  }
}

/**
 * @route   POST /api/payments/create
 * @desc    Create payment order
 * @access  Private
 */
router.post(
  '/create',
  authenticate,
  [
    body('amount').isFloat({ min: 1 }),
    body('planName').notEmpty(),
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

      const { amount, planName } = req.body;

      // Check if Razorpay is configured
      if (!razorpay) {
        return res.status(503).json({
          success: false,
          error: 'Payment gateway not configured. Please configure Razorpay credentials.',
        });
      }

      // Create Razorpay order
      const options = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: req.userId,
          planName: planName,
        },
      };

      const order = await razorpay.orders.create(options);

      // Store payment in database - use admin client to bypass RLS
      const dbClient = supabaseAdmin || supabase;
      const { error: paymentError } = await dbClient
        .from('payments')
        .insert([
          {
            user_id: req.userId,
            order_id: order.id,
            amount: amount,
            plan_name: planName,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);

      if (paymentError) {
        console.error('Error storing payment:', paymentError);
      }

      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment
 * @access  Private
 */
router.post(
  '/verify',
  authenticate,
  [
    body('orderId').notEmpty(),
    body('paymentId').notEmpty(),
    body('signature').notEmpty(),
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

      const { orderId, paymentId, signature } = req.body;

      // Verify payment signature
      const crypto = require('crypto');
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification failed',
        });
      }

      // Update payment status - use admin client to bypass RLS
      const dbClient = supabaseAdmin || supabase;
      const { data: payments, error: paymentError } = await dbClient
        .from('payments')
        .update({
          payment_id: paymentId,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('user_id', req.userId)
        .select();
      
      const payment = payments && payments.length > 0 ? payments[0] : null;

      if (paymentError) {
        return res.status(400).json({
          success: false,
          error: paymentError.message,
        });
      }

      // Update user subscription
      if (payment && payment.plan_name) {
        await dbClient
          .from('users')
          .update({
            subscription_plan: payment.plan_name,
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            updated_at: new Date().toISOString(),
          })
          .eq('id', req.userId);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment,
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history
 * @access  Private
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data: payments, error } = await dbClient
      .from('payments')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;

