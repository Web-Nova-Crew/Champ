-- ============================================
-- ESTATO ADMIN PANEL - COMPLETE DATABASE SCHEMA V2
-- Run this AFTER the original supabase-schema.sql
-- ============================================

-- ============================================
-- 1. CITIES & AREAS (Location Management)
-- ============================================
create table if not exists public.cities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  state text not null default 'Uttar Pradesh',
  slug text unique,
  active boolean default true,
  property_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.areas (
  id uuid default uuid_generate_v4() primary key,
  city_id uuid references public.cities(id) on delete cascade not null,
  name text not null,
  slug text,
  pincode text,
  active boolean default true,
  property_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(city_id, name)
);

-- ============================================
-- 2. BOOKINGS (Property Visit Scheduling)
-- ============================================
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  owner_id uuid references public.users(id),
  date date not null,
  time text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  cancellation_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 3. REVIEWS (Property Reviews & Ratings)
-- ============================================
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reported boolean default false,
  report_reason text,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(property_id, user_id)
);

-- ============================================
-- 4. REPORTS (User Reports & Complaints)
-- ============================================
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('property', 'user', 'review', 'message', 'spam', 'fake')),
  reason text not null,
  description text,
  reported_item_id text not null,
  reported_item_title text,
  reporter_id uuid references public.users(id) on delete set null,
  reporter_name text,
  reporter_email text,
  reported_user_id uuid references public.users(id) on delete set null,
  reported_user_name text,
  status text default 'pending' check (status in ('pending', 'investigating', 'resolved', 'dismissed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  resolution_notes text,
  resolved_by uuid references public.users(id) on delete set null,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 5. FEATURED PROPERTIES
-- ============================================
create table if not exists public.featured_properties (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null unique,
  position integer default 0,
  active boolean default true,
  start_date date,
  end_date date,
  boost_area text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 6. ENQUIRIES / LEADS TRACKING
-- ============================================
create table if not exists public.enquiries (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  owner_id uuid references public.users(id) on delete set null,
  type text default 'general' check (type in ('general', 'call_click', 'whatsapp_click', 'email', 'booking', 'chat')),
  name text,
  email text,
  phone text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'interested', 'closed', 'spam')),
  assigned_to uuid references public.users(id) on delete set null,
  call_notes text,
  follow_up_date date,
  source text default 'app' check (source in ('app', 'website', 'direct', 'referral')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 7. SUBSCRIPTIONS / PLANS
-- ============================================
create table if not exists public.subscription_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric not null default 0,
  duration_days integer not null default 30,
  max_listings integer default 5,
  featured_listings integer default 0,
  boost_included boolean default false,
  priority_support boolean default false,
  badge text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan_id uuid references public.subscription_plans(id) on delete restrict not null,
  status text default 'active' check (status in ('active', 'expired', 'cancelled', 'pending')),
  payment_id text,
  payment_method text check (payment_method in ('razorpay', 'paytm', 'upi', 'bank_transfer', 'free', 'manual')),
  amount_paid numeric default 0,
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone not null,
  auto_renew boolean default false,
  invoice_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 8. ADMIN ROLES & PERMISSIONS (RBAC)
-- ============================================
create table if not exists public.admin_roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  permissions jsonb default '[]'::jsonb,
  is_system boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  role_id uuid references public.admin_roles(id) on delete cascade not null,
  assigned_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role_id)
);

-- ============================================
-- 9. NOTIFICATION TEMPLATES (Persisted)
-- ============================================
create table if not exists public.notification_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('email', 'push', 'sms', 'whatsapp')),
  trigger_event text not null,
  subject text,
  title text,
  body text not null,
  variables text[] default '{}',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 10. SITE SETTINGS (Key-Value Store)
-- ============================================
create table if not exists public.site_settings (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text,
  type text default 'string' check (type in ('string', 'number', 'boolean', 'json', 'text')),
  category text default 'general',
  description text,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 11. SEO SETTINGS
-- ============================================
create table if not exists public.seo_settings (
  id uuid default uuid_generate_v4() primary key,
  page_path text not null unique,
  title text,
  description text,
  keywords text,
  og_image text,
  no_index boolean default false,
  schema_markup jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 12. AUDIT LOGS (Who did what & when)
-- ============================================
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete set null,
  user_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 13. ADMIN ACTIVITY LOGS (System Logs)
-- ============================================
create table if not exists public.system_logs (
  id uuid default uuid_generate_v4() primary key,
  level text default 'info' check (level in ('info', 'warning', 'error', 'success', 'debug')),
  message text not null,
  source text default 'system',
  user_id uuid references public.users(id) on delete set null,
  user_email text,
  ip_address text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 14. BLACKLIST / FRAUD PROTECTION
-- ============================================
create table if not exists public.blacklist (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('phone', 'email', 'ip', 'device', 'keyword')),
  value text not null,
  reason text,
  blocked_by uuid references public.users(id) on delete set null,
  active boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(type, value)
);

-- ============================================
-- 15. TENANT REQUIREMENTS (Smart Matching)
-- ============================================
create table if not exists public.tenant_requirements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  property_type text,
  listing_type text check (listing_type in ('rent', 'buy')),
  min_budget numeric,
  max_budget numeric,
  preferred_areas text[] default '{}',
  preferred_city text,
  bedrooms integer,
  amenities text[] default '{}',
  move_in_date date,
  additional_notes text,
  status text default 'active' check (status in ('active', 'matched', 'closed', 'expired')),
  matched_properties uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 16. AD SLOTS / MARKETPLACE
-- ============================================
create table if not exists public.ad_slots (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  position text not null check (position in ('home_banner', 'sidebar', 'listing_top', 'listing_bottom', 'search_results', 'category_page')),
  size text,
  price_per_day numeric default 0,
  price_per_week numeric default 0,
  price_per_month numeric default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ad_bookings (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references public.ad_slots(id) on delete cascade not null,
  advertiser_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  image_url text,
  link_url text,
  start_date date not null,
  end_date date not null,
  amount_paid numeric default 0,
  payment_id text,
  status text default 'pending' check (status in ('pending', 'active', 'expired', 'cancelled', 'rejected')),
  impressions integer default 0,
  clicks integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 17. CONTACT FORM / SUPPORT INBOX
-- ============================================
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  type text default 'general' check (type in ('general', 'complaint', 'feedback', 'partnership', 'bug_report')),
  status text default 'new' check (status in ('new', 'read', 'replied', 'closed', 'spam')),
  assigned_to uuid references public.users(id) on delete set null,
  admin_reply text,
  replied_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 18. FAQs
-- ============================================
create table if not exists public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  category text default 'general',
  sort_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL NEW TABLES
-- ============================================
alter table public.cities enable row level security;
alter table public.areas enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.featured_properties enable row level security;
alter table public.enquiries enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.admin_roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.notification_templates enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_logs enable row level security;
alter table public.blacklist enable row level security;
alter table public.tenant_requirements enable row level security;
alter table public.ad_slots enable row level security;
alter table public.ad_bookings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.faqs enable row level security;

-- ============================================
-- RLS POLICIES - Public Read, Admin Write
-- ============================================

-- Cities & Areas: Public read, admin write
create policy "Cities viewable by everyone" on public.cities for select using (true);
create policy "Admins can manage cities" on public.cities for all using (public.is_admin());

create policy "Areas viewable by everyone" on public.areas for select using (true);
create policy "Admins can manage areas" on public.areas for all using (public.is_admin());

-- Bookings: Users see own, admins see all
create policy "Users can view own bookings" on public.bookings for select using (auth.uid() = user_id or auth.uid() = owner_id);
create policy "Users can create bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Admins can manage bookings" on public.bookings for all using (public.is_admin());

-- Reviews: Public read approved, users manage own, admins manage all
create policy "Approved reviews viewable by everyone" on public.reviews for select using (status = 'approved');
create policy "Users can view own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Admins can manage reviews" on public.reviews for all using (public.is_admin());

-- Reports: Users create own, admins manage all
create policy "Users can create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Users can view own reports" on public.reports for select using (auth.uid() = reporter_id);
create policy "Admins can manage reports" on public.reports for all using (public.is_admin());

-- Featured Properties: Public read, admin write
create policy "Featured properties viewable by everyone" on public.featured_properties for select using (true);
create policy "Admins can manage featured properties" on public.featured_properties for all using (public.is_admin());

-- Enquiries: Owners see own, admins see all
create policy "Users can create enquiries" on public.enquiries for insert with check (auth.uid() = user_id);
create policy "Users can view own enquiries" on public.enquiries for select using (auth.uid() = user_id or auth.uid() = owner_id);
create policy "Admins can manage enquiries" on public.enquiries for all using (public.is_admin());

-- Subscription Plans: Public read, admin write
create policy "Plans viewable by everyone" on public.subscription_plans for select using (true);
create policy "Admins can manage plans" on public.subscription_plans for all using (public.is_admin());

-- User Subscriptions: Users see own, admins see all
create policy "Users can view own subscriptions" on public.user_subscriptions for select using (auth.uid() = user_id);
create policy "Admins can manage subscriptions" on public.user_subscriptions for all using (public.is_admin());

-- Admin Roles: Admin only
create policy "Admins can view roles" on public.admin_roles for select using (public.is_admin());
create policy "Admins can manage roles" on public.admin_roles for all using (public.is_admin());

create policy "Admins can view user roles" on public.user_roles for select using (public.is_admin());
create policy "Admins can manage user roles" on public.user_roles for all using (public.is_admin());

-- Notification Templates: Admin only
create policy "Admins can view templates" on public.notification_templates for select using (public.is_admin());
create policy "Admins can manage templates" on public.notification_templates for all using (public.is_admin());

-- Site Settings: Public read, admin write
create policy "Settings viewable by everyone" on public.site_settings for select using (true);
create policy "Admins can manage settings" on public.site_settings for all using (public.is_admin());

-- SEO Settings: Public read, admin write
create policy "SEO settings viewable by everyone" on public.seo_settings for select using (true);
create policy "Admins can manage SEO" on public.seo_settings for all using (public.is_admin());

-- Audit Logs: Admin only
create policy "Admins can view audit logs" on public.audit_logs for select using (public.is_admin());
create policy "System can insert audit logs" on public.audit_logs for insert with check (true);

-- System Logs: Admin only
create policy "Admins can view system logs" on public.system_logs for select using (public.is_admin());
create policy "System can insert system logs" on public.system_logs for insert with check (true);

-- Blacklist: Admin only
create policy "Admins can view blacklist" on public.blacklist for select using (public.is_admin());
create policy "Admins can manage blacklist" on public.blacklist for all using (public.is_admin());

-- Tenant Requirements: Users manage own, admins see all
create policy "Users can manage own requirements" on public.tenant_requirements for all using (auth.uid() = user_id);
create policy "Admins can manage requirements" on public.tenant_requirements for all using (public.is_admin());

-- Ad Slots: Public read, admin write
create policy "Ad slots viewable by everyone" on public.ad_slots for select using (true);
create policy "Admins can manage ad slots" on public.ad_slots for all using (public.is_admin());

-- Ad Bookings: Users see own, admins see all
create policy "Users can view own ad bookings" on public.ad_bookings for select using (auth.uid() = advertiser_id);
create policy "Users can create ad bookings" on public.ad_bookings for insert with check (auth.uid() = advertiser_id);
create policy "Admins can manage ad bookings" on public.ad_bookings for all using (public.is_admin());

-- Contact Messages: Admin only (public insert)
create policy "Anyone can submit contact form" on public.contact_messages for insert with check (true);
create policy "Admins can manage contact messages" on public.contact_messages for all using (public.is_admin());

-- FAQs: Public read, admin write
create policy "FAQs viewable by everyone" on public.faqs for select using (true);
create policy "Admins can manage FAQs" on public.faqs for all using (public.is_admin());

-- ============================================
-- SEED DATA: Default Admin Roles
-- ============================================
insert into public.admin_roles (name, description, permissions, is_system) values
  ('Super Admin', 'Full access to all features', '["*"]'::jsonb, true),
  ('Moderator', 'Can moderate content and users', '["dashboard.view","properties.view","properties.approve","users.view","agents.view","agents.approve","reports.view","reports.manage","content.reviews"]'::jsonb, false),
  ('Support Executive', 'Can view and manage bookings and enquiries', '["dashboard.view","properties.view","users.view","bookings.view","bookings.manage","enquiries.view","enquiries.manage","reports.view"]'::jsonb, false),
  ('Content Manager', 'Can manage content and SEO', '["dashboard.view","properties.view","properties.featured","content.banners","content.locations","content.categories","content.reviews","content.blog","content.pages","content.faqs","settings.seo"]'::jsonb, false),
  ('Sales/Marketing', 'Can manage leads, subscriptions and ads', '["dashboard.view","enquiries.view","enquiries.manage","subscriptions.view","subscriptions.manage","ads.view","ads.manage","reports.view"]'::jsonb, false)
on conflict (name) do nothing;

-- ============================================
-- SEED DATA: Default Subscription Plans
-- ============================================
insert into public.subscription_plans (name, slug, description, price, duration_days, max_listings, featured_listings, boost_included, sort_order) values
  ('Free', 'free', 'Basic listing with limited features', 0, 365, 3, 0, false, 1),
  ('Silver', 'silver', 'More listings with basic boost', 499, 30, 10, 1, false, 2),
  ('Gold', 'gold', 'Premium listings with featured placement', 999, 30, 25, 3, true, 3),
  ('Platinum', 'platinum', 'Unlimited listings with all features', 1999, 30, -1, 10, true, 4)
on conflict (slug) do nothing;

-- ============================================
-- SEED DATA: Default Site Settings
-- ============================================
insert into public.site_settings (key, value, type, category, description) values
  ('site_name', 'Estato', 'string', 'general', 'Site name'),
  ('site_description', 'Premium Real Estate Platform', 'string', 'general', 'Site description'),
  ('site_url', 'https://estatoprop.com', 'string', 'general', 'Site URL'),
  ('support_email', 'support@estatoprop.com', 'string', 'general', 'Support email'),
  ('support_phone', '+91 9872364476', 'string', 'general', 'Support phone'),
  ('whatsapp_link', 'https://wa.me/919872364476', 'string', 'general', 'WhatsApp link'),
  ('currency', 'INR', 'string', 'general', 'Currency'),
  ('timezone', 'Asia/Kolkata', 'string', 'general', 'Timezone'),
  ('maintenance_mode', 'false', 'boolean', 'general', 'Maintenance mode'),
  ('maintenance_message', 'We are under maintenance. Please try again later.', 'text', 'general', 'Maintenance message'),
  ('privacy_policy_url', '/privacy-policy', 'string', 'content', 'Privacy policy URL'),
  ('terms_url', '/terms-of-service', 'string', 'content', 'Terms of service URL'),
  ('about_us_url', '/about', 'string', 'content', 'About us URL'),
  ('email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications'),
  ('push_notifications', 'true', 'boolean', 'notifications', 'Enable push notifications'),
  ('sms_notifications', 'false', 'boolean', 'notifications', 'Enable SMS notifications'),
  ('smtp_host', 'smtp.gmail.com', 'string', 'email', 'SMTP host'),
  ('smtp_port', '587', 'number', 'email', 'SMTP port'),
  ('google_maps_api_key', '', 'string', 'api', 'Google Maps API key'),
  ('firebase_api_key', '', 'string', 'api', 'Firebase API key'),
  ('razorpay_key_id', '', 'string', 'payments', 'Razorpay Key ID'),
  ('razorpay_key_secret', '', 'string', 'payments', 'Razorpay Key Secret'),
  ('android_app_url', '', 'string', 'mobile', 'Android app URL'),
  ('ios_app_url', '', 'string', 'mobile', 'iOS app URL'),
  ('force_app_update', 'false', 'boolean', 'mobile', 'Force app update'),
  ('min_android_version', '1.0.0', 'string', 'mobile', 'Minimum Android version'),
  ('min_ios_version', '1.0.0', 'string', 'mobile', 'Minimum iOS version'),
  ('listing_auto_expire_days', '30', 'number', 'listings', 'Auto-expire listings after days'),
  ('max_images_per_listing', '10', 'number', 'listings', 'Max images per listing'),
  ('require_listing_approval', 'true', 'boolean', 'listings', 'Require admin approval for listings'),
  ('duplicate_detection', 'true', 'boolean', 'listings', 'Enable duplicate listing detection'),
  ('rate_limit_listings_per_day', '10', 'number', 'security', 'Max listings per user per day'),
  ('require_email_verification', 'true', 'boolean', 'security', 'Require email verification'),
  ('require_phone_verification', 'false', 'boolean', 'security', 'Require phone verification'),
  ('max_login_attempts', '5', 'number', 'security', 'Max login attempts before lockout')
on conflict (key) do nothing;

-- ============================================
-- SEED DATA: Default SEO Settings
-- ============================================
insert into public.seo_settings (page_path, title, description, keywords) values
  ('/', 'Estato - Find Your Dream Property in Lucknow', 'Discover premium properties for rent and sale in Lucknow. Verified listings, trusted agents.', 'real estate, property, rent, buy, sell, lucknow'),
  ('/properties', 'Properties - Estato', 'Browse all properties for rent and sale in Lucknow', 'properties, listings, rent, buy, lucknow'),
  ('/agents', 'Agents - Estato', 'Connect with trusted real estate agents in Lucknow', 'agents, brokers, real estate'),
  ('/about', 'About Us - Estato', 'Learn about Estato and our mission', 'about, company, mission'),
  ('/contact', 'Contact Us - Estato', 'Get in touch with our team', 'contact, support, help')
on conflict (page_path) do nothing;

-- ============================================
-- SEED DATA: Default Cities & Areas
-- ============================================
insert into public.cities (name, state, slug, active) values
  ('Lucknow', 'Uttar Pradesh', 'lucknow', true),
  ('Kanpur', 'Uttar Pradesh', 'kanpur', true),
  ('Noida', 'Uttar Pradesh', 'noida', true),
  ('Varanasi', 'Uttar Pradesh', 'varanasi', true)
on conflict (slug) do nothing;

-- Insert areas for Lucknow
do $$
declare
  lucknow_id uuid;
begin
  select id into lucknow_id from public.cities where slug = 'lucknow';
  if lucknow_id is not null then
    insert into public.areas (city_id, name, slug, pincode, active) values
      (lucknow_id, 'Gomti Nagar', 'gomti-nagar', '226010', true),
      (lucknow_id, 'Hazratganj', 'hazratganj', '226001', true),
      (lucknow_id, 'Aliganj', 'aliganj', '226024', true),
      (lucknow_id, 'Indira Nagar', 'indira-nagar', '226016', true),
      (lucknow_id, 'Mahanagar', 'mahanagar', '226006', true),
      (lucknow_id, 'Aminabad', 'aminabad', '226018', true),
      (lucknow_id, 'Chowk', 'chowk', '226003', true),
      (lucknow_id, 'Rajajipuram', 'rajajipuram', '226017', true),
      (lucknow_id, 'Vikas Nagar', 'vikas-nagar', '226022', true),
      (lucknow_id, 'Jankipuram', 'jankipuram', '226021', true)
    on conflict (city_id, name) do nothing;
  end if;
end $$;

-- ============================================
-- SEED DATA: Default FAQs
-- ============================================
insert into public.faqs (question, answer, category, sort_order) values
  ('How do I list my property on Estato?', 'Simply create an account, go to "Add Property" and fill in the details. Your listing will be reviewed and published within 24 hours.', 'listings', 1),
  ('Is it free to list a property?', 'Yes! Basic listings are free. For premium features like featured placement and boost, check our subscription plans.', 'listings', 2),
  ('How do I contact a property owner?', 'Click the "Call" or "WhatsApp" button on any listing to directly contact the owner or agent.', 'general', 3),
  ('How do I report a fake listing?', 'Click the "Report" button on the listing page and select the appropriate reason. Our team will review it within 24 hours.', 'general', 4),
  ('What areas does Estato cover?', 'Currently we cover Lucknow and surrounding areas. We are expanding to more cities soon!', 'general', 5)
on conflict do nothing;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to log audit events
create or replace function public.log_audit(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text default null,
  p_old_values jsonb default null,
  p_new_values jsonb default null
) returns void as $$
begin
  insert into public.audit_logs (user_id, user_email, action, entity_type, entity_id, old_values, new_values)
  select p_user_id, u.email, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values
  from public.users u where u.id = p_user_id;
end;
$$ language plpgsql security definer;

-- Function to log system events
create or replace function public.log_system(
  p_level text,
  p_message text,
  p_source text default 'system',
  p_metadata jsonb default null
) returns void as $$
begin
  insert into public.system_logs (level, message, source, metadata)
  values (p_level, p_message, p_source, p_metadata);
end;
$$ language plpgsql security definer;

-- Function to check if a value is blacklisted
create or replace function public.is_blacklisted(
  p_type text,
  p_value text
) returns boolean as $$
begin
  return exists (
    select 1 from public.blacklist
    where type = p_type
    and value = p_value
    and active = true
    and (expires_at is null or expires_at > now())
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 20. SEO SETTINGS KEY-VALUE (Global SEO config)
-- ============================================
create table if not exists public.seo_settings_kv (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 21. PAGE SEO (Per-page SEO overrides)
-- ============================================
create table if not exists public.page_seo (
  id uuid default uuid_generate_v4() primary key,
  path text not null unique,
  title text,
  description text,
  keywords text,
  og_image text,
  no_index boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new SEO tables
alter table public.seo_settings_kv enable row level security;
alter table public.page_seo enable row level security;

-- Public read policies for SEO KV and Page SEO
create policy "SEO KV viewable by everyone" on public.seo_settings_kv for select using (true);
create policy "Admins can manage SEO KV" on public.seo_settings_kv for all using (public.is_admin());
create policy "Page SEO viewable by everyone" on public.page_seo for select using (true);
create policy "Admins can manage Page SEO" on public.page_seo for all using (public.is_admin());

-- ============================================
-- ANON-ACCESSIBLE READ POLICIES FOR ADMIN PANEL
-- These allow the frontend (using anon key) to read
-- data for the admin dashboard and management pages.
-- Write operations go through the backend API (service role).
-- ============================================

-- Users: Allow anon select for admin panel user management
create policy "Users readable for admin panel" on public.users
  for select using (true);

-- Properties: Allow anon select for admin panel
create policy "Properties readable for admin panel" on public.properties
  for select using (true);

-- Bookings: Allow anon select for admin dashboard counts
create policy "Bookings readable for admin panel" on public.bookings
  for select using (true);

-- Reports: Allow anon select for admin dashboard
create policy "Reports readable for admin panel" on public.reports
  for select using (true);

-- Reviews: Allow anon select all (not just approved) for admin moderation
create policy "All reviews readable for admin panel" on public.reviews
  for select using (true);

-- Enquiries: Allow anon select for admin panel
create policy "Enquiries readable for admin panel" on public.enquiries
  for select using (true);

-- System Logs: Allow anon select for admin dashboard activity
create policy "System logs readable for admin panel" on public.system_logs
  for select using (true);

-- Notification Templates: Allow anon select for admin panel
create policy "Templates readable for admin panel" on public.notification_templates
  for select using (true);

-- Admin Roles: Allow anon select for admin panel
create policy "Roles readable for admin panel" on public.admin_roles
  for select using (true);

-- Blacklist: Allow anon select for admin panel
create policy "Blacklist readable for admin panel" on public.blacklist
  for select using (true);

-- Tenant Requirements: Allow anon select for admin panel
create policy "Requirements readable for admin panel" on public.tenant_requirements
  for select using (true);

-- User Subscriptions: Allow anon select for admin panel
create policy "Subscriptions readable for admin panel" on public.user_subscriptions
  for select using (true);

-- Contact Messages: Allow anon select for admin panel
create policy "Messages readable for admin panel" on public.contact_messages
  for select using (true);

-- Ad Bookings: Allow anon select for admin panel
create policy "Ad bookings readable for admin panel" on public.ad_bookings
  for select using (true);
