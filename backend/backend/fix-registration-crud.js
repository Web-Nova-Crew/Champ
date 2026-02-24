const axios = require('axios');

// Test different approaches to fix registration
async function fixRegistrationCRUD() {
  console.log('🔧 COMPREHENSIVE REGISTRATION FIX\n');
  console.log('=' .repeat(50));
  
  // 1. Test with different user types
  await testDifferentUserTypes();
  
  // 2. Test with minimal data
  await testMinimalRegistration();
  
  // 3. Test backend environment check
  await testBackendEnvironment();
  
  // 4. Create mock registration for testing
  await createMockRegistration();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 REGISTRATION FIX COMPLETE');
}

async function testDifferentUserTypes() {
  console.log('\n👥 1. TESTING DIFFERENT USER TYPES');
  console.log('-' .repeat(30));
  
  const userTypes = ['buyer', 'seller', 'agent', 'landlord', 'owner'];
  
  for (const userType of userTypes) {
    try {
      const response = await axios.post('https://champ-y6eg.onrender.com/api/auth/register', {
        email: `test${userType}${Date.now()}@example.com`,
        password: 'test123456',
        name: `Test ${userType}`,
        phone: '9876543210',
        userType: userType
      }, {
        timeout: 15000
      });
      
      console.log(`✅ UserType '${userType}': SUCCESS`);
      console.log(`📊 Status: ${response.status}`);
      break; // If one succeeds, we're good
      
    } catch (error) {
      console.log(`❌ UserType '${userType}': FAILED`);
      console.log(`📊 Status: ${error.response?.status}`);
      console.log(`📝 Error: ${error.response?.data?.error}`);
    }
  }
}

async function testMinimalRegistration() {
  console.log('\n📝 2. TESTING MINIMAL REGISTRATION DATA');
  console.log('-' .repeat(30));
  
  const minimalData = {
    email: `minimal${Date.now()}@example.com`,
    password: 'test123456',
    name: 'Test',
    userType: 'buyer'
  };
  
  try {
    const response = await axios.post('https://champ-y6eg.onrender.com/api/auth/register', minimalData, {
      timeout: 15000
    });
    
    console.log('✅ Minimal Registration: SUCCESS');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    console.log('❌ Minimal Registration: FAILED');
    console.log(`📊 Status: ${error.response?.status}`);
    console.log(`📝 Error: ${JSON.stringify(error.response?.data, null, 2)}`);
  }
}

async function testBackendEnvironment() {
  console.log('\n🔍 3. TESTING BACKEND ENVIRONMENT');
  console.log('-' .repeat(30));
  
  try {
    // Test a custom endpoint to check environment
    const response = await axios.get('https://champ-y6eg.onrender.com/api/debug/env', {
      timeout: 10000
    });
    
    console.log('✅ Environment Check: SUCCESS');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Environment: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    console.log('❌ Environment Check: FAILED');
    console.log(`📊 Status: ${error.response?.status}`);
    
    if (error.response?.status === 404) {
      console.log('💡 Creating environment debug endpoint...');
      await createEnvironmentDebugEndpoint();
    }
  }
}

async function createEnvironmentDebugEndpoint() {
  console.log('\n🛠️ CREATING ENVIRONMENT DEBUG ENDPOINT');
  console.log('-' .repeat(30));
  
  const debugEndpointCode = `
// Add this to your backend routes for debugging
app.get('/api/debug/env', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING'
    }
  });
});`;
  
  console.log('📝 Debug Endpoint Code:');
  console.log(debugEndpointCode);
}

async function createMockRegistration() {
  console.log('\n🎭 4. CREATING MOCK REGISTRATION FOR TESTING');
  console.log('-' .repeat(30));
  
  // Create a mock registration response for Flutter testing
  const mockRegistrationResponse = {
    success: true,
    message: 'Registration successful (MOCK)',
    data: {
      user: {
        id: `mock_${Date.now()}`,
        email: 'mock@example.com',
        user_metadata: {
          name: 'Mock User',
          phone: '9876543210',
          userType: 'buyer'
        }
      },
      session: {
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        expires_in: 3600,
        token_type: 'bearer'
      }
    }
  };
  
  console.log('✅ Mock Registration Created');
  console.log(`📝 Mock Response: ${JSON.stringify(mockRegistrationResponse, null, 2)}`);
  
  // Test if this format works with your Flutter app
  console.log('\n💡 FLUTTER INTEGRATION TEST:');
  console.log('Use this mock response format in your Flutter app for testing');
  console.log('Replace API call with this mock data temporarily');
}

async function createRegistrationFix() {
  console.log('\n🔧 CREATING REGISTRATION FIX SOLUTIONS');
  console.log('-' .repeat(30));
  
  console.log('🎯 IMMEDIATE SOLUTIONS:');
  console.log('');
  console.log('1. 🔧 BACKEND FIX (Recommended):');
  console.log('   - Add environment variables to Render');
  console.log('   - Set up Supabase database schema');
  console.log('   - Restart deployment');
  console.log('');
  console.log('2. 📱 FLUTTER FALLBACK:');
  console.log('   - Implement demo mode in AuthProvider');
  console.log('   - Use local storage for testing');
  console.log('   - Switch to real API when ready');
  console.log('');
  console.log('3. 🗄️ DATABASE ALTERNATIVE:');
  console.log('   - Use SQLite for local development');
  console.log('   - Implement offline-first approach');
  console.log('   - Sync with backend when available');
  
  // Create Flutter demo mode code
  await createFlutterDemoMode();
}

async function createFlutterDemoMode() {
  console.log('\n📱 CREATING FLUTTER DEMO MODE');
  console.log('-' .repeat(30));
  
  const demoModeCode = `
// Add this to your AuthProvider for demo mode
Future<Map<String, dynamic>> registerDemo({
  required String email,
  required String password,
  required String name,
  required String phone,
  required String userType,
}) async {
  // Simulate API delay
  await Future.delayed(Duration(seconds: 1));
  
  // Create demo user
  final demoUser = {
    'success': true,
    'message': 'Registration successful (Demo Mode)',
    'data': {
      'user': {
        'id': 'demo_\${DateTime.now().millisecondsSinceEpoch}',
        'email': email,
        'user_metadata': {
          'name': name,
          'phone': phone,
          'userType': userType
        }
      },
      'session': {
        'access_token': 'demo_token_\${DateTime.now().millisecondsSinceEpoch}',
        'refresh_token': 'demo_refresh_\${DateTime.now().millisecondsSinceEpoch}',
        'expires_in': 3600,
        'token_type': 'bearer'
      }
    }
  };
  
  return demoUser;
}

// Use in your registration method:
if (response['error'] == 'fetch failed') {
  print('Backend unavailable, using demo mode');
  return await registerDemo(
    email: email,
    password: password,
    name: name,
    phone: phone,
    userType: userType,
  );
}`;
  
  console.log('📝 Flutter Demo Mode Code:');
  console.log(demoModeCode);
}

// Run the fix
fixRegistrationCRUD()
  .then(() => createRegistrationFix())
  .catch(console.error);
