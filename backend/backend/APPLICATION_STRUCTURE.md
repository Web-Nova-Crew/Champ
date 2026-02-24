# Estato - Complete Application Structure & Features

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ESTATO PLATFORM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │   NEXT.JS WEB   │   │  FLUTTER MOBILE │   │  EXPRESS.JS     │           │
│  │   (Frontend)    │   │  (iOS/Android)  │   │  BACKEND API    │           │
│  │   Port: 3000    │   │                 │   │  Port: 3000     │           │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘           │
│           │                     │                     │                     │
│           └─────────────────────┴─────────────────────┘                     │
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │      SUPABASE           │                              │
│                    │  (PostgreSQL + Auth)    │                              │
│                    │  yapmbzzqahsyuxxdejpq   │                              │
│                    └─────────────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 1. NEXT.JS WEB APPLICATION

**Location:** `c:\Estato\esteto properties\`

### Directory Structure
```
esteto properties/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 🏠 Homepage
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles (Tailwind)
│   ├── loading.tsx               # Loading state
│   ├── error.tsx                 # Error boundary
│   ├── not-found.tsx             # 404 page
│   │
│   ├── auth/                     # 🔐 Authentication
│   │   ├── login/page.tsx        # Login page
│   │   ├── signup/page.tsx       # Registration page
│   │   ├── forgot-password/      # Password recovery
│   │   └── callback/             # OAuth callback
│   │
│   ├── properties/               # 🏘️ Property Listings
│   │   ├── page.tsx              # All properties list
│   │   └── [id]/page.tsx         # Property details
│   │
│   ├── dashboard/                # 📊 User Dashboard
│   │   └── page.tsx              # User dashboard
│   │
│   ├── admin/                    # 👑 Admin Panel
│   │   └── page.tsx              # Admin dashboard
│   │
│   ├── blog/                     # 📝 Blog Section
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/page.tsx       # Blog post details
│   │
│   ├── about/page.tsx            # ℹ️ About page
│   ├── contact/page.tsx          # 📞 Contact page
│   ├── emi-calculator/page.tsx   # 🧮 EMI Calculator
│   │
│   ├── api/                      # API routes
│   ├── robots.ts                 # SEO robots
│   ├── sitemap.ts                # SEO sitemap
│   └── structured-data.tsx       # SEO structured data
│
├── components/                   # Reusable Components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── properties/               # Property components
│   │   ├── PropertyCard.tsx
│   │   └── PropertyFilters.tsx
│   ├── ui/                       # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   └── DemoBanner.tsx
│
├── lib/                          # Utilities
│   ├── supabase.ts               # Supabase client
│   ├── api.ts                    # API helpers
│   └── utils.ts                  # Utility functions
│
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
├── public/                       # Static assets
└── config files                  # next.config.js, tailwind.config.ts, etc.
```

### Web Features
| Feature | Route | Description |
|---------|-------|-------------|
| 🏠 Homepage | `/` | Landing page with hero, featured properties |
| 🔐 Login | `/auth/login` | User authentication |
| 📝 Signup | `/auth/signup` | User registration |
| 🔑 Forgot Password | `/auth/forgot-password` | Password recovery |
| 🏘️ Properties | `/properties` | Browse all properties |
| 🏠 Property Details | `/properties/[id]` | Single property view |
| 📊 Dashboard | `/dashboard` | User dashboard |
| 👑 Admin Panel | `/admin` | Admin management |
| 📝 Blog | `/blog` | Blog articles |
| ℹ️ About | `/about` | About page |
| 📞 Contact | `/contact` | Contact form |
| 🧮 EMI Calculator | `/emi-calculator` | Loan calculator |

---

## 📱 2. FLUTTER MOBILE APPLICATION

**Location:** `c:\Estato\lib\`

### Directory Structure
```
lib/
├── main.dart                     # App entry point
│
├── models/                       # Data Models
│   ├── user.dart                 # User model
│   ├── user_model.dart           # Extended user model
│   ├── property.dart             # Property model
│   ├── property_model.dart       # Extended property model
│   ├── booking.dart              # Booking model
│   ├── message.dart              # Chat message model
│   └── api_response.dart         # API response wrapper
│
├── providers/                    # State Management (8 providers)
│   ├── auth_provider.dart
│   ├── property_provider.dart
│   ├── booking_provider.dart
│   ├── chat_provider.dart
│   ├── favorites_provider.dart
│   ├── notification_provider.dart
│   └── ...
│
├── screens/                      # UI Screens
│   ├── splash_screen.dart        # Splash/loading screen
│   │
│   ├── auth/                     # 🔐 Authentication
│   │   ├── login_screen.dart
│   │   ├── signup_screen.dart
│   │   └── forgot_password_screen.dart
│   │
│   ├── onboarding/               # 👋 Onboarding
│   │   ├── onboarding_screen.dart
│   │   └── welcome_screen.dart
│   │
│   ├── home/                     # 🏠 Home
│   │   └── home_screen.dart
│   │
│   ├── property/                 # 🏘️ Properties
│   │   ├── property_list_screen.dart
│   │   ├── property_detail_screen.dart
│   │   └── add_property_screen.dart
│   │
│   ├── dashboard/                # 📊 Dashboard
│   │   ├── user_dashboard.dart
│   │   ├── agent_dashboard.dart
│   │   └── admin_dashboard.dart
│   │
│   ├── booking/                  # 📅 Bookings
│   │   ├── booking_screen.dart
│   │   └── booking_history_screen.dart
│   │
│   ├── chat/                     # 💬 Messaging
│   │   ├── chat_list_screen.dart
│   │   └── chat_detail_screen.dart
│   │
│   ├── profile/                  # 👤 Profile
│   │   ├── profile_screen.dart
│   │   ├── edit_profile_screen.dart
│   │   ├── my_properties_screen.dart
│   │   ├── my_favorites_screen.dart
│   │   ├── my_bookings_screen.dart
│   │   ├── notifications_screen.dart
│   │   └── ...
│   │
│   ├── settings/                 # ⚙️ Settings
│   │   ├── settings_screen.dart
│   │   ├── privacy_settings.dart
│   │   ├── notification_settings.dart
│   │   └── theme_settings.dart
│   │
│   ├── filters/                  # 🔍 Search Filters
│   │   └── filter_screen.dart
│   │
│   ├── tools/                    # 🛠️ Tools
│   │   ├── emi_calculator.dart
│   │   └── ...
│   │
│   └── legal/                    # 📜 Legal
│       ├── terms_screen.dart
│       ├── privacy_screen.dart
│       └── about_screen.dart
│
├── services/                     # API Services
│   ├── api_client.dart           # HTTP client
│   ├── api_constants.dart        # API endpoints
│   ├── estato_api_service.dart   # Main API service
│   ├── auth_integration_helper.dart
│   └── config_service.dart
│
├── utils/                        # Utilities
│   ├── constants.dart
│   ├── helpers.dart
│   └── validators.dart
│
└── widgets/                      # Reusable Widgets
    ├── common_widgets.dart
    └── custom_widgets.dart
```

### Mobile Features
| Feature | Screen | Description |
|---------|--------|-------------|
| 👋 Onboarding | `onboarding/` | First-time user experience |
| 🔐 Authentication | `auth/` | Login, signup, password reset |
| 🏠 Home | `home/` | Main home screen |
| 🏘️ Properties | `property/` | Browse, view, add properties |
| 📅 Bookings | `booking/` | Schedule property visits |
| 💬 Chat | `chat/` | Real-time messaging |
| 👤 Profile | `profile/` | User profile management |
| ⚙️ Settings | `settings/` | App settings |
| 🔍 Filters | `filters/` | Property search filters |
| 🛠️ Tools | `tools/` | EMI calculator, etc. |

---

## ⚙️ 3. EXPRESS.JS BACKEND API

**Location:** `c:\Estato\backend\`
**Deployed:** https://champ-y6eg.onrender.com

### Directory Structure
```
backend/
├── server.js                     # Main server entry
├── package.json                  # Dependencies
├── render.yaml                   # Render deployment config
├── .env                          # Environment variables
│
├── config/                       # Configuration
│   ├── database.js               # Supabase connection
│   └── cors.js                   # CORS settings
│
├── middleware/                   # Middleware
│   └── auth.js                   # JWT authentication
│
├── routes/                       # API Routes
│   ├── auth.js                   # 🔐 Authentication routes
│   ├── users.js                  # 👤 User management
│   ├── properties.js             # 🏘️ Property CRUD
│   ├── bookings.js               # 📅 Booking management
│   ├── favorites.js              # ❤️ Favorites
│   ├── chats.js                  # 💬 Chat/messaging
│   ├── notifications.js          # 🔔 Notifications
│   ├── payments.js               # 💳 Payments
│   ├── otp.js                    # 📱 OTP verification
│   └── admin.js                  # 👑 Admin routes
│
├── services/                     # Business Logic
│   └── email.js                  # Email service
│
└── database/                     # Database
    ├── schema.sql                # Database schema
    └── migrations/               # Migrations
```

### API Endpoints

#### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | User registration |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/refresh-token` | Refresh JWT token |
| POST | `/forgot-password` | Password reset request |
| POST | `/reset-password` | Reset password |
| GET | `/me` | Get current user |

#### 👤 Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all users |
| GET | `/:id` | Get user by ID |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |
| GET | `/:id/properties` | User's properties |
| PUT | `/:id/profile` | Update profile |

#### 🏘️ Properties (`/api/properties`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List properties (with filters) |
| GET | `/:id` | Get property details |
| POST | `/` | Create property |
| PUT | `/:id` | Update property |
| DELETE | `/:id` | Delete property |
| GET | `/featured` | Featured properties |
| GET | `/search` | Search properties |
| POST | `/:id/images` | Upload images |

#### 📅 Bookings (`/api/bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List bookings |
| GET | `/:id` | Get booking details |
| POST | `/` | Create booking |
| PUT | `/:id` | Update booking |
| DELETE | `/:id` | Cancel booking |
| PUT | `/:id/status` | Update status |

#### ❤️ Favorites (`/api/favorites`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List favorites |
| POST | `/` | Add to favorites |
| DELETE | `/:propertyId` | Remove from favorites |

#### 💬 Chats (`/api/chats`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List conversations |
| GET | `/:id` | Get conversation |
| POST | `/` | Start conversation |
| POST | `/:id/messages` | Send message |
| GET | `/:id/messages` | Get messages |

#### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List notifications |
| PUT | `/:id/read` | Mark as read |
| PUT | `/read-all` | Mark all as read |
| DELETE | `/:id` | Delete notification |

#### 💳 Payments (`/api/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initiate` | Initiate payment |
| POST | `/verify` | Verify payment |
| GET | `/history` | Payment history |

#### 📱 OTP (`/api/otp`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send OTP |
| POST | `/verify` | Verify OTP |
| POST | `/resend` | Resend OTP |

#### 👑 Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Admin dashboard stats |
| GET | `/users` | Manage users |
| PUT | `/users/:id/role` | Change user role |
| PUT | `/users/:id/status` | Ban/unban user |
| GET | `/properties` | Manage properties |
| PUT | `/properties/:id/approve` | Approve property |
| GET | `/bookings` | All bookings |
| GET | `/reports` | Analytics reports |

---

## 🗄️ 4. DATABASE SCHEMA (Supabase/PostgreSQL)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE TABLES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   USERS     │     │ PROPERTIES  │     │  BOOKINGS   │                   │
│  ├─────────────┤     ├─────────────┤     ├─────────────┤                   │
│  │ id          │◄────│ owner_id    │     │ id          │                   │
│  │ email       │     │ id          │◄────│ property_id │                   │
│  │ password    │     │ title       │     │ user_id     │────►┌───────────┐ │
│  │ name        │     │ description │     │ date        │     │   USERS   │ │
│  │ phone       │     │ price       │     │ status      │     └───────────┘ │
│  │ role        │     │ location    │     │ created_at  │                   │
│  │ avatar      │     │ type        │     └─────────────┘                   │
│  │ created_at  │     │ bedrooms    │                                       │
│  └─────────────┘     │ bathrooms   │     ┌─────────────┐                   │
│         │            │ area        │     │  FAVORITES  │                   │
│         │            │ images      │     ├─────────────┤                   │
│         │            │ amenities   │     │ id          │                   │
│         │            │ status      │     │ user_id     │────►USERS         │
│         │            │ featured    │     │ property_id │────►PROPERTIES    │
│         │            │ created_at  │     │ created_at  │                   │
│         │            └─────────────┘     └─────────────┘                   │
│         │                                                                   │
│         │            ┌─────────────┐     ┌─────────────┐                   │
│         │            │   CHATS     │     │  MESSAGES   │                   │
│         │            ├─────────────┤     ├─────────────┤                   │
│         └───────────►│ id          │◄────│ chat_id     │                   │
│                      │ user1_id    │     │ id          │                   │
│                      │ user2_id    │     │ sender_id   │                   │
│                      │ property_id │     │ content     │                   │
│                      │ created_at  │     │ created_at  │                   │
│                      └─────────────┘     └─────────────┘                   │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │NOTIFICATIONS│     │  PAYMENTS   │     │    OTP      │                   │
│  ├─────────────┤     ├─────────────┤     ├─────────────┤                   │
│  │ id          │     │ id          │     │ id          │                   │
│  │ user_id     │     │ user_id     │     │ user_id     │                   │
│  │ title       │     │ booking_id  │     │ code        │                   │
│  │ message     │     │ amount      │     │ expires_at  │                   │
│  │ read        │     │ status      │     │ verified    │                   │
│  │ created_at  │     │ created_at  │     │ created_at  │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 5. USER ROLES & PERMISSIONS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER ROLES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │     ADMIN       │  Full system access                                    │
│  │     👑          │  • Manage all users                                    │
│  │                 │  • Approve/reject properties                           │
│  │                 │  • View analytics & reports                            │
│  │                 │  • System configuration                                │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│  ┌────────▼────────┐                                                        │
│  │     AGENT       │  Property management                                   │
│  │     🏢          │  • List properties                                     │
│  │                 │  • Manage own listings                                 │
│  │                 │  • Handle bookings                                     │
│  │                 │  • Chat with buyers                                    │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│  ┌────────▼────────┐                                                        │
│  │     BUYER       │  Property browsing                                     │
│  │     👤          │  • Browse properties                                   │
│  │                 │  • Save favorites                                      │
│  │                 │  • Book property visits                                │
│  │                 │  • Chat with agents                                    │
│  └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 6. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  VISIT   │───►│  BROWSE  │───►│  SEARCH  │───►│  VIEW    │              │
│  │  SITE    │    │  HOME    │    │PROPERTIES│    │ DETAILS  │              │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘              │
│                                                       │                     │
│                                                       ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ COMPLETE │◄───│  BOOK    │◄───│  LOGIN/  │◄───│  SAVE/   │              │
│  │ BOOKING  │    │  VISIT   │    │  SIGNUP  │    │  BOOK    │              │
│  └────┬─────┘    └──────────┘    └──────────┘    └──────────┘              │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                              │
│  │  CHAT    │───►│  VISIT   │───►│ FINALIZE │                              │
│  │  AGENT   │    │ PROPERTY │    │   DEAL   │                              │
│  └──────────┘    └──────────┘    └──────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 7. TECH STACK SUMMARY

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Web Frontend** | Next.js 14, React, TypeScript | Server-side rendered web app |
| **Mobile App** | Flutter, Dart | Cross-platform mobile app |
| **Backend API** | Express.js, Node.js | REST API server |
| **Database** | Supabase (PostgreSQL) | Data storage & auth |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State (Mobile)** | Provider | State management |
| **Auth** | JWT, Supabase Auth | Authentication |
| **Deployment** | Render (Backend), Vercel/Netlify (Web) | Hosting |

---

## 📁 8. COMPLETE FILE TREE

```
c:\Estato\
├── 📱 Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/ (7 files)
│   │   ├── providers/ (8 files)
│   │   ├── screens/ (34 files)
│   │   ├── services/ (5 files)
│   │   ├── utils/ (3 files)
│   │   └── widgets/ (2 files)
│   ├── android/
│   ├── ios/
│   ├── web/
│   └── pubspec.yaml
│
├── 🌐 Next.js Web App
│   └── esteto properties/
│       ├── app/ (16 routes)
│       ├── components/ (12 files)
│       ├── lib/
│       ├── hooks/
│       ├── types/
│       └── public/
│
├── ⚙️ Express.js Backend
│   └── backend/
│       ├── server.js
│       ├── routes/ (10 files)
│       ├── middleware/
│       ├── config/
│       ├── services/
│       └── database/
│
└── 📄 Config Files
    ├── package.json
    ├── pubspec.yaml
    └── README files
```

---

## ✅ 9. FEATURE CHECKLIST

### Core Features
- [x] User Authentication (Login/Signup/Logout)
- [x] Password Reset
- [x] OTP Verification
- [x] Property Listings
- [x] Property Search & Filters
- [x] Property Details View
- [x] Favorites/Wishlist
- [x] Property Booking
- [x] Real-time Chat
- [x] Notifications
- [x] User Profile Management
- [x] EMI Calculator

### Admin Features
- [x] Admin Dashboard
- [x] User Management
- [x] Property Approval
- [x] Analytics & Reports
- [x] Role Management

### Agent Features
- [x] Property Listing Creation
- [x] Booking Management
- [x] Chat with Buyers
- [x] Property Analytics

---

*Generated for Estato Real Estate Platform*
*Last Updated: November 2025*
