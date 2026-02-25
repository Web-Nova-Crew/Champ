-- ============================================
-- COMPLETE ADMIN PANEL DATABASE SCHEMA
-- Estato Real Estate Platform
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
  category VARCHAR(100), -- general, email, security, api, mobile, seo
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATION TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- email, push, sms
  trigger_event VARCHAR(100), -- user_registration, new_property, booking_confirmed, etc.
  subject VARCHAR(500),
  body TEXT NOT NULL,
  variables JSONB, -- Available variables for template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FEATURE FLAGS (Mobile Control)
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100, -- 0-100
  platforms JSONB DEFAULT '["android", "ios", "web"]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REMOTE CONFIG (Mobile Control)
-- ============================================

CREATE TABLE IF NOT EXISTS remote_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  platform VARCHAR(50) DEFAULT 'all', -- all, android, ios, web
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- APP VERSIONS (Mobile Control)
-- ============================================

CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL, -- android, ios
  version VARCHAR(50) NOT NULL,
  build_number INTEGER NOT NULL,
  min_version VARCHAR(50), -- Minimum required version
  force_update BOOLEAN DEFAULT false,
  release_notes TEXT,
  download_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BANNERS
-- ============================================

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  image_url TEXT NOT NULL,
  link_url TEXT,
  position VARCHAR(100) DEFAULT 'hero', -- hero, sidebar, footer, popup
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  target_audience JSONB, -- {"user_types": ["buyer", "seller"], "locations": ["lucknow"]}
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEDIA LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100), -- image/jpeg, video/mp4, application/pdf
  file_size BIGINT, -- in bytes
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES users(id),
  alt_text VARCHAR(500),
  tags JSONB DEFAULT '[]'::jsonb,
  folder VARCHAR(255) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STATIC PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BLOG POSTS
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES users(id),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AD SLOTS
-- ============================================

CREATE TABLE IF NOT EXISTS ad_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL, -- homepage_banner, sidebar, property_detail, etc.
  dimensions VARCHAR(50), -- 728x90, 300x250, etc.
  price_per_day DECIMAL(10,2) NOT NULL,
  max_ads INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AD BOOKINGS
-- ============================================

CREATE TABLE IF NOT EXISTS ad_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID REFERENCES ad_slots(id),
  advertiser_name VARCHAR(255) NOT NULL,
  advertiser_email VARCHAR(255) NOT NULL,
  advertiser_phone VARCHAR(50),
  ad_title VARCHAR(255) NOT NULL,
  ad_image_url TEXT NOT NULL,
  ad_link_url TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, cancelled
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TENANT MATCHING
-- ============================================

CREATE TABLE IF NOT EXISTS tenant_matching (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  looking_for VARCHAR(50) NOT NULL, -- rent, buy
  property_type VARCHAR(100), -- apartment, house, villa, etc.
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  bedrooms INTEGER,
  requirements TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, matched, closed
  matched_properties JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTION PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period VARCHAR(50) NOT NULL, -- monthly, quarterly, yearly
  features JSONB NOT NULL, -- {"property_listings": 10, "featured_listings": 2, "analytics": true}
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- USER SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES subscription_plans(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
  payment_id UUID,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ENQUIRIES / LEADS
-- ============================================

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT,
  enquiry_type VARCHAR(50) NOT NULL, -- call, whatsapp, email, visit
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, interested, closed
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROPERTY REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS property_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  is_reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CITIES & LOCATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  country VARCHAR(255) DEFAULT 'India',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  pincode VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FEATURED PROPERTIES
-- ============================================

CREATE TABLE IF NOT EXISTS featured_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id)
);

-- ============================================
-- PROPERTY CATEGORIES & AMENITIES
-- ============================================

CREATE TABLE IF NOT EXISTS property_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(100),
  category VARCHAR(100), -- basic, safety, recreation, etc.
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SYSTEM LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(50) NOT NULL, -- info, warning, error, critical
  category VARCHAR(100), -- auth, api, database, email, etc.
  message TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BACKUPS
-- ============================================

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(500) NOT NULL,
  file_size BIGINT,
  backup_type VARCHAR(50) DEFAULT 'full', -- full, incremental
  status VARCHAR(50) DEFAULT 'completed', -- pending, in_progress, completed, failed
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SEO SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path VARCHAR(500) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots VARCHAR(100) DEFAULT 'index, follow',
  schema_markup JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_trigger ON notification_templates(trigger_event);
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_remote_config_key ON remote_config(key);
CREATE INDEX idx_banners_active ON banners(is_active, start_date, end_date);
CREATE INDEX idx_media_library_uploaded_by ON media_library(uploaded_by);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at);
CREATE INDEX idx_ad_bookings_slot ON ad_bookings(slot_id);
CREATE INDEX idx_ad_bookings_dates ON ad_bookings(start_date, end_date);
CREATE INDEX idx_tenant_matching_user ON tenant_matching(user_id);
CREATE INDEX idx_tenant_matching_status ON tenant_matching(status);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_enquiries_property ON enquiries(property_id);
CREATE INDEX idx_enquiries_user ON enquiries(user_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_property_reviews_property ON property_reviews(property_id);
CREATE INDEX idx_property_reviews_status ON property_reviews(status);
CREATE INDEX idx_cities_active ON cities(is_active);
CREATE INDEX idx_areas_city ON areas(city_id);
CREATE INDEX idx_featured_properties_active ON featured_properties(is_active, display_order);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created ON system_logs(created_at);
CREATE INDEX idx_seo_pages_path ON seo_pages(page_path);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default system settings
INSERT INTO system_settings (key, value, type, category, description, is_public) VALUES
('site_name', 'Estato', 'string', 'general', 'Site name', true),
('site_url', 'https://estato.com', 'string', 'general', 'Site URL', true),
('site_description', 'Premium Real Estate Platform', 'string', 'general', 'Site description', true),
('support_email', 'support@estato.com', 'string', 'general', 'Support email', true),
('support_phone', '+91 9876543210', 'string', 'general', 'Support phone', true),
('currency', 'INR', 'string', 'general', 'Currency code', true),
('timezone', 'Asia/Kolkata', 'string', 'general', 'Timezone', true),
('maintenance_mode', 'false', 'boolean', 'general', 'Maintenance mode', true),
('email_notifications_enabled', 'true', 'boolean', 'notifications', 'Enable email notifications', false),
('push_notifications_enabled', 'true', 'boolean', 'notifications', 'Enable push notifications', false),
('sms_notifications_enabled', 'false', 'boolean', 'notifications', 'Enable SMS notifications', false),
('require_email_verification', 'true', 'boolean', 'security', 'Require email verification', false),
('require_phone_verification', 'false', 'boolean', 'security', 'Require phone verification', false),
('enable_2fa', 'false', 'boolean', 'security', 'Enable 2FA for admins', false),
('require_strong_password', 'true', 'boolean', 'security', 'Require strong passwords', false),
('smtp_host', 'smtp.gmail.com', 'string', 'email', 'SMTP host', false),
('smtp_port', '587', 'number', 'email', 'SMTP port', false),
('smtp_username', 'admin@estato.com', 'string', 'email', 'SMTP username', false),
('from_email', 'noreply@estato.com', 'string', 'email', 'From email address', false),
('from_name', 'Estato', 'string', 'email', 'From name', false),
('google_analytics_id', '', 'string', 'seo', 'Google Analytics ID', false),
('facebook_pixel_id', '', 'string', 'seo', 'Facebook Pixel ID', false),
('enable_sitemap', 'true', 'boolean', 'seo', 'Enable XML sitemap', true),
('enable_schema_markup', 'true', 'boolean', 'seo', 'Enable schema markup', true)
ON CONFLICT (key) DO NOTHING;

-- Default amenities
INSERT INTO amenities (name, slug, icon, category) VALUES
('Parking', 'parking', 'car', 'basic'),
('Gym', 'gym', 'dumbbell', 'recreation'),
('Swimming Pool', 'swimming-pool', 'waves', 'recreation'),
('Security', '24x7-security', 'shield', 'safety'),
('Power Backup', 'power-backup', 'zap', 'basic'),
('Elevator', 'elevator', 'arrow-up', 'basic'),
('Garden', 'garden', 'tree', 'recreation'),
('Playground', 'playground', 'users', 'recreation'),
('CCTV', 'cctv', 'video', 'safety'),
('Fire Safety', 'fire-safety', 'alert-triangle', 'safety')
ON CONFLICT (slug) DO NOTHING;

-- Default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_period, features, display_order) VALUES
('Free', 'Basic plan for individual users', 0, 'monthly', '{"property_listings": 2, "featured_listings": 0, "analytics": false, "priority_support": false}'::jsonb, 1),
('Basic', 'For agents and small landlords', 999, 'monthly', '{"property_listings": 10, "featured_listings": 1, "analytics": true, "priority_support": false}'::jsonb, 2),
('Pro', 'For professional agents and agencies', 2999, 'monthly', '{"property_listings": 50, "featured_listings": 5, "analytics": true, "priority_support": true}'::jsonb, 3),
('Enterprise', 'For large agencies and builders', 9999, 'monthly', '{"property_listings": -1, "featured_listings": 20, "analytics": true, "priority_support": true, "api_access": true}'::jsonb, 4)
ON CONFLICT DO NOTHING;
