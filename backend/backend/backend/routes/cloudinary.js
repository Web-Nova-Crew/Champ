const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwemwd97x',
  api_key: process.env.CLOUDINARY_API_KEY || '428678647785818',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'fkaDD0l-57IAebaiwZoEEAsK21k'
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `estato/${folder}`,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [
          { quality: 'auto', fetch_format: 'auto' }
        ] : undefined
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload single image
router.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'properties/images', 'image');
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

// Upload multiple images
router.post('/upload/images', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'properties/images', 'image')
    );

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      images: results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }))
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ error: 'Failed to upload images', details: error.message });
  }
});

// Upload video
router.post('/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'properties/videos', 'video');
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video', details: error.message });
  }
});

// Upload multiple videos
router.post('/upload/videos', upload.array('videos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files provided' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'properties/videos', 'video')
    );

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      videos: results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration
      }))
    });
  } catch (error) {
    console.error('Multiple videos upload error:', error);
    res.status(500).json({ error: 'Failed to upload videos', details: error.message });
  }
});

// Upload document (PDF, DOC, etc.)
router.post('/upload/document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file provided' });
    }

    const { title, type } = req.body;

    const result = await uploadToCloudinary(req.file.buffer, 'properties/documents', 'raw');
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      title: title || req.file.originalname,
      type: type || 'document',
      size: result.bytes
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
});

// Upload multiple documents
router.post('/upload/documents', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No document files provided' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'properties/documents', 'raw')
    );

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      documents: results.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        title: req.files[index].originalname,
        size: result.bytes
      }))
    });
  } catch (error) {
    console.error('Multiple documents upload error:', error);
    res.status(500).json({ error: 'Failed to upload documents', details: error.message });
  }
});

// Delete media by public ID
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query; // 'image', 'video', or 'raw'

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image'
    });

    res.json({
      success: result.result === 'ok',
      result: result.result
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media', details: error.message });
  }
});

// Get media info
router.get('/info/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType || 'image'
    });

    res.json({
      success: true,
      info: result
    });
  } catch (error) {
    console.error('Get media info error:', error);
    res.status(500).json({ error: 'Failed to get media info', details: error.message });
  }
});

module.exports = router;
