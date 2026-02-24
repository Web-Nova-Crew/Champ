/**
 * Full API Test with Supabase Admin User Creation
 */

const https = require('https');

const BASE_URL = 'champ-y6eg.onrender.com';
const SUPABASE_URL = 'yapmbzzqahsyuxxdejpq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcG1ienpxYWhzeXV4eGRlanBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU5Nzk5MCwiZXhwIjoyMDc4MTczOTkwfQ.jYYsxwRvg2B7ZCrn0rWykJnknwzeUUnAemSY5WLkhdk';

let authToken = null;
let testPropertyId = null;
let testBookingId = null;
let testChatId = null;

const results = { passed: 0, failed: 0, tests: [] };

function request(method, path, data = null, useAuth = false, host = BASE_URL, customHeaders = {}) {
  return new Promise((resolve) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(useAuth && authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...customHeaders
    };

    const options = { hostname: host, path, method, headers };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(30000, () => { req.destroy(); resolve({ status: 0, error: 'Timeout' }); });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result.success) {
      results.passed++;
      console.log(`✅ ${name}: ${result.message}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}: ${result.message}`);
    }
  } catch (e) {
    results.failed++;
    console.log(`❌ ${name}: ${e.message}`);
  }
}

async function createTestUserViaSupabase() {
  const email = `test${Date.now()}@estato.app`;
  const password = 'TestUser123!';
  
  console.log(`\n📧 Creating test user: ${email}\n`);
  
  // Create user via Supabase Admin API
  const res = await request('POST', '/auth/v1/admin/users', {
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { name: 'Test User', phone: '1234567890', userType: 'buyer' }
  }, false, SUPABASE_URL, {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
  });

  if (res.status === 200 && res.data?.id) {
    console.log(`✅ User created in Supabase: ${res.data.id}\n`);
    
    // Also create in users table
    await request('POST', '/rest/v1/users', {
      id: res.data.id,
      email: email,
      name: 'Test User',
      phone: '1234567890',
      user_type: 'buyer',
      created_at: new Date().toISOString()
    }, false, SUPABASE_URL, {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    });
    
    return { email, password, userId: res.data.id };
  } else {
    console.log(`⚠️ Could not create user via admin API: ${JSON.stringify(res.data)}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Full Backend API Test Suite\n');
  console.log('='.repeat(60) + '\n');

  // Health Check
  console.log('📋 HEALTH CHECK\n');
  await test('Health Endpoint', async () => {
    const res = await request('GET', '/health');
    return { success: res.status === 200, message: res.data?.message || `Status: ${res.status}` };
  });

  // Create test user via Supabase Admin
  const testUser = await createTestUserViaSupabase();
  
  if (testUser) {
    // Login
    console.log('📋 AUTHENTICATION\n');
    await test('Login', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      if (res.data?.data?.accessToken) {
        authToken = res.data.data.accessToken;
      }
      return { success: res.status === 200 && authToken, message: authToken ? 'Login successful, token received' : (res.data?.error || 'No token') };
    });

    if (authToken) {
      await test('Get Current User', async () => {
        const res = await request('GET', '/api/auth/me', null, true);
        return { success: res.status === 200, message: res.data?.success ? 'User retrieved' : res.data?.error };
      });

      // User Profile
      console.log('\n📋 USER PROFILE\n');
      await test('Get Profile', async () => {
        const res = await request('GET', '/api/users/profile', null, true);
        return { success: res.status === 200 || res.status === 404, message: res.data?.success ? 'Profile found' : 'Profile endpoint working' };
      });

      await test('Update Profile', async () => {
        const res = await request('PUT', '/api/users/profile', { name: 'Updated User', bio: 'Test bio' }, true);
        return { success: res.status === 200, message: res.data?.message || res.data?.error };
      });

      // Properties
      console.log('\n📋 PROPERTIES\n');
      await test('Get All Properties', async () => {
        const res = await request('GET', '/api/properties');
        if (res.data?.data?.[0]) testPropertyId = res.data.data[0].id;
        return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} properties` };
      });

      await test('Create Property', async () => {
        const res = await request('POST', '/api/properties', {
          title: 'Test Apartment',
          description: 'Beautiful test apartment',
          price: 25000,
          propertyType: 'Apartment',
          transactionType: 'Rent',
          location: 'Mumbai',
          area: 'Andheri',
          size: 850,
          bedrooms: 2,
          bathrooms: 1,
          amenities: '["WiFi", "Parking"]',
          isFurnished: 'true'
        }, true);
        if (res.data?.data?.id) testPropertyId = res.data.data.id;
        return { success: res.status === 201, message: res.data?.message || res.data?.error };
      });

      if (testPropertyId) {
        await test('Get Property by ID', async () => {
          const res = await request('GET', `/api/properties/${testPropertyId}`);
          return { success: res.status === 200, message: res.data?.success ? 'Property retrieved' : res.data?.error };
        });

        await test('Get Similar Properties', async () => {
          const res = await request('GET', `/api/properties/${testPropertyId}/similar`);
          return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} similar` };
        });

        // Favorites
        console.log('\n📋 FAVORITES\n');
        await test('Add to Favorites', async () => {
          const res = await request('POST', '/api/favorites', { propertyId: testPropertyId }, true);
          return { success: res.status === 201 || res.data?.success, message: res.data?.message || res.data?.error };
        });

        await test('Get Favorites', async () => {
          const res = await request('GET', '/api/favorites', null, true);
          return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} favorites` };
        });

        await test('Remove from Favorites', async () => {
          const res = await request('DELETE', `/api/favorites/${testPropertyId}`, null, true);
          return { success: res.status === 200, message: res.data?.message || 'Removed' };
        });

        // Bookings
        console.log('\n📋 BOOKINGS\n');
        await test('Create Booking', async () => {
          const res = await request('POST', '/api/bookings', {
            propertyId: testPropertyId,
            scheduledDate: '2025-12-15',
            scheduledTime: '14:00',
            notes: 'Test booking'
          }, true);
          if (res.data?.data?.id) testBookingId = res.data.data.id;
          return { success: res.status === 201, message: res.data?.message || res.data?.error };
        });

        await test('Get Bookings', async () => {
          const res = await request('GET', '/api/bookings', null, true);
          return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} bookings` };
        });

        if (testBookingId) {
          await test('Update Booking Status', async () => {
            const res = await request('PUT', `/api/bookings/${testBookingId}`, { status: 'confirmed' }, true);
            return { success: res.status === 200 || res.status === 403, message: res.data?.message || res.data?.error };
          });
        }
      }

      // Chats
      console.log('\n📋 CHATS\n');
      await test('Get Chats', async () => {
        const res = await request('GET', '/api/chats', null, true);
        return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} chats` };
      });

      // Notifications
      console.log('\n📋 NOTIFICATIONS\n');
      await test('Get Notifications', async () => {
        const res = await request('GET', '/api/notifications', null, true);
        return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} notifications` };
      });

      // Payments
      console.log('\n📋 PAYMENTS\n');
      await test('Get Payment History', async () => {
        const res = await request('GET', '/api/payments/history', null, true);
        return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} payments` };
      });

      // Logout
      console.log('\n📋 LOGOUT\n');
      await test('Logout', async () => {
        const res = await request('POST', '/api/auth/logout', null, true);
        return { success: res.status === 200, message: res.data?.message || 'Logged out' };
      });
    }
  } else {
    console.log('\n⚠️ Skipping auth tests - could not create test user\n');
    
    // Test public endpoints only
    console.log('📋 PUBLIC ENDPOINTS\n');
    await test('Get Properties', async () => {
      const res = await request('GET', '/api/properties');
      if (res.data?.data?.[0]) testPropertyId = res.data.data[0].id;
      return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} properties` };
    });

    if (testPropertyId) {
      await test('Get Property by ID', async () => {
        const res = await request('GET', `/api/properties/${testPropertyId}`);
        return { success: res.status === 200, message: 'Property retrieved' };
      });

      await test('Get Similar Properties', async () => {
        const res = await request('GET', `/api/properties/${testPropertyId}/similar`);
        return { success: res.status === 200, message: `Found ${res.data?.data?.length || 0} similar` };
      });
    }
  }

  // OTP Tests (always public)
  console.log('\n📋 OTP\n');
  await test('Send OTP', async () => {
    const res = await request('POST', '/api/otp/send', { email: 'test@test.com' });
    return { success: res.status === 200, message: res.data?.message || res.data?.error };
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL RESULTS\n');
  console.log('='.repeat(60));
  console.log(`\n  Total: ${results.passed + results.failed}`);
  console.log(`  ✅ Passed: ${results.passed}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log(`  📊 Pass Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

  if (results.passed > results.failed) {
    console.log('🎉 Backend is working well!\n');
  }
}

runTests().catch(console.error);
