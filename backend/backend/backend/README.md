# Estato Backend API

Node.js backend API for Estato Real Estate App with Supabase authentication and PostgreSQL database.

## 🚀 Features

- ✅ Supabase Authentication (JWT-based)
- ✅ User Management (Profile, Avatar, Password)
- ✅ Property CRUD Operations
- ✅ Favorites Management
- ✅ Real-time Chat
- ✅ Booking System
- ✅ Payment Integration (Razorpay)
- ✅ OTP Verification (Twilio)
- ✅ Admin Dashboard
- ✅ File Upload (Supabase Storage)
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Configuration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Twilio account (for SMS/OTP)
- Razorpay account (for payments)

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   - Add your Supabase credentials
   - Add Twilio credentials
   - Add Razorpay credentials
   - Add other required configurations

5. **Set up Supabase Database**
   - Run `database/schema.sql` in Supabase SQL Editor
   - Set up storage buckets (see `database/storage-setup.md`)

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

### Required Variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)

### Optional Variables:
- `TWILIO_ACCOUNT_SID` - For SMS/OTP
- `TWILIO_AUTH_TOKEN` - For SMS/OTP
- `RAZORPAY_KEY_ID` - For payments
- `RAZORPAY_KEY_SECRET` - For payments

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password

### OTP
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP
- `POST /api/otp/resend` - Resend OTP

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar
- `POST /api/users/change-password` - Change password

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/:id/similar` - Get similar properties

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/:propertyId` - Remove favorite

### Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/messages` - Send message

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking (confirm/cancel)

### Payments
- `POST /api/payments/create` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/properties` - Get all properties
- `PUT /api/admin/properties/:id/approve` - Approve property
- `PUT /api/admin/properties/:id/reject` - Reject property
- `GET /api/admin/agents` - Get all agents
- `PUT /api/admin/agents/:id/approve` - Approve agent
- `GET /api/admin/reports` - Get all reports
- `PUT /api/admin/reports/:id/resolve` - Resolve report

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

The access token is obtained from Supabase Auth after login.

## 📊 Database Schema

See `database/schema.sql` for complete database schema.

### Main Tables:
- `users` - User profiles
- `properties` - Property listings
- `favorites` - User favorites
- `chats` - Chat conversations
- `messages` - Chat messages
- `bookings` - Property visit bookings
- `payments` - Payment transactions
- `reports` - User reports
- `notifications` - User notifications

## 🗄️ Storage

Supabase Storage is used for:
- Property images (`property-images` bucket)
- User avatars (`avatars` bucket)

See `database/storage-setup.md` for setup instructions.

## 🧪 Testing

```bash
npm test
```

## 📝 API Documentation

### Request Format
All requests should be JSON format with `Content-Type: application/json` header.

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "errors": [...] // Optional validation errors
}
```

## 🚀 Deployment

### Deploy to Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Deploy to Vercel
1. Install Vercel CLI
2. Deploy:
   ```bash
   vercel
   ```

## 🔒 Security

- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS configuration
- Input validation
- SQL injection protection (via Supabase)
- Row Level Security (RLS) in database

## 📞 Support

For issues or questions:
- Email: support@estato.com
- Documentation: See API documentation above

## 📄 License

ISC

