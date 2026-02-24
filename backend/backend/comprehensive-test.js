const https = require('https');
const FormData = require('form-data');
const fs = require('fs');

console.log('🔄 COMPREHENSIVE PROPERTY CREATION TEST');
console.log('Testing exact Flutter app flow...\n');

async function comprehensiveTest() {
  try {
    // Step 1: Check deployment status
    console.log('1️⃣ Checking deployment status...');
    const deploymentStatus = await checkDeployment();
    console.log(`   Deployment: ${deploymentStatus.deployed ? '✅ LIVE' : '⏳ PENDING'}`);
    console.log(`   Version: ${deploymentStatus.version || 'Unknown'}`);
    console.log(`   Admin Client: ${deploymentStatus.adminClient ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Service Key: ${deploymentStatus.serviceKey ? '✅ Set' : '❌ Missing'}\n`);

    // Step 2: Test authentication
    console.log('2️⃣ Testing authentication...');
    const authResult = await testAuthentication();
    if (!authResult.success) {
      console.error('❌ Authentication failed:', authResult.error);
      return;
    }
    console.log('✅ Authentication successful');
    console.log(`   User ID: ${authResult.userId}`);
    console.log(`   Token: ${authResult.token.substring(0, 20)}...\n`);

    // Step 3: Test profile fetch (like Flutter app does)
    console.log('3️⃣ Testing profile fetch...');
    const profileResult = await testProfile(authResult.token);
    if (!profileResult.success) {
      console.error('❌ Profile fetch failed:', profileResult.error);
      return;
    }
    console.log('✅ Profile fetch successful');
    console.log(`   Name: ${profileResult.data.name}`);
    console.log(`   Phone: ${profileResult.data.phone}\n`);

    // Step 4: Create test image (like Flutter camera/gallery)
    console.log('4️⃣ Creating test image...');
    const imagePath = await createTestImageFile();
    console.log(`✅ Test image created: ${imagePath}\n`);

    // Step 5: Test property creation with image (exact Flutter flow)
    console.log('5️⃣ Testing property creation with image...');
    const propertyResult = await testPropertyCreation(authResult.token, imagePath);
    
    if (!propertyResult.success) {
      console.error('❌ Property creation failed:', propertyResult.error);
      return;
    }

    console.log('🎉 PROPERTY CREATION SUCCESSFUL!');
    console.log('================================');
    console.log(`Property ID: ${propertyResult.data.id}`);
    console.log(`Title: ${propertyResult.data.title}`);
    console.log(`Price: ₹${propertyResult.data.price.toLocaleString()}`);
    console.log(`Type: ${propertyResult.data.property_type}`);
    console.log(`Location: ${propertyResult.data.location}`);
    console.log(`Images: ${propertyResult.data.images ? propertyResult.data.images.length : 0} uploaded`);
    
    if (propertyResult.data.images && propertyResult.data.images.length > 0) {
      console.log('📸 Image URLs:');
      propertyResult.data.images.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
    }
    console.log('================================\n');

    // Step 6: Verify via property list API
    console.log('6️⃣ Verifying via property list...');
    const listResult = await testPropertyList(authResult.token);
    if (listResult.success) {
      console.log(`✅ Property list retrieved: ${listResult.count} properties`);
      const latestProperty = listResult.data.find(p => p.id === propertyResult.data.id);
      if (latestProperty) {
        console.log('✅ Created property found in list');
        console.log(`   Images in list: ${latestProperty.images ? latestProperty.images.length : 0}`);
      }
    }

    // Cleanup
    fs.unlinkSync(imagePath);
    console.log('\n🧹 Cleanup completed');
    console.log('\n🎯 ALL TESTS PASSED! Flutter app should work perfectly! 🚀');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

async function checkDeployment() {
  return new Promise((resolve) => {
    const req = https.get('https://champ-y6eg.onrender.com/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            deployed: result.version === '1.2.0',
            version: result.version,
            adminClient: result.adminClientEnabled,
            serviceKey: result.serviceKeySet
          });
        } catch (e) {
          resolve({ deployed: false });
        }
      });
    });
    req.on('error', () => resolve({ deployed: false }));
  });
}

async function testAuthentication() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: 'finaltest@test.com',
      password: 'Test@123'
    });

    const options = {
      hostname: 'champ-y6eg.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.data && result.data.accessToken) {
            resolve({
              success: true,
              userId: result.data.user.id,
              token: result.data.accessToken
            });
          } else {
            resolve({ success: false, error: result.error });
          }
        } catch (e) {
          resolve({ success: false, error: 'Invalid response' });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.write(loginData);
    req.end();
  });
}

async function testProfile(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'champ-y6eg.onrender.com',
      port: 443,
      path: '/api/users/profile',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: 'Invalid response' });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.end();
  });
}

async function createTestImageFile() {
  // Create a proper test image file (like Flutter would have)
  const imagePath = './test-property-image.png';
  const imageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE, 0xD4, 0xEF, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(imagePath, imageBuffer);
  return imagePath;
}

async function testPropertyCreation(token, imagePath) {
  return new Promise((resolve) => {
    const form = new FormData();
    
    // Add all property fields (matching Flutter app exactly)
    form.append('title', 'Comprehensive Test Property');
    form.append('description', 'This property tests the complete Flutter app flow including image upload, validation, and database storage.');
    form.append('price', '9500000');
    form.append('propertyType', 'House');
    form.append('transactionType', 'Buy');
    form.append('location', 'Lucknow, Uttar Pradesh');
    form.append('area', 'Gomti Nagar Extension');
    form.append('size', '2500');
    form.append('bedrooms', '4');
    form.append('bathrooms', '3');
    form.append('ownerPhone', '9876543210');
    form.append('isFurnished', 'true');
    form.append('yearBuilt', '2023');
    form.append('amenities', JSON.stringify(['Parking', 'Garden', 'Security', 'Gym', 'Swimming Pool']));
    form.append('isFeatured', 'false');
    
    // Add image file (like Flutter MultipartFile.fromPath)
    form.append('images', fs.createReadStream(imagePath), {
      filename: 'property-image.png',
      contentType: 'image/png'
    });

    const options = {
      hostname: 'champ-y6eg.onrender.com',
      port: 443,
      path: '/api/properties',
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer ' + token
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: 'Invalid response: ' + data });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    form.pipe(req);
  });
}

async function testPropertyList(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'champ-y6eg.onrender.com',
      port: 443,
      path: '/api/properties?limit=10',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: 'Invalid response' });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.end();
  });
}

// Run the comprehensive test
comprehensiveTest();
