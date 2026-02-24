const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// First login to get token
const loginData = JSON.stringify({email:'finaltest@test.com', password:'Test@123'});
const loginOptions = {
  hostname: 'champ-y6eg.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'Content-Length': loginData.length}
};

console.log('Logging in...');

const loginReq = https.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const j = JSON.parse(body);
    if (j.data && j.data.accessToken) {
      console.log('✅ Login successful!');
      testPropertyCreation(j.data.accessToken);
    } else {
      console.log('❌ Login failed:', j.error);
    }
  });
});
loginReq.write(loginData);
loginReq.end();

function testPropertyCreation(token) {
  console.log('Testing multipart property creation WITH IMAGE (using form-data)...');
  
  // Create a simple test image (1x1 PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE, 0xD4, 0xEF, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  // Use form-data package for proper multipart handling
  const form = new FormData();
  
  // Add text fields
  form.append('title', 'Luxury Apartment with Image Test');
  form.append('description', 'Modern 3BHK apartment with stunning views. Testing image upload functionality.');
  form.append('price', '8500000');
  form.append('propertyType', 'Apartment');
  form.append('transactionType', 'Buy');
  form.append('location', 'Lucknow, Uttar Pradesh');
  form.append('area', 'Hazratganj');
  form.append('size', '1800');
  form.append('bedrooms', '3');
  form.append('bathrooms', '2');
  form.append('ownerPhone', '9876543210');
  form.append('isFurnished', 'true');
  form.append('yearBuilt', '2023');
  form.append('amenities', JSON.stringify(['Lift', 'Parking', 'Security', 'Gym', 'Club House']));
  
  // Add image file
  form.append('images', testImageBuffer, {
    filename: 'test-property.png',
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
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
      console.log('Property Status:', res.statusCode);
      try {
        const result = JSON.parse(responseBody);
        if (result.success) {
          console.log('🎉 PROPERTY CREATED SUCCESSFULLY!');
          console.log('----------------------------');
          console.log('ID:', result.data.id);
          console.log('Title:', result.data.title);
          console.log('Price: ₹', result.data.price.toLocaleString());
          console.log('Type:', result.data.property_type);
          console.log('Location:', result.data.location);
          console.log('Area:', result.data.area);
          console.log('Size:', result.data.size, 'sq ft');
          console.log('Bedrooms:', result.data.bedrooms);
          console.log('Bathrooms:', result.data.bathrooms);
          console.log('Furnished:', result.data.is_furnished);
          console.log('Amenities:', result.data.amenities);
          console.log('Images:', result.data.images);
          console.log('----------------------------');
        } else {
          console.log('❌ Failed:', result.error);
          if (result.errors) console.log('Validation errors:', result.errors);
        }
      } catch(e) {
        console.log('Response:', responseBody);
      }
    });
  });
  
  req.on('error', (e) => console.error('Request error:', e.message));
  form.pipe(req);
}
