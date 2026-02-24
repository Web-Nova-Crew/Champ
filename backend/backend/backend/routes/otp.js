const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Initialize Twilio client (only if credentials are provided)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid' &&
    process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token') {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    console.warn('⚠️  Twilio not available:', error.message);
  }
}

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

/**
 * Generate random OTP
 */
function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to phone or email
 * @access  Public
 */
router.post(
  '/send',
  [
    body('phone').optional().isMobilePhone(),
    body('email').optional().isEmail(),
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

      const { phone, email } = req.body;
      const otp = generateOTP();
      const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000;

      // Store OTP
      const identifier = phone || email;
      otpStore.set(identifier, {
        otp,
        expiresAt,
        attempts: 0,
      });

      // Send OTP via SMS
      if (phone) {
        if (twilioClient) {
          try {
            await twilioClient.messages.create({
              body: `Your Estato verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: phone,
            });
          } catch (twilioError) {
            console.error('Twilio error:', twilioError);
            // In development, log OTP
            if (process.env.NODE_ENV === 'development') {
              console.log(`[DEV] OTP for ${phone}: ${otp} (Twilio failed)`);
            } else {
              return res.status(500).json({
                success: false,
                error: 'Failed to send OTP via SMS',
              });
            }
          }
        } else {
          // Twilio not configured, log OTP in development
          console.log(`[DEV] OTP for ${phone}: ${otp} (Twilio not configured)`);
        }
      }

      // Send OTP via Email
      if (email) {
        // TODO: Implement email sending with nodemailer
        // For now, return OTP in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`OTP for ${email}: ${otp}`);
        }
      }

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          expiresIn: process.env.OTP_EXPIRE_MINUTES || 10,
          // Include OTP in development mode only
          ...(process.env.NODE_ENV === 'development' && { otp }),
        },
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 * @access  Public
 */
router.post(
  '/verify',
  [
    body('phone').optional().isMobilePhone(),
    body('email').optional().isEmail(),
    body('otp').isLength({ min: 6, max: 6 }),
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

      const { phone, email, otp } = req.body;
      const identifier = phone || email;

      if (!identifier) {
        return res.status(400).json({
          success: false,
          error: 'Phone or email required',
        });
      }

      const storedOTP = otpStore.get(identifier);

      if (!storedOTP) {
        return res.status(400).json({
          success: false,
          error: 'OTP not found. Please request a new OTP.',
        });
      }

      // Check if OTP expired
      if (Date.now() > storedOTP.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({
          success: false,
          error: 'OTP expired. Please request a new OTP.',
        });
      }

      // Check attempt limit
      if (storedOTP.attempts >= 5) {
        otpStore.delete(identifier);
        return res.status(400).json({
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.',
        });
      }

      // Verify OTP
      if (storedOTP.otp !== otp) {
        storedOTP.attempts += 1;
        otpStore.set(identifier, storedOTP);
        return res.status(400).json({
          success: false,
          error: 'Invalid OTP',
          attemptsRemaining: 5 - storedOTP.attempts,
        });
      }

      // OTP verified successfully
      otpStore.delete(identifier);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          verified: true,
        },
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

/**
 * @route   POST /api/otp/resend
 * @desc    Resend OTP
 * @access  Public
 */
router.post(
  '/resend',
  [
    body('phone').optional().isMobilePhone(),
    body('email').optional().isEmail(),
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

      // Delete old OTP
      const { phone, email } = req.body;
      const identifier = phone || email;
      if (identifier) {
        otpStore.delete(identifier);
      }

      // Call send OTP endpoint
      req.url = '/send';
      router.handle(req, res);
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

module.exports = router;

