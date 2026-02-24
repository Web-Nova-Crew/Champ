const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Check for required environment variables before importing routes
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables!');
  console.error(`Missing: ${missingEnvVars.join(', ')}`);
  console.error('');
  console.error('📝 To fix this:');
  console.error('   1. Go to Render Dashboard → Your Service → Environment Tab');
  console.error('   2. Add the following environment variables:');
  console.error('      - PORT=10000');
  console.error('      - NODE_ENV=production');
  console.error('      - SUPABASE_URL');
  console.error('      - SUPABASE_ANON_KEY');
  console.error('      - SUPABASE_SERVICE_ROLE_KEY');
  console.error('      - JWT_SECRET');
  console.error('      - ALLOWED_ORIGINS');
  console.error('   3. Save changes and redeploy');
  console.error('');
  console.error('See: backend/RENDER_ENV_COPY_PASTE.md for detailed instructions');
  process.exit(1);
}

// Import routes (only after env vars are verified)
let authRoutes, otpRoutes, userRoutes, propertyRoutes, favoriteRoutes;
let chatRoutes, bookingRoutes, paymentRoutes, adminRoutes, notificationRoutes, settingsRoutes, aiRoutes;
let adminEnquiriesRoutes, adminSubscriptionsRoutes, adminFaqsRoutes, adminBlacklistRoutes;
let adminSupportRoutes, adminReviewsRoutes, adminRolesRoutes, adminLocationsRoutes;
let adminTenantMatchingRoutes, adminAdsRoutes, adminSeoRoutes, adminLogsRoutes;
let cloudinaryRoutes;

try {
  authRoutes = require('./routes/auth');
  otpRoutes = require('./routes/otp');
  userRoutes = require('./routes/users');
  propertyRoutes = require('./routes/properties');
  favoriteRoutes = require('./routes/favorites');
  chatRoutes = require('./routes/chats');
  bookingRoutes = require('./routes/bookings');
  paymentRoutes = require('./routes/payments');
  adminRoutes = require('./routes/admin');
  notificationRoutes = require('./routes/notifications');
  settingsRoutes = require('./routes/settings');
  aiRoutes = require('./routes/ai');
  adminEnquiriesRoutes = require('./routes/admin-enquiries');
  adminSubscriptionsRoutes = require('./routes/admin-subscriptions');
  adminFaqsRoutes = require('./routes/admin-faqs');
  adminBlacklistRoutes = require('./routes/admin-blacklist');
  adminSupportRoutes = require('./routes/admin-support');
  adminReviewsRoutes = require('./routes/admin-reviews');
  adminRolesRoutes = require('./routes/admin-roles');
  adminLocationsRoutes = require('./routes/admin-locations');
  adminTenantMatchingRoutes = require('./routes/admin-tenant-matching');
  adminAdsRoutes = require('./routes/admin-ads');
  adminSeoRoutes = require('./routes/admin-seo');
  adminLogsRoutes = require('./routes/admin-logs');
  cloudinaryRoutes = require('./routes/cloudinary');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('');
  console.error('This is likely due to missing environment variables.');
  console.error('Please check Render Dashboard → Environment Variables.');
  process.exit(1);
}

// Initialize Express app
const app = express();
// Render automatically sets PORT, fallback to 3000 for local development
const PORT = process.env.PORT || 3000;

// Trust proxy - Required for Render and other reverse proxies
// This fixes the X-Forwarded-For header issue with express-rate-limit
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging

// CORS configuration - Comprehensive setup for mobile apps and web admin
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Add default allowed origins
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'https://estato-axtj.onrender.com', // Add the deployed backend URL
];

const allAllowedOrigins = [...new Set([...allowedOrigins, ...defaultAllowedOrigins])];

console.log('🔐 CORS Configuration:');
console.log('   Allowed Origins:', allAllowedOrigins);
console.log('   Environment:', process.env.NODE_ENV || 'development');

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allAllowedOrigins.some(allowed => origin.includes(allowed) || allowed.includes(origin))) {
        return callback(null, true);
      }
      
      // Allow any localhost or 127.0.0.1 origin
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow any render.com subdomain (for admin panel)
      if (origin.includes('render.com')) {
        return callback(null, true);
      }
      
      // In production for mobile apps, allow all origins (since mobile apps don't send origin)
      // This is safe because we use JWT authentication
      console.log('⚠️  Unknown origin attempting to connect:', origin);
      return callback(null, true); // Allow all origins for mobile app compatibility
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours - cache preflight requests
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// Health check route
app.get('/health', (req, res) => {
  const { supabaseAdmin } = require('./config/supabase');
  res.json({
    success: true,
    message: 'Estato API is running - Image Upload Fixed',
    timestamp: new Date().toISOString(),
    adminClientEnabled: supabaseAdmin !== null,
    serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    version: '1.2.0',
  });
});

// Privacy Policy route (for Play Store compliance)
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy - Estato</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
            .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #1a5f7a; margin-bottom: 10px; }
            h2 { color: #1a5f7a; margin-top: 30px; margin-bottom: 15px; font-size: 1.3em; }
            p { margin-bottom: 15px; }
            ul { margin-left: 20px; margin-bottom: 15px; }
            li { margin-bottom: 8px; }
            .update-date { color: #666; font-size: 0.9em; margin-bottom: 30px; }
            .contact { background: #f0f7fa; padding: 20px; border-radius: 8px; margin-top: 30px; }
            .logo { font-size: 2em; font-weight: bold; color: #1a5f7a; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="logo">🏠 Estato</div>
                <h1>Privacy Policy</h1>
                <p class="update-date">Last updated: December 3, 2025</p>

                <p>Welcome to Estato ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.</p>

                <h2>1. Information We Collect</h2>
                <p>We may collect the following types of information:</p>
                <ul>
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and profile picture when you create an account.</li>
                    <li><strong>Property Information:</strong> Details about properties you list, search for, or save.</li>
                    <li><strong>Usage Data:</strong> Information about how you use the app, including search queries, viewed properties, and interaction patterns.</li>
                    <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers.</li>
                    <li><strong>Location Data:</strong> With your permission, we may collect location data to show nearby properties.</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use the collected information to:</p>
                <ul>
                    <li>Provide and maintain our services</li>
                    <li>Connect buyers, sellers, and agents</li>
                    <li>Send notifications about properties and bookings</li>
                    <li>Improve our app and user experience</li>
                    <li>Respond to your inquiries and support requests</li>
                    <li>Ensure security and prevent fraud</li>
                </ul>

                <h2>3. Information Sharing</h2>
                <p>We may share your information with:</p>
                <ul>
                    <li><strong>Other Users:</strong> Property owners, agents, or buyers when you initiate contact or schedule visits.</li>
                    <li><strong>Service Providers:</strong> Third-party services that help us operate the app (hosting, analytics).</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
                </ul>
                <p>We do not sell your personal information to third parties.</p>

                <h2>4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

                <h2>5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your data</li>
                </ul>

                <h2>6. Children's Privacy</h2>
                <p>Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children.</p>

                <h2>7. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

                <h2>8. Third-Party Services</h2>
                <p>Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites.</p>

                <div class="contact">
                    <h2>9. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us:</p>
                    <ul>
                        <li><strong>Email:</strong> support@estato.in</li>
                        <li><strong>Phone:</strong> +91 98723 64476</li>
                        <li><strong>Address:</strong> Gomti Nagar, Lucknow - 226010, Uttar Pradesh, India</li>
                    </ul>
                </div>

                <p style="margin-top: 30px; text-align: center; color: #666;">© 2025 Estato. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Delete account webpage route (for Play Store compliance)
app.get('/delete-account', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delete Account - Estato Real Estate App</title>
        <meta name="description" content="Request deletion of your Estato account and associated data">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container { max-width: 700px; margin: 0 auto; }
            .header {
                text-align: center;
                padding: 30px 0;
            }
            .logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 32px;
                font-weight: bold;
            }
            h1 { color: #1a1a2e; font-size: 28px; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 16px; }
            .card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .card h2 {
                color: #1a1a2e;
                font-size: 18px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .card h2 .icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            .steps {
                counter-reset: step;
            }
            .step {
                display: flex;
                gap: 16px;
                padding: 16px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            .step:last-child { border-bottom: none; }
            .step-number {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }
            .step-content h3 { color: #1a1a2e; font-size: 16px; margin-bottom: 4px; }
            .step-content p { color: #666; font-size: 14px; }
            .data-list { list-style: none; }
            .data-list li {
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #444;
            }
            .data-list li:last-child { border-bottom: none; }
            .data-list .icon-delete { color: #ef4444; }
            .data-list .icon-retain { color: #f59e0b; }
            .retention-note {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px 16px;
                border-radius: 0 8px 8px 0;
                margin-top: 16px;
                font-size: 14px;
                color: #92400e;
            }
            .form-section {
                background: #f8fafc;
                border-radius: 12px;
                padding: 20px;
            }
            .form-group { margin-bottom: 16px; }
            .form-group label {
                display: block;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 6px;
            }
            .form-group input, .form-group textarea {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 16px;
            }
            .form-group input:focus, .form-group textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .warning {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
            }
            .warning h4 { color: #dc2626; font-size: 14px; margin-bottom: 8px; }
            .warning p { color: #991b1b; font-size: 13px; }
            .checkbox-group {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin: 16px 0;
            }
            .checkbox-group input { margin-top: 4px; }
            .checkbox-group label { color: #4b5563; font-size: 14px; }
            .submit-btn {
                width: 100%;
                padding: 14px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            .submit-btn:hover { background: #b91c1c; }
            .submit-btn:disabled { background: #9ca3af; cursor: not-allowed; }
            .contact-info {
                text-align: center;
                padding: 20px;
                color: #666;
            }
            .contact-info a { color: #667eea; text-decoration: none; }
            .footer {
                text-align: center;
                padding: 20px;
                color: #9ca3af;
                font-size: 14px;
            }
            .success-message {
                display: none;
                text-align: center;
                padding: 40px 20px;
            }
            .success-message .icon {
                width: 64px;
                height: 64px;
                background: #dcfce7;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 32px;
            }
            .success-message h2 { color: #166534; margin-bottom: 10px; }
            .success-message p { color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">E</div>
                <h1>Delete Your Estato Account</h1>
                <p class="subtitle">Estato by Web Nova Crew</p>
            </div>

            <div class="card">
                <h2><span class="icon" style="background:#dbeafe;color:#2563eb;">📋</span> Steps to Delete Your Account</h2>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Submit Request</h3>
                            <p>Fill out the form below with your registered email address</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Verification</h3>
                            <p>We'll send a verification email to confirm your identity</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Processing</h3>
                            <p>Your account will be deleted within 30 days of verification</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h2><span class="icon" style="background:#fee2e2;color:#dc2626;">🗑️</span> Data That Will Be Deleted</h2>
                <ul class="data-list">
                    <li><span class="icon-delete">✕</span> Your profile information (name, email, phone)</li>
                    <li><span class="icon-delete">✕</span> Your property listings and saved searches</li>
                    <li><span class="icon-delete">✕</span> Your booking history and inquiries</li>
                    <li><span class="icon-delete">✕</span> Your saved favorites and preferences</li>
                    <li><span class="icon-delete">✕</span> Your chat messages and conversations</li>
                    <li><span class="icon-delete">✕</span> Your reviews and ratings</li>
                    <li><span class="icon-delete">✕</span> Your payment information</li>
                </ul>
            </div>

            <div class="card">
                <h2><span class="icon" style="background:#fef3c7;color:#d97706;">⏱️</span> Data Retention Policy</h2>
                <ul class="data-list">
                    <li><span class="icon-retain">◐</span> Transaction records - 7 years (Legal compliance)</li>
                    <li><span class="icon-retain">◐</span> Anonymized analytics - Indefinite (Service improvement)</li>
                    <li><span class="icon-retain">◐</span> Legal dispute data - Until resolved</li>
                    <li><span class="icon-retain">◐</span> Tax records - As required by Indian law</li>
                </ul>
                <div class="retention-note">
                    Some data may be retained for legal, regulatory, or legitimate business purposes as required by Indian law.
                </div>
            </div>

            <div class="card" id="form-card">
                <h2><span class="icon" style="background:#f3e8ff;color:#9333ea;">📝</span> Request Account Deletion</h2>
                <form id="deletion-form" class="form-section">
                    <div class="form-group">
                        <label for="email">Registered Email Address *</label>
                        <input type="email" id="email" name="email" required placeholder="Enter your registered email">
                    </div>
                    <div class="form-group">
                        <label for="reason">Reason for Leaving (Optional)</label>
                        <textarea id="reason" name="reason" rows="3" placeholder="Help us improve by sharing why you're leaving..."></textarea>
                    </div>
                    <div class="warning">
                        <h4>⚠️ Warning: This action is irreversible</h4>
                        <p>Once your account is deleted, all your data will be permanently removed and cannot be recovered.</p>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="confirm" required>
                        <label for="confirm">I understand that deleting my account will permanently remove all my data. This action cannot be undone.</label>
                    </div>
                    <button type="submit" class="submit-btn" id="submit-btn">🗑️ Request Account Deletion</button>
                </form>
                <div class="success-message" id="success-message">
                    <div class="icon">✓</div>
                    <h2>Request Submitted</h2>
                    <p>Your account deletion request has been received. We will process your request within 30 days and send a confirmation email.</p>
                </div>
            </div>

            <div class="contact-info">
                <p>Need help? Contact our support team:</p>
                <a href="mailto:support@estatoprop.com">support@estatoprop.com</a>
                <p style="margin-top:8px;font-size:13px;">Developer Contact: <a href="mailto:Contact@webnovacrew.com">Contact@webnovacrew.com</a></p>
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Estato by Web Nova Crew. All rights reserved.</p>
                <p style="margin-top:4px;font-size:12px;"><a href="https://estatoprop.com" style="color:#667eea;">estatoprop.com</a></p>
            </div>
        </div>

        <script>
            document.getElementById('deletion-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                const btn = document.getElementById('submit-btn');
                const email = document.getElementById('email').value;
                const reason = document.getElementById('reason').value;
                
                btn.disabled = true;
                btn.textContent = 'Processing...';
                
                try {
                    const response = await fetch('/api/auth/request-deletion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, reason })
                    });
                    const data = await response.json();
                    
                    document.getElementById('deletion-form').style.display = 'none';
                    document.getElementById('success-message').style.display = 'block';
                } catch (error) {
                    document.getElementById('deletion-form').style.display = 'none';
                    document.getElementById('success-message').style.display = 'block';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/enquiries', adminEnquiriesRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionsRoutes);
app.use('/api/admin/faqs', adminFaqsRoutes);
app.use('/api/admin/blacklist', adminBlacklistRoutes);
app.use('/api/admin/support', adminSupportRoutes);
app.use('/api/admin/reviews', adminReviewsRoutes);
app.use('/api/admin/roles', adminRolesRoutes);
app.use('/api/admin/locations', adminLocationsRoutes);
app.use('/api/admin/tenant-matching', adminTenantMatchingRoutes);
app.use('/api/admin/ads', adminAdsRoutes);
app.use('/api/admin/seo', adminSeoRoutes);
app.use('/api/admin/logs', adminLogsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  const multer = require('multer');
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.',
      });
    }
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server with error handling
try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Estato API Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Server started successfully!`);
  });

  // Initialize Socket.IO
  const { initializeSocket } = require('./services/socket');
  initializeSocket(server);
  console.log(`🔌 Socket.IO initialized for real-time communication`);

} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

module.exports = app;

