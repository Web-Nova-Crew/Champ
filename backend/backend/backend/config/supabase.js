const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for required environment variables with helpful error messages
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  
  console.error('❌ Missing Supabase configuration!');
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('📝 Please add these environment variables in Render Dashboard:');
  console.error('   1. Go to Render Dashboard → Your Service → Environment Tab');
  console.error('   2. Add SUPABASE_URL');
  console.error('   3. Add SUPABASE_ANON_KEY');
  console.error('   4. Add SUPABASE_SERVICE_ROLE_KEY (optional but recommended)');
  console.error('   5. Add JWT_SECRET');
  console.error('   6. Add ALLOWED_ORIGINS');
  console.error('   7. Add NODE_ENV=production');
  console.error('   8. Save and redeploy');
  
  throw new Error(`Missing required environment variables: ${missing.join(', ')}. Please configure them in Render Dashboard → Environment Variables.`);
}

// Client for user operations (uses anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (uses service role key)
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Log admin client status for debugging
if (supabaseAdmin) {
  console.log('✅ Supabase Admin client initialized (RLS bypass enabled)');
} else {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set - Admin client NOT available!');
  console.warn('   Property creation and user profile updates may fail due to RLS.');
  console.warn('   Add SUPABASE_SERVICE_ROLE_KEY to your environment variables.');
}

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseUrl,
};

