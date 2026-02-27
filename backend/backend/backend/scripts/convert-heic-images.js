const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yapmbzzqahsyuxxdejpq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcG1ienpxYWhzeXV4eGRlanBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU5Nzk5MCwiZXhwIjoyMDc4MTczOTkwfQ.vYZ_1aBqGLKBXRLMYNYqKWZ5Uw6TuJILmNqGWZWnZnE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function convertHeicImages() {
  console.log('Starting HEIC to JPEG conversion...\n');

  try {
    // Fetch all properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, images');

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    console.log(`Found ${properties.length} properties to check\n`);

    let totalConverted = 0;
    let totalSkipped = 0;

    for (const property of properties) {
      if (!property.images || property.images.length === 0) {
        continue;
      }

      const heicImages = property.images.filter(img => 
        img.toLowerCase().endsWith('.heic') || img.toLowerCase().endsWith('.heif')
      );

      if (heicImages.length === 0) {
        totalSkipped++;
        continue;
      }

      console.log(`\n📝 Property: ${property.title} (${property.id})`);
      console.log(`   Found ${heicImages.length} HEIC images to convert`);

      const newImages = [...property.images];

      for (let i = 0; i < newImages.length; i++) {
        const imageUrl = newImages[i];
        
        if (!imageUrl.toLowerCase().endsWith('.heic') && !imageUrl.toLowerCase().endsWith('.heif')) {
          continue;
        }

        try {
          console.log(`   🔄 Converting: ${imageUrl.split('/').pop()}`);

          // Download the HEIC image
          const heicBuffer = await downloadImage(imageUrl);

          // Convert to JPEG
          const jpegBuffer = await sharp(heicBuffer)
            .jpeg({ quality: 90 })
            .toBuffer();

          // Upload new JPEG to Supabase Storage
          const fileName = `properties/${uuidv4()}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, jpegBuffer, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (uploadError) {
            console.error(`   ❌ Upload failed: ${uploadError.message}`);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);

          // Replace in array
          newImages[i] = urlData.publicUrl;
          console.log(`   ✅ Converted to: ${fileName}`);
          totalConverted++;

        } catch (convError) {
          console.error(`   ❌ Conversion failed: ${convError.message}`);
        }
      }

      // Update property with new image URLs
      const { error: updateError } = await supabase
        .from('properties')
        .update({ images: newImages })
        .eq('id', property.id);

      if (updateError) {
        console.error(`   ❌ Failed to update property: ${updateError.message}`);
      } else {
        console.log(`   💾 Updated property with ${newImages.length} images`);
      }
    }

    console.log('\n\n✨ Conversion complete!');
    console.log(`   Converted: ${totalConverted} images`);
    console.log(`   Skipped: ${totalSkipped} properties (no HEIC images)`);

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run the conversion
convertHeicImages().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
