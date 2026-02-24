const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const https = require('https');

// Direct Supabase connection with service role key
const supabaseUrl = 'https://yapmbzzqahsyuxxdejpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcG1ienpxYWhzeXV4eGRlanBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU5Nzk5MCwiZXhwIjoyMDc4MTczOTkwfQ.jYYsxwRvg2B7ZCrn0rWykJnknwzeUUnAemSY5WLkhdk';

// Create admin client (bypasses all RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 ADVANCED PROPERTY CREATION TEST');
console.log('Using direct Supabase admin connection...');

async function testDirectPropertyCreation() {
  try {
    // Step 1: Login to get user ID
    console.log('\n1️⃣ Logging in to get user ID...');
    const loginResult = await loginUser();
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error);
      return;
    }
    
    const { userId, token } = loginResult;
    console.log('✅ Login successful! User ID:', userId);
    
    // Step 2: Create test image
    console.log('\n2️⃣ Creating test image...');
    const testImage = createTestImage();
    console.log('✅ Test image created (PNG, 68 bytes)');
    
    // Step 3: Upload image directly to Supabase Storage
    console.log('\n3️⃣ Uploading image to Supabase Storage...');
    const imageUrl = await uploadImageDirectly(testImage);
    if (!imageUrl) {
      console.error('❌ Image upload failed');
      return;
    }
    console.log('✅ Image uploaded successfully:', imageUrl);
    
    // Step 4: Create property directly in database
    console.log('\n4️⃣ Creating property in database...');
    const propertyResult = await createPropertyDirectly(userId, imageUrl);
    if (!propertyResult.success) {
      console.error('❌ Property creation failed:', propertyResult.error);
      return;
    }
    
    console.log('🎉 PROPERTY CREATED SUCCESSFULLY!');
    console.log('-----------------------------------');
    console.log('Property ID:', propertyResult.data.id);
    console.log('Title:', propertyResult.data.title);
    console.log('Price: ₹', propertyResult.data.price.toLocaleString());
    console.log('Images:', propertyResult.data.images);
    console.log('-----------------------------------');
    
    // Step 5: Verify via API
    console.log('\n5️⃣ Verifying via API...');
    await verifyViaAPI(token);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

async function loginUser() {
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
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
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

function createTestImage() {
  // 1x1 PNG image (68 bytes)
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE, 0xD4, 0xEF, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
}

async function uploadImageDirectly(imageBuffer) {
  try {
    const fileName = `properties/direct-test-${Date.now()}.png`;
    
    console.log('   📤 Uploading to bucket: property-images');
    console.log('   📁 File name:', fileName);
    
    const { data, error } = await supabaseAdmin.storage
      .from('property-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('   ❌ Upload error:', error);
      return null;
    }
    
    console.log('   ✅ Upload data:', data);
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('property-images')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('   💥 Upload exception:', error);
    return null;
  }
}

async function createPropertyDirectly(userId, imageUrl) {
  try {
    const propertyData = {
      title: 'DIRECT SUPABASE TEST PROPERTY',
      description: 'This property was created using direct Supabase connection, bypassing all middleware and RLS.',
      price: 12500000,
      property_type: 'Villa',
      transaction_type: 'Buy',
      location: 'Lucknow, Uttar Pradesh',
      area: 'Gomti Nagar Extension',
      size: 4000,
      bedrooms: 5,
      bathrooms: 4,
      owner_id: userId,
      owner_name: 'Test User',
      owner_phone: '9876543210',
      is_furnished: true,
      year_built: 2024,
      amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Gym', 'Club House'],
      images: [imageUrl],
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('   💾 Inserting into properties table...');
    console.log('   👤 Owner ID:', userId);
    console.log('   🏠 Property type:', propertyData.property_type);
    console.log('   💰 Price: ₹', propertyData.price.toLocaleString());
    
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert([propertyData])
      .select()
      .single();
    
    if (error) {
      console.error('   ❌ Database error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('   ✅ Property inserted successfully!');
    return { success: true, data };
    
  } catch (error) {
    console.error('   💥 Creation exception:', error);
    return { success: false, error: error.message };
  }
}

async function verifyViaAPI(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'champ-y6eg.onrender.com',
      port: 443,
      path: '/api/properties?limit=1',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success && result.data.length > 0) {
            const latestProperty = result.data[0];
            console.log('✅ API verification successful!');
            console.log('   📋 Latest property:', latestProperty.title);
            console.log('   🖼️  Images count:', latestProperty.images ? latestProperty.images.length : 0);
          } else {
            console.log('⚠️  API returned no properties');
          }
        } catch (e) {
          console.error('❌ API verification failed:', e.message);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error('❌ API request failed:', e.message);
      resolve();
    });
    req.end();
  });
}

// Run the test
testDirectPropertyCreation();
