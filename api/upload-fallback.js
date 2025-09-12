/**
 * Express.js fallback API for file uploads
 * Used for local development when Cloudflare Workers are not available
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/upload - Direct file upload
router.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const key = req.body.key || `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${req.file.originalname.split('.').pop()}`;
    const filePath = path.join(uploadsDir, key);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file to disk
    fs.writeFileSync(filePath, req.file.buffer);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${key}`;

    res.json({
      success: true,
      key: key,
      url: url
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// POST /api/upload/presigned-url - Generate presigned URL (mock for local dev)
router.post('/api/upload/presigned-url', (req, res) => {
  try {
    const { key, contentType } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Key is required'
      });
    }

    // For local development, return a mock presigned URL
    // In production, this would generate a real R2 presigned URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadUrl = `${baseUrl}/api/upload/direct/${key}`;

    res.json({
      uploadUrl: uploadUrl,
      key: key,
      success: true
    });

  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate presigned URL'
    });
  }
});

// PUT /api/upload/direct/:key - Direct upload via presigned URL
router.put('/api/upload/direct/:key', (req, res) => {
  try {
    const key = req.params.key;
    const filePath = path.join(uploadsDir, key);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Collect chunks
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(filePath, buffer);
      
      res.status(200).json({
        success: true,
        key: key
      });
    });

  } catch (error) {
    console.error('Direct upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// DELETE /api/upload/:key - Delete file
router.delete('/api/upload/:key', (req, res) => {
  try {
    const key = req.params.key;
    const filePath = path.join(uploadsDir, key);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Delete failed'
    });
  }
});

// GET /api/upload/info/:key - Get file info
router.get('/api/upload/info/:key', (req, res) => {
  try {
    const key = req.params.key;
    const filePath = path.join(uploadsDir, key);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        exists: false
      });
    }

    const stats = fs.statSync(filePath);
    
    res.json({
      exists: true,
      size: stats.size,
      lastModified: stats.mtime.toISOString()
    });

  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      exists: false,
      error: error.message || 'Failed to get file info'
    });
  }
});

module.exports = router;