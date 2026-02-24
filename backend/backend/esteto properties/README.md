# Esteto Properties - Real Estate Listing Website

A modern, full-featured real estate and rental listing website built with Next.js 14, React, TypeScript, and Supabase.

## Features

### 🏠 Core Features
- **Property Listings**: Browse properties with advanced search and filtering
- **Property Details**: View detailed property information with image galleries, maps, and amenities
- **User Authentication**: Email/password and Google OAuth authentication
- **User Dashboard**: Manage saved properties and personal listings
- **Add Property**: Easy-to-use form to list new properties
- **Admin Dashboard**: Comprehensive admin panel for managing properties and users

### 🎨 UI/UX
- Modern, clean, and minimal design
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Professional color palette
- Premium UI components

### 🔍 Search & Filters
- Location search (city, area)
- Price range filtering
- Property type filtering (flat, house, villa, office, shop)
- Rent/Sale toggle
- Bedrooms/Bathrooms filters
- Amenities filtering

### 📱 Additional Features
- Image gallery with slider
- Save to wishlist functionality
- Google Maps integration
- Contact agent via email/WhatsApp
- Real-time property search
- Pagination and infinite scroll support

### 🔐 Admin Features
- Admin login and authentication
- Add/Edit/Delete properties
- Manage users
- Dashboard analytics (total users, properties, active listings)
- Property status management

### 🚀 Technical Features
- Server-side rendering (SSR)
- SEO optimized with metadata
- OpenGraph tags
- SEO-friendly URLs
- Sitemap and robots.txt
- Type-safe with TypeScript
- Reusable component architecture

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Maps**: Google Maps API
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google Maps API key (optional, for map features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd esteto-properties
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**
   
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase-schema.sql` to create all tables, indexes, and policies

5. **Set up Supabase Storage**
   
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `property-images`
   - Set it to public
   - Configure file size limit (recommended: 5MB)
   - Allowed MIME types: image/jpeg, image/png, image/webp

6. **Configure Google OAuth (Optional)**
   
   - In Supabase Dashboard, go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
esteto-properties/
├── app/                      # Next.js App Router pages
│   ├── about/               # About page
│   ├── admin/               # Admin dashboard
│   ├── auth/                # Authentication pages
│   ├── contact/             # Contact page
│   ├── dashboard/           # User dashboard
│   ├── properties/          # Property pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── layout/             # Layout components (Navbar, Footer)
│   ├── properties/         # Property-related components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and configs
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
└── package.json           # Dependencies
```

## Database Schema

The application uses the following main tables:

- **users**: User profiles extending Supabase auth
- **properties**: Property listings
- **saved_properties**: User wishlist/saved properties

See `supabase-schema.sql` for complete schema with indexes and RLS policies.

## API Routes

All data operations are handled directly through Supabase client or via server actions. The app uses:
- Supabase client for client-side operations
- Row Level Security (RLS) for data protection
- Server actions for secure server-side operations

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Creating an Admin User

To create an admin user:

1. Sign up a regular user account
2. Go to Supabase Dashboard > Table Editor > users
3. Find your user and change the `role` field from `user` to `admin`
4. Now you can access the admin dashboard at `/admin`

## Features in Detail

### Property Search
- Real-time search across property titles, descriptions, and locations
- Multiple filter options with URL state management
- Responsive filter sidebar

### Property Details
- Image gallery with thumbnail navigation
- Interactive Google Maps integration
- Contact options (call, email, WhatsApp)
- Save to wishlist functionality

### User Dashboard
- View and manage saved properties
- View and manage your property listings
- Quick actions for editing/deleting properties

### Admin Dashboard
- Analytics overview
- Manage all properties
- User management
- Property status updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, email info@esteto.com or create an issue in the repository.

## Acknowledgments

- Design inspired by modern real estate platforms
- Built with Next.js and Supabase
- Icons from Lucide React
